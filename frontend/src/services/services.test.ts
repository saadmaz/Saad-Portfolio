import { beforeEach, describe, expect, it, vi } from "vitest";

// Replace the Firestore layer so services are tested in isolation.
vi.mock("@/lib/firestore", () => ({
  COLLECTIONS: { projects: "projects", blogPosts: "blog_posts" },
  fetchCollection: vi.fn(),
  fetchOrdered: vi.fn(),
  fetchById: vi.fn(),
  fetchFirstWhere: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({ where: vi.fn(), orderBy: vi.fn() }));

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

describe("BlogService.getBySlugOrId", () => {
  it("returns a published post found by slug", async () => {
    mocked.fetchFirstWhere.mockResolvedValue({ id: "1", slug: "hello", published: true });
    expect(await BlogService.getBySlugOrId("hello")).toMatchObject({ id: "1" });
    expect(mocked.fetchById).not.toHaveBeenCalled();
  });

  it("falls back to the document ID", async () => {
    mocked.fetchFirstWhere.mockResolvedValue(null);
    mocked.fetchById.mockResolvedValue({ id: "doc123", published: true });
    expect(await BlogService.getBySlugOrId("doc123")).toMatchObject({ id: "doc123" });
  });

  it("never returns drafts", async () => {
    mocked.fetchFirstWhere.mockResolvedValue({ id: "1", published: false });
    mocked.fetchById.mockResolvedValue({ id: "1", published: false });
    expect(await BlogService.getBySlugOrId("1")).toBeNull();
  });

  it("skips the ID lookup for values that can't be document IDs", async () => {
    mocked.fetchFirstWhere.mockResolvedValue(null);
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
