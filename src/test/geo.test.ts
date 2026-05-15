import { describe, expect, it } from "vitest";
import { project, midPoint, rectangleAreaKm2, isLargeArea } from "@/utils/geo";

describe("geo utilities", () => {
  it("project: origin maps to (0, 0)", () => {
    const v = project(40.8, -73.95, 40.8, -73.95);
    expect(v.x).toBeCloseTo(0, 5);
    expect(v.y).toBeCloseTo(0, 5);
  });

  it("project: moving east yields +x", () => {
    const v = project(40.8, -73.94, 40.8, -73.95);
    expect(v.x).toBeGreaterThan(0);
  });

  it("project: moving north yields +y", () => {
    const v = project(40.81, -73.95, 40.8, -73.95);
    expect(v.y).toBeGreaterThan(0);
  });

  it("midPoint: averages coordinates", () => {
    const m = midPoint({ lat: 0, lng: 0 }, { lat: 10, lng: 20 });
    expect(m.lat).toBe(5);
    expect(m.lng).toBe(10);
  });

  it("rectangleAreaKm2: returns positive non-zero", () => {
    const a = rectangleAreaKm2(
      { lat: 40.83, lng: -73.88 },
      { lat: 40.8, lng: -73.95 }
    );
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(100);
  });

  it("isLargeArea: small region returns false", () => {
    expect(
      isLargeArea({ lat: 40.81, lng: -73.94 }, { lat: 40.8, lng: -73.95 }, 0.1)
    ).toBe(false);
  });

  it("isLargeArea: large region returns true", () => {
    expect(
      isLargeArea({ lat: 41.0, lng: -73.5 }, { lat: 40.8, lng: -73.95 }, 0.1)
    ).toBe(true);
  });
});
