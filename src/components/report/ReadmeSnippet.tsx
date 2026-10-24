"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cardClass } from "@/components/ui/styles";
import { badgeMarkdown } from "@/lib/ui/site";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts (e.g. testing on a phone over LAN).
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function ReadmeSnippet({ login }: { login: string }) {
  const snippet = badgeMarkdown(login);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onCopy() {
    if (!(await copyText(snippet))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className={`${cardClass} p-5 sm:p-6`} aria-labelledby="readme-title">
      <h2 id="readme-title" className="display text-2xl font-extrabold sm:text-3xl">
        Add to your GitHub README
      </h2>
      <div className="mt-4 flex items-stretch gap-2 rounded-2xl border border-line bg-surface-2 p-2">
        <code className="min-w-0 flex-1 self-center overflow-x-auto px-2 py-2 font-mono text-xs whitespace-nowrap text-muted">{snippet}</code>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy README snippet"}
          className="mono-label inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-line-strong px-3 text-xs text-text hover:border-muted"
        >
          {copied ? <Check size={16} className="text-accent" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="mono-label mt-3 text-[11px] text-dim">Live badge coming soon</p>
      <span className="sr-only" aria-live="polite">
        {copied ? "Snippet copied to clipboard" : ""}
      </span>
    </section>
  );
}
