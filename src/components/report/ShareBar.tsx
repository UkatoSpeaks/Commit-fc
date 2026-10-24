"use client";

import { Download, Swords } from "lucide-react";
import { LinkedInIcon, XIcon } from "@/components/ui/BrandIcons";
import { buttonClass } from "@/components/ui/styles";
import { useToast } from "@/components/ui/Toast";

/** Rendered now, wired up in the next step. */
export function ShareBar() {
  const { show, toast } = useToast();
  const soon = () => show("Coming soon");

  return (
    <div className="flex w-full flex-col gap-2">
      <button type="button" onClick={soon} className={buttonClass("primary", "w-full text-xl! font-extrabold")}>
        <Download size={18} aria-hidden="true" />
        Download card
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={soon} className={buttonClass("outline", "text-base!")}>
          <XIcon />
          Share on X
        </button>
        <button type="button" onClick={soon} aria-label="Share on LinkedIn" className={buttonClass("outline", "px-3! text-base!")}>
          <LinkedInIcon />
          <span className="min-[420px]:hidden">LinkedIn</span>
          <span className="hidden min-[420px]:inline">Share on LinkedIn</span>
        </button>
      </div>
      <button type="button" onClick={soon} className={buttonClass("dashed", "w-full")}>
        <Swords size={18} aria-hidden="true" />
        Challenge a friend
      </button>
      {toast}
    </div>
  );
}
