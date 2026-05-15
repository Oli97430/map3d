import { describe, expect, it } from "vitest";
import { classifyBuilding } from "@/types/overpass";

describe("classifyBuilding", () => {
  it("classifies residential", () => {
    expect(classifyBuilding({ building: "apartments" })).toBe("residential");
    expect(classifyBuilding({ building: "house" })).toBe("residential");
  });
  it("classifies commercial", () => {
    expect(classifyBuilding({ building: "office" })).toBe("commercial");
    expect(classifyBuilding({ building: "retail" })).toBe("commercial");
  });
  it("classifies industrial", () => {
    expect(classifyBuilding({ building: "factory" })).toBe("industrial");
  });
  it("classifies religious", () => {
    expect(classifyBuilding({ building: "church" })).toBe("religious");
  });
  it("falls back to other for unknown", () => {
    expect(classifyBuilding({ building: "yes" })).toBe("other");
    expect(classifyBuilding({})).toBe("other");
  });
});
