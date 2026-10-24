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

  it("one huge notebook repo doesn't outweigh several Go repos", () => {
    const p = positionOf(
      repo("analysis", { "Jupyter Notebook": 50_000_000, Python: 200_000 }),
      repo("service", { Go: 100_000 }),
      repo("cli", { Go: 50_000 }),
    );
    expect(p).toMatchObject({ code: "BE", label: "Backend ST" });
  });

  it("karpathy-like: one huge generated-HTML repo + many Python/Jupyter repos is AI CAM", () => {
    const p = positionOf(
      repo("jobs", { HTML: 43_000_000, Python: 20_000 }, 2_000),
      repo("nanoGPT", { Python: 30_000 }, 40_000),
      repo("micrograd", { "Jupyter Notebook": 300_000, Python: 9_000 }, 12_000),
      repo("minGPT", { Python: 25_000 }, 23_000),
      repo("llm.c", { Cuda: 400_000, C: 200_000, Python: 80_000 }, 28_000),
      repo("nn-zero-to-hero", { "Jupyter Notebook": 2_000_000 }, 15_000),
      repo("char-rnn", { Lua: 30_000 }, 11_000),
      repo("convnetjs", { JavaScript: 900_000, HTML: 100_000 }, 11_000),
      repo("minbpe", { Python: 20_000 }, 9_000),
      repo("ulogme", { JavaScript: 60_000, Python: 20_000, HTML: 10_000 }, 1_000),
    );
    expect(p).toMatchObject({ code: "AI", label: "AI CAM" });
  });

  it("a starred repo counts more than an unstarred one", () => {
    const p = positionOf(repo("popular", { Go: 1_000 }, 10_000), repo("toy-a", { Python: 1_000 }), repo("toy-b", { Python: 1_000 }));
    // Go: 1 + log10(10001) ≈ 5 vs Python: 2
    expect(p.code).toBe("BE");
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
