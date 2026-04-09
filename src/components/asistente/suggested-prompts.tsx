"use client";

import { PRACTICE_AREAS } from "@/lib/ai-config";
import type { PracticeArea } from "@/lib/ai-types";

interface Props {
  area: PracticeArea;
  locale: "es" | "en";
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ area, locale, onSelect }: Props) {
  const meta = PRACTICE_AREAS.find((a) => a.id === area) ?? PRACTICE_AREAS[PRACTICE_AREAS.length - 1];
  const prompts = locale === "es" ? meta.suggestedPromptsEs : meta.suggestedPromptsEn;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <p className="mb-4 text-center text-xs font-medium tracking-[0.15em] uppercase text-white/35">
        {locale === "es" ? "Consultas frecuentes" : "Common queries"}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {prompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelect(prompt)}
            className="
              group rounded-lg border border-[#B5945A]/20 bg-white/[0.03]
              px-4 py-3 text-left text-sm text-white/60
              transition-all duration-200
              hover:border-[#B5945A]/50 hover:bg-white/[0.07] hover:text-white/85
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B5945A]
            "
          >
            <span className="line-clamp-2 leading-snug">{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
