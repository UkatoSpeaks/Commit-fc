import { describe, expect, it } from "vitest";
import { aOrAn } from "./grammar";

describe("aOrAn", () => {
  it.each([80, 82, 89])("uses 'an' for %i", (n) => {
    expect(aOrAn(n)).toBe("an");
  });

  it.each([40, 65, 75, 79, 90, 99])("uses 'a' for %i", (n) => {
    expect(aOrAn(n)).toBe("a");
  });
});
