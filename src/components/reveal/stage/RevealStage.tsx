"use client";

import dynamic from "next/dynamic";
import { Component, useState, type ComponentType, type ReactNode } from "react";
import { canUseWebGLStage } from "@/lib/motion/capabilities";
import { REVEAL, type StageProps } from "../reveal-config";
import { CssRays } from "./CssRays";

/**
 * Load the Three.js stage, but never wait longer than REVEAL.stageTimeoutMs.
 * A slow or failed download resolves to the CSS rays so the reveal is never blocked.
 */
function loadStage(): Promise<ComponentType<StageProps>> {
  let timer: number | undefined;
  const timeout = new Promise<ComponentType<StageProps>>((resolve) => {
    timer = window.setTimeout(() => resolve(CssRays), REVEAL.stageTimeoutMs);
  });
  const webgl = import("./StadiumStage").then((m) => m.StadiumStage);
  return Promise.race([webgl, timeout])
    .catch(() => CssRays)
    .finally(() => window.clearTimeout(timer));
}

const WebGLStage = dynamic(loadStage, { ssr: false, loading: () => null });

/** Falls back to the CSS rays if the WebGL scene throws (e.g. context creation fails). */
class StageBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Reveal background: Three.js when the device can handle it, CSS rays otherwise. */
export function RevealStage(props: StageProps) {
  // Decided once per reveal. Low-end, no-WebGL and reduced-motion devices never download Three.js.
  const [webgl] = useState(canUseWebGLStage);
  if (!webgl) return <CssRays {...props} />;
  return (
    <StageBoundary fallback={<CssRays {...props} />}>
      <WebGLStage {...props} />
    </StageBoundary>
  );
}
