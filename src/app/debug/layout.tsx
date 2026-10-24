import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

// Dev-only tools. Never indexed, and a 404 in production builds.
export const metadata: Metadata = {
  title: "Debug · Commit FC",
  robots: { index: false, follow: false },
};

export default function DebugLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
