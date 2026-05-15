import { beforeEach, describe, expect, it } from "vitest";
import { useToastStore } from "@/state/toastStore";
import { useSceneStore } from "@/state/sceneStore";

describe("toastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });
  it("adds a toast", () => {
    useToastStore.getState().push("hello", "success");
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe("hello");
  });
  it("removes a toast", () => {
    useToastStore.getState().push("hello");
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().remove(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

describe("sceneStore", () => {
  it("toggles time of day", () => {
    const initial = useSceneStore.getState().timeOfDay;
    useSceneStore.getState().toggleTimeOfDay();
    expect(useSceneStore.getState().timeOfDay).not.toBe(initial);
    useSceneStore.getState().toggleTimeOfDay();
    expect(useSceneStore.getState().timeOfDay).toBe(initial);
  });
  it("toggles a building category", () => {
    const before = useSceneStore
      .getState()
      .enabledCategories.has("residential");
    useSceneStore.getState().toggleCategory("residential");
    expect(useSceneStore.getState().enabledCategories.has("residential")).toBe(
      !before
    );
  });
});
