/**
 * Minimal Firestore client over the REST API, shaped like the slice of the
 * Admin SDK the handlers use (collection/doc/where/get, set/update/create/
 * delete, FieldValue.increment/serverTimestamp, batches and transactions),
 * so it runs on Cloudflare where firebase-admin can't.
 *
 * Values round-trip as plain JSON; timestamps come back as ISO strings.
 */

import { accessToken } from "./google.js";

// ── Field values ───────────────────────────────────────────────────────────

class FieldTransform {
  constructor(
    readonly kind: "increment" | "serverTimestamp",
    readonly by = 0,
  ) {}
}

export const FieldValue = {
  increment: (n: number) => new FieldTransform("increment", n),
  serverTimestamp: () => new FieldTransform("serverTimestamp"),
};

type FsValue = Record<string, unknown>;
type Data = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Data =>
  !!v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof FieldTransform);

export function encodeValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (isPlainObject(v)) return { mapValue: { fields: encodeFields(v) } };
  return { stringValue: String(v) };
}

export function encodeFields(data: Data): Record<string, FsValue> {
  const out: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(data))
    if (v !== undefined && !(v instanceof FieldTransform)) out[k] = encodeValue(v);
  return out;
}

export function decodeValue(v: FsValue): unknown {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return ((v.arrayValue as { values?: FsValue[] }).values ?? []).map(decodeValue);
  if ("mapValue" in v) return decodeFields((v.mapValue as { fields?: Record<string, FsValue> }).fields ?? {});
  if ("referenceValue" in v) return v.referenceValue;
  return Object.values(v)[0];
}

export function decodeFields(fields: Record<string, FsValue>): Data {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]));
}

/** Dotted field path, backtick-quoting segments that aren't simple identifiers. */
export const fieldPath = (segments: string[]) =>
  segments
    .map((s) => (/^[A-Za-z_][A-Za-z_0-9]*$/.test(s) ? s : `\`${s.replace(/[`\\]/g, "\\$&")}\``))
    .join(".");

/** Plain data (transforms removed), leaf paths for a merge mask, and the transforms. */
export function splitWrite(data: Data, prefix: string[] = []) {
  const plain: Data = {};
  const leaves: string[] = [];
  const transforms: FsValue[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    const path = [...prefix, k];
    if (v instanceof FieldTransform) {
      transforms.push(
        v.kind === "increment"
          ? { fieldPath: fieldPath(path), increment: encodeValue(v.by) }
          : { fieldPath: fieldPath(path), setToServerValue: "REQUEST_TIME" },
      );
    } else if (isPlainObject(v) && Object.keys(v).length) {
      const inner = splitWrite(v, path);
      if (Object.keys(inner.plain).length) plain[k] = inner.plain;
      leaves.push(...inner.leaves);
      transforms.push(...inner.transforms);
    } else {
      plain[k] = v;
      leaves.push(fieldPath(path));
    }
  }
  return { plain, leaves, transforms };
}

// ── Transport ──────────────────────────────────────────────────────────────

const project = () => {
  const p = process.env.FIREBASE_PROJECT_ID;
  if (!p) throw new Error("FIREBASE_PROJECT_ID is not configured");
  return p;
};
const root = () => `projects/${project()}/databases/(default)/documents`;
const api = (suffix: string) => `https://firestore.googleapis.com/v1/${root()}${suffix}`;

async function call(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken();
  return fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function ok<T>(res: Response, what: string): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Firestore ${what} failed (${res.status}): ${detail.slice(0, 300)}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

const autoId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

// ── Documents, queries, writes ─────────────────────────────────────────────

interface RawDoc {
  name: string;
  fields?: Record<string, FsValue>;
}

export class DocumentSnapshot {
  constructor(
    readonly ref: DocumentReference,
    private readonly fields: Data | null,
  ) {}
  get id() {
    return this.ref.id;
  }
  get exists() {
    return this.fields !== null;
  }
  data(): Data | undefined {
    return this.fields ?? undefined;
  }
  get(field: string): unknown {
    return this.fields?.[field];
  }
}

const snapshotOf = (raw: RawDoc) =>
  new DocumentSnapshot(
    new DocumentReference(raw.name.split("/documents/")[1]),
    decodeFields(raw.fields ?? {}),
  );

type Write = Record<string, unknown>;

function writeFor(ref: DocumentReference, data: Data, mode: "set" | "merge" | "update" | "create"): Write {
  const name = `${root()}/${ref.path}`;
  if (mode === "update") {
    // Admin SDK update(): each top-level key replaces that field.
    const { transforms } = splitWrite(data);
    const plainKeys = Object.keys(data).filter(
      (k) => data[k] !== undefined && !(data[k] instanceof FieldTransform),
    );
    return {
      update: { name, fields: encodeFields(Object.fromEntries(plainKeys.map((k) => [k, data[k]]))) },
      updateMask: { fieldPaths: plainKeys.map((k) => fieldPath([k])) },
      ...(transforms.length ? { updateTransforms: transforms } : {}),
      currentDocument: { exists: true },
    };
  }
  const { plain, leaves, transforms } = splitWrite(data);
  return {
    update: { name, fields: encodeFields(plain) },
    ...(mode === "merge" ? { updateMask: { fieldPaths: leaves } } : {}),
    ...(transforms.length ? { updateTransforms: transforms } : {}),
    ...(mode === "create" ? { currentDocument: { exists: false } } : {}),
  };
}

async function commit(writes: Write[], transaction?: string) {
  if (!writes.length && !transaction) return;
  await ok(
    await call(api(":commit"), {
      method: "POST",
      body: JSON.stringify({ writes, ...(transaction ? { transaction } : {}) }),
    }),
    "commit",
  );
}

async function fetchDoc(ref: DocumentReference, transaction?: string): Promise<DocumentSnapshot> {
  const qs = transaction ? `?transaction=${encodeURIComponent(transaction)}` : "";
  const res = await call(api(`/${ref.path}${qs}`));
  if (res.status === 404) return new DocumentSnapshot(ref, null);
  return snapshotOf(await ok<RawDoc>(res, `get ${ref.path}`));
}

type SetOptions = { merge?: boolean };

export class DocumentReference {
  constructor(readonly path: string) {}
  get id() {
    return this.path.split("/").pop()!;
  }
  collection(name: string) {
    return new CollectionReference(`${this.path}/${name}`);
  }
  get() {
    return fetchDoc(this);
  }
  set(data: Data, opts: SetOptions = {}) {
    return commit([writeFor(this, data, opts.merge ? "merge" : "set")]);
  }
  update(data: Data) {
    return commit([writeFor(this, data, "update")]);
  }
  create(data: Data) {
    return commit([writeFor(this, data, "create")]);
  }
  delete() {
    return commit([{ delete: `${root()}/${this.path}` }]);
  }
}

type Filter = [string, "==", unknown];

export class Query {
  constructor(
    protected readonly collectionPath: string,
    protected readonly filters: Filter[] = [],
    protected readonly max?: number,
  ) {}
  where(field: string, op: "==", value: unknown) {
    return new Query(this.collectionPath, [...this.filters, [field, op, value]], this.max);
  }
  limit(n: number) {
    return new Query(this.collectionPath, this.filters, n);
  }
  async get(): Promise<{ docs: DocumentSnapshot[]; empty: boolean; size: number }> {
    const parts = this.collectionPath.split("/");
    const collectionId = parts.pop()!;
    const parent = parts.length ? `/${parts.join("/")}` : "";
    const conds = this.filters.map(([f, , v]) => ({
      fieldFilter: { field: { fieldPath: fieldPath(f.split(".")) }, op: "EQUAL", value: encodeValue(v) },
    }));
    const structuredQuery = {
      from: [{ collectionId }],
      ...(conds.length
        ? { where: conds.length === 1 ? conds[0] : { compositeFilter: { op: "AND", filters: conds } } }
        : {}),
      ...(this.max ? { limit: this.max } : {}),
    };
    const rows = await ok<{ document?: RawDoc }[]>(
      await call(api(`${parent}:runQuery`), { method: "POST", body: JSON.stringify({ structuredQuery }) }),
      `query ${this.collectionPath}`,
    );
    const docs = rows.filter((r) => r.document).map((r) => snapshotOf(r.document!));
    return { docs, empty: docs.length === 0, size: docs.length };
  }
}

export class CollectionReference extends Query {
  constructor(readonly path: string) {
    super(path);
  }
  doc(id = autoId()) {
    return new DocumentReference(`${this.path}/${id}`);
  }
  async add(data: Data) {
    const ref = this.doc();
    await ref.create(data);
    return ref;
  }
}

export class WriteBatch {
  private writes: Write[] = [];
  set(ref: DocumentReference, data: Data, opts: SetOptions = {}) {
    this.writes.push(writeFor(ref, data, opts.merge ? "merge" : "set"));
    return this;
  }
  update(ref: DocumentReference, data: Data) {
    this.writes.push(writeFor(ref, data, "update"));
    return this;
  }
  create(ref: DocumentReference, data: Data) {
    this.writes.push(writeFor(ref, data, "create"));
    return this;
  }
  delete(ref: DocumentReference) {
    this.writes.push({ delete: `${root()}/${ref.path}` });
    return this;
  }
  commit() {
    return commit(this.writes);
  }
  /** @internal */
  take() {
    return this.writes;
  }
}

export class Transaction extends WriteBatch {
  constructor(private readonly id: string) {
    super();
  }
  get(ref: DocumentReference) {
    return fetchDoc(ref, this.id);
  }
}

export class Firestore {
  collection(name: string) {
    return new CollectionReference(name);
  }
  batch() {
    return new WriteBatch();
  }
  /** Read-then-write with server-side conflict detection; retried when aborted by contention. */
  async runTransaction<T>(fn: (tx: Transaction) => Promise<T>, attempts = 5): Promise<T> {
    for (let i = 1; ; i++) {
      const { transaction } = await ok<{ transaction: string }>(
        await call(api(":beginTransaction"), { method: "POST", body: "{}" }),
        "beginTransaction",
      );
      const tx = new Transaction(transaction);
      const result = await fn(tx);
      try {
        await commit(tx.take(), transaction);
        return result;
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (status !== 409 || i >= attempts) throw err;
      }
    }
  }
}
