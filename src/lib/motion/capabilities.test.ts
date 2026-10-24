import { describe, expect, it } from "vitest";
import { canUseWebGLStage, isLowEndDevice } from "./capabilities";

const nav = (hardwareConcurrency: number, deviceMemory?: number) =>
  ({ hardwareConcurrency, deviceMemory }) as Navigator & { deviceMemory?: number };

describe("isLowEndDevice", () => {
  it("flags 4 or fewer cores", () => {
    expect(isLowEndDevice(nav(4))).toBe(true);
    expect(isLowEndDevice(nav(2, 8))).toBe(true);
  });

  it("flags 4 GB or less of memory", () => {
    expect(isLowEndDevice(nav(8, 4))).toBe(true);
    expect(isLowEndDevice(nav(8, 2))).toBe(true);
  });

  it("allows capable devices, and browsers that hide memory", () => {
    expect(isLowEndDevice(nav(8, 8))).toBe(false);
    expect(isLowEndDevice(nav(10))).toBe(false);
  });
});

describe("canUseWebGLStage", () => {
  it("is false on the server", () => {
    expect(canUseWebGLStage()).toBe(false);
  });
});
