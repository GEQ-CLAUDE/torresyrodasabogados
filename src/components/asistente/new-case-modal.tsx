"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PRACTICE_AREAS } from "@/lib/ai-config";
import type { PracticeArea } from "@/lib/ai-types";

interface Props {
  locale: "es" | "en";
  onClose: () => void;
  onCreate: (caseRef: string, area: PracticeArea) => void;
}

export function NewCaseModal({ locale, onClose, onCreate }: Props) {
  const [caseRef, setCaseRef] = useState("");
  const [area, setArea] = useState<PracticeArea>("general");

  const isEs = locale === "es";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate(caseRef, area);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#1e2f42] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">
            {isEs ? "Nueva consulta" : "New consultation"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-white/40 transition-colors hover:text-white/80"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Case reference */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50">
              {isEs ? "Referencia del caso" : "Case reference"}
            </label>
            <input
              type="text"
              value={caseRef}
              onChange={(e) => setCaseRef(e.target.value)}
              placeholder={
                isEs
                  ? "Ej: Caso SRI 2024-0047, Contrato SERCOP..."
                  : "E.g.: SRI Case 2024-0047, SERCOP contract..."
              }
              className="
                w-full rounded-md border border-white/10 bg-white/[0.06]
                px-3 py-2.5 text-sm text-white placeholder-white/30
                outline-none transition-colors
                focus:border-[#B5945A]/50 focus:bg-white/[0.09]
              "
            />
          </div>

          {/* Practice area */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50">
              {isEs ? "Área de práctica" : "Practice area"}
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as PracticeArea)}
              className="
                w-full rounded-md border border-white/10 bg-[#1e2f42]
                px-3 py-2.5 text-sm text-white
                outline-none transition-colors
                focus:border-[#B5945A]/50
              "
            >
              {PRACTICE_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {isEs ? a.labelEs : a.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 rounded-md border border-white/10 py-2.5 text-sm
                text-white/60 transition-colors hover:text-white/80
              "
            >
              {isEs ? "Cancelar" : "Cancel"}
            </button>
            <button
              type="submit"
              className="
                flex-1 rounded-md bg-[#B5945A] py-2.5 text-sm font-medium
                text-[#1a2535] transition-colors hover:bg-[#d4b47a]
              "
            >
              {isEs ? "Iniciar consulta" : "Start consultation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
