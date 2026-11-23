import { describe, expect, it } from "vitest";
import { isBareUrl, youTubeId, youTubeThumbnails } from "./youtube";

describe("youTubeId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=-EBhCdycPOc", "-EBhCdycPOc"],
    ["https://youtube.com/watch?v=bASVM1LVSOI&t=42s", "bASVM1LVSOI"],
    ["https://m.youtube.com/watch?v=UhILMAhpxFQ", "UhILMAhpxFQ"],
    ["https://youtu.be/6TF_00jiivk?si=abc", "6TF_00jiivk"],
    ["https://www.youtube.com/shorts/epnPfe5am3I", "epnPfe5am3I"],
    ["https://www.youtube.com/embed/g0Iy2UNXHLc", "g0Iy2UNXHLc"],
    ["https://www.youtube.com/live/g0Iy2UNXHLc?feature=share", "g0Iy2UNXHLc"],
  ])("%s", (url, id) => expect(youTubeId(url)).toBe(id));

  it.each([
    "https://www.youtube.com/@somechannel",
    "https://www.youtube.com/playlist?list=PL123",
    "https://www.youtube.com/watch?v=short",
    "https://evil.com/watch?v=-EBhCdycPOc",
    "https://youtube.com.evil.com/watch?v=-EBhCdycPOc",
    "javascript:alert(1)",
    "/blog/x",
    "",
  ])("rejects %s", (url) => expect(youTubeId(url)).toBeNull());
});

describe("helpers", () => {
  it("thumbnails, best first", () => {
    expect(youTubeThumbnails("-EBhCdycPOc")).toEqual([
      "https://i.ytimg.com/vi/-EBhCdycPOc/maxresdefault.jpg",
      "https://i.ytimg.com/vi/-EBhCdycPOc/hqdefault.jpg",
    ]);
  });

  it("spots link text that is just a URL", () => {
    expect(isBareUrl("https://youtu.be/6TF_00jiivk")).toBe(true);
    expect(isBareUrl("QLoRA in Action: A Fine-Tuning Tutorial")).toBe(false);
  });
});
