import { describe, expect, it } from "vitest";
import { eventPhotoAlt, eventPhotos } from "./imageAlt";

const event = {
  title: "48th Big Debate",
  organizer: "Isipathana College",
  location: "Colombo",
  role: "Host",
  images: ["a.jpg", "b.jpg"],
};

describe("eventPhotoAlt", () => {
  it("names the person, role, event and place", () => {
    expect(eventPhotoAlt(event, "a.jpg")).toBe(
      "Saad Mazhar hosting 48th Big Debate, Isipathana College, Colombo",
    );
  });

  it("numbers photos after the first", () => {
    expect(eventPhotoAlt(event, "b.jpg")).toMatch(/\(photo 2\)$/);
  });

  it("prefers a caption typed in admin", () => {
    expect(eventPhotoAlt({ ...event, imageCaptions: ["", "Opening speech"] }, "b.jpg")).toBe(
      "Opening speech",
    );
    expect(eventPhotoAlt({ ...event, imageCaptions: ["  ", ""] }, "a.jpg")).toMatch(/^Saad Mazhar hosting/);
  });

  it("skips an organiser the title already names", () => {
    expect(eventPhotoAlt({ ...event, title: "Isipathana College Big Debate" }, "a.jpg")).toBe(
      "Saad Mazhar hosting Isipathana College Big Debate, Colombo",
    );
  });
});

describe("eventPhotos", () => {
  it("falls back to the legacy single image", () => {
    expect(eventPhotos({ image: "c.jpg" })).toEqual(["c.jpg"]);
    expect(eventPhotos({})).toEqual([]);
  });
});
