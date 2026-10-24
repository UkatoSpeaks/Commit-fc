import { describe, expect, it } from "vitest";
import { repo } from "./__fixtures__/profile";
import { languageShares } from "./languages";
import { detectPosition } from "./position";

const positionOf = (...repos: ReturnType<typeof repo>[]) => detectPosition(languageShares(repos));

describe("detectPosition: one per position", () => {
  it("AI CAM for Python-dominant", () => {
    expect(positionOf(repo("ml", { Python: 800, Shell: 50 }))).toMatchObject({ code: "AI", label: "AI CAM" });
  });

  it("FE LW for frontend-dominant", () => {
    expect(positionOf(repo("web", { TypeScript: 700, CSS: 300 }))).toMatchObject({ code: "FE", label: "Frontend LW" });
  });

  it("BE ST for backend-dominant", () => {
    expect(positionOf(repo("api", { Go: 600, Rust: 300 }))).toMatchObject({ code: "BE", label: "Backend ST" });
  });

  it("OPS CB for infra-dominant", () => {
    expect(positionOf(repo("infra", { HCL: 500, Shell: 300, Dockerfile: 100 }))).toMatchObject({ code: "OPS", label: "DevOps CB" });
  });

  it("SYS CDM for C/C++-dominant", () => {
    expect(positionOf(repo("kernel", { C: 900, Assembly: 50 }))).toMatchObject({ code: "SYS", label: "Systems CDM" });
  });

  it("MOB RW for Swift/Dart-dominant", () => {
    expect(positionOf(repo("app", { Swift: 700, Dart: 200 }))).toMatchObject({ code: "MOB", label: "Mobile RW" });
  });

  it("FS CM for a true fullstack mix", () => {
    const p = positionOf(repo("app", { TypeScript: 35, Go: 30, Shell: 20, Python: 15 }));
    expect(p).toMatchObject({ code: "FS", label: "Fullstack CM" });
  });

  it("SUB GK with no repos", () => {
    expect(positionOf()).toMatchObject({ code: "SUB", label: "Substitute GK" });
  });

  it("SUB GK when repos have no language data", () => {
    expect(positionOf(repo("empty", {}), repo("docs", {}))).toMatchObject({ code: "SUB", label: "Substitute GK" });
  });

  it("SUB GK when only ungrouped languages exist", () => {
    expect(positionOf(repo("game", { Lua: 500, GDScript: 200 }))).toMatchObject({ code: "SUB" });
  });
});

describe("detectPosition: edge cases", () => {
  it("pure React dev (JS 30, TS 28, CSS 22, HTML 15) is FE LW, not fullstack", () => {
    const p = positionOf(repo("site", { JavaScript: 30, TypeScript: 28, CSS: 22, HTML: 15 }));
    expect(p).toMatchObject({ code: "FE", label: "Frontend LW" });
  });

  it("Python dev with one huge notebook but mostly Go is BE ST", () => {
    const p = positionOf(
      repo("analysis", { "Jupyter Notebook": 5_000_000, Python: 200_000 }),
      repo("service", { Go: 1_000_000 }),
    );
    expect(p).toMatchObject({ code: "BE", label: "Backend ST" });
  });

  it("top group wins when under 50% and fewer than 3 groups reach 15%", () => {
    const p = positionOf(repo("x", { Go: 45, TypeScript: 40, Shell: 10, Python: 5 }));
    expect(p.code).toBe("BE");
  });

  it("ignores ungrouped languages when computing group shares", () => {
    // Lua is huge but ungrouped; Go is 100% of grouped bytes.
    const p = positionOf(repo("x", { Lua: 10_000, Go: 100 }));
    expect(p.code).toBe("BE");
    expect(p.groupShares.BE).toBe(1);
  });

  it("Kotlin counts as backend without mobile signals", () => {
    expect(positionOf(repo("server", { Kotlin: 900, Java: 100 })).code).toBe("BE");
  });

  it("Kotlin counts as mobile when Swift or Dart is present", () => {
    expect(positionOf(repo("android", { Kotlin: 700 }), repo("ios", { Swift: 200 })).code).toBe("MOB");
  });
});
