import { beforeEach, describe, expect, it, vi } from "vitest";

// Replace the Firestore layer so services are tested in isolation.
vi.mock("@/lib/firestore", () => ({
  COLLECTIONS: { projects: "projects", blogPosts: "blog_posts" },
  fetchCollection: vi.fn(),
  fetchOrdered: vi.fn(),
  fetchById: vi.fn(),
  fetchFirstWhere: vi.fn(),
  fetchFirst: vi.fn(),
  // Filters as plain tuples, so assertions read like the query.
  where: vi.fn((...args: unknown[]) => args),
}));

import * as firestore from "@/lib/firestore";
import { BlogService } from "./blog-service";
import { ProjectService, isPublished } from "./project-service";
import { ContactService } from "./contact-service";

const mocked = vi.mocked(firestore);

beforeEach(() => vi.clearAllMocks());

describe("isPublished", () => {
  it("treats a missing flag as published (legacy docs)", () => {
    expect(isPublished({})).toBe(true);
    expect(isPublished({ published: true })).toBe(true);
    expect(isPublished({ published: false })).toBe(false);
  });
});

describe("ProjectService", () => {
  it("getAll drops unpublished projects", async () => {
    mocked.fetchOrdered.mockResolvedValue([
      { id: "a" },
      { id: "b", published: false },
      { id: "c", published: true },
    ]);
    const ids = (await ProjectService.getAll()).map((p) => p.id);
    expect(ids).toEqual(["a", "c"]);
    expect(mocked.fetchOrdered).toHaveBeenCalledWith("projects", "order_index");
  });

  it("getBySlug hides an unpublished project", async () => {
    mocked.fetchFirstWhere.mockResolvedValue({ id: "x", published: false });
    expect(await ProjectService.getBySlug("x")).toBeNull();
  });

  it("propagates Firestore errors instead of returning []", async () => {
    mocked.fetchOrdered.mockRejectedValue(new Error("offline"));
    await expect(ProjectService.getAll()).rejects.toThrow("offline");
  });
});

describe("BlogService.getPublished", () => {
  it("leaves unlisted posts out of listings", async () => {
    mocked.fetchCollection.mockResolvedValue([
      { id: "a", published: true },
      { id: "b", published: true, unlisted: true },
      { id: "c", published: true, unlisted: false },
    ]);
    expect((await BlogService.getPublished()).map((p) => p.id)).toEqual(["a", "c"]);
  });

  it("asks Firestore for listed posts only, so unlisted content never reaches the browser", async () => {
    mocked.fetchCollection.mockResolvedValue([]);
    await BlogService.getPublished();
    expect(mocked.fetchCollection).toHaveBeenLastCalledWith(
      "blog_posts",
      ["published", "==", true],
      ["unlisted", "==", false],
    );
  });

  it("sorts newest first by publication date", async () => {
    mocked.fetchCollection.mockResolvedValue([
      { id: "old", published: true, unlisted: false, date: "2025-01-01T00:00:00Z" },
      {
        id: "new",
        published: true,
        unlisted: false,
        date: "2025-03-01T00:00:00Z",
        publishedAt: "2025-03-01T00:00:00Z",
      },
    ]);
    expect((await BlogService.getPublished()).map((p) => p.id)).toEqual(["new", "old"]);
  });
});

describe("BlogService.getBySlugOrId", () => {
  it("only queries published posts by slug (required by the Firestore rules)", async () => {
    mocked.fetchFirst.mockResolvedValue({ id: "1", slug: "hello", published: true });
    await BlogService.getBySlugOrId("hello");
    expect(mocked.fetchFirst).toHaveBeenCalledWith(
      "blog_posts",
      ["slug", "==", "hello"],
      ["published", "==", true],
    );
  });

  it("returns an unlisted post to someone with the link", async () => {
    mocked.fetchFirst.mockResolvedValue({ id: "1", slug: "secret", published: true, unlisted: true });
    expect(await BlogService.getBySlugOrId("secret")).toMatchObject({ id: "1" });
  });

  it("returns a published post found by slug", async () => {
    mocked.fetchFirst.mockResolvedValue({ id: "1", slug: "hello", published: true });
    expect(await BlogService.getBySlugOrId("hello")).toMatchObject({ id: "1" });
    expect(mocked.fetchById).not.toHaveBeenCalled();
  });

  it("falls back to the document ID", async () => {
    mocked.fetchFirst.mockResolvedValue(null);
    mocked.fetchById.mockResolvedValue({ id: "doc123", published: true });
    expect(await BlogService.getBySlugOrId("doc123")).toMatchObject({ id: "doc123" });
  });

  it("never returns drafts", async () => {
    mocked.fetchFirst.mockResolvedValue(null);
    mocked.fetchById.mockResolvedValue({ id: "1", published: false });
    expect(await BlogService.getBySlugOrId("1")).toBeNull();
  });

  it("treats a rules denial (unpublished doc) as not found", async () => {
    mocked.fetchFirst.mockResolvedValue(null);
    mocked.fetchById.mockRejectedValue(Object.assign(new Error("denied"), { code: "permission-denied" }));
    expect(await BlogService.getBySlugOrId("draft-id")).toBeNull();
  });

  it("still propagates other errors", async () => {
    mocked.fetchFirst.mockResolvedValue(null);
    mocked.fetchById.mockRejectedValue(Object.assign(new Error("offline"), { code: "unavailable" }));
    await expect(BlogService.getBySlugOrId("x")).rejects.toThrow("offline");
  });

  it("skips the ID lookup for values that can't be document IDs", async () => {
    mocked.fetchFirst.mockResolvedValue(null);
    expect(await BlogService.getBySlugOrId("a/b")).toBeNull();
    expect(mocked.fetchById).not.toHaveBeenCalled();
  });
});

describe("ContactService.submit", () => {
  const payload = { name: "Ada", email: "ada@example.com", message: "Hello there, world!" };

  it("posts JSON to /api/contact", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })));
    vi.stubGlobal("fetch", fetchMock);
    await ContactService.submit(payload);
    expect(fetchMock).toHaveBeenCalledWith("/api/contact", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(payload);
  });

  it("throws the server's error message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ error: "Too many messages" }), { status: 429 })),
    );
    await expect(ContactService.submit(payload)).rejects.toThrow("Too many messages");
  });

  it("falls back to a status message when the body isn't JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("oops", { status: 502 })));
    await expect(ContactService.submit(payload)).rejects.toThrow("Request failed (502)");
  });
});
