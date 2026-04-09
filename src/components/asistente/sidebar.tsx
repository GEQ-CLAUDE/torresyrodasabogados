"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { PRACTICE_AREAS } from "@/lib/ai-config";
import type { Conversation } from "@/lib/ai-types";
import Image from "next/image";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  locale: "es" | "en";
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

function formatDate(timestamp: number, locale: string): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return locale === "es" ? "Hoy" : "Today";
  if (days === 1) return locale === "es" ? "Ayer" : "Yesterday";
  if (days < 7) return locale === "es" ? `Hace ${days} días` : `${days} days ago`;
  return new Date(timestamp).toLocaleDateString(locale === "es" ? "es-EC" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

export function Sidebar({
  conversations,
  activeId,
  locale,
  onSelect,
  onDelete,
  onNew,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const isEs = locale === "es";

  return (
    <div
      className={`
        relative flex h-full flex-col border-r border-white/[0.07] bg-[#1e2f42]
        transition-all duration-300
        ${collapsed ? "w-12" : "w-64"}
      `}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="
          absolute -right-3 top-16 z-10
          flex h-6 w-6 items-center justify-center
          rounded-full border border-white/10 bg-[#1e2f42]
          text-white/40 shadow-md transition-colors hover:text-white/80
        "
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {collapsed ? (
        /* Collapsed: just icons */
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center">
            <Scale size={18} className="text-[#B5945A]" />
          </div>
          <button
            onClick={onNew}
            className="rounded-md p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
            title={isEs ? "Nueva consulta" : "New consultation"}
          >
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-4">
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/images/nav-logo.png"
                alt="Torres & Rodas"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/80 tracking-wide">
                Torres & Rodas
              </p>
              <p className="text-[10px] text-[#B5945A] tracking-wider">
                {isEs ? "Asistente IA" : "AI Assistant"}
              </p>
            </div>
          </div>

          {/* New consultation button */}
          <div className="px-3 py-3">
            <button
              onClick={onNew}
              className="
                flex w-full items-center justify-center gap-2
                rounded-md bg-[#B5945A] px-3 py-2 text-xs font-medium
                text-[#1a2535] transition-colors hover:bg-[#d4b47a]
              "
            >
              <Plus size={14} />
              {isEs ? "Nueva consulta" : "New consultation"}
            </button>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {conversations.length === 0 ? (
              <p className="mt-4 text-center text-xs text-white/30">
                {isEs ? "Sin consultas activas" : "No active consultations"}
              </p>
            ) : (
              <div className="space-y-0.5">
                {conversations.map((conv) => {
                  const areaMeta = PRACTICE_AREAS.find((a) => a.id === conv.practiceArea);
                  const areaLabel = areaMeta
                    ? isEs
                      ? areaMeta.labelEs
                      : areaMeta.labelEn
                    : conv.practiceArea;
                  const isActive = conv.id === activeId;

                  return (
                    <div
                      key={conv.id}
                      className={`
                        group relative flex cursor-pointer items-start gap-2
                        rounded-md px-2 py-2 transition-colors
                        ${
                          isActive
                            ? "border-l-2 border-[#B5945A] bg-white/[0.08] pl-1.5"
                            : "border-l-2 border-transparent hover:bg-white/[0.05]"
                        }
                      `}
                      onClick={() => onSelect(conv.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-medium ${
                            isActive ? "text-white" : "text-white/70"
                          }`}
                        >
                          {conv.caseRef}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-white/35">
                          {areaLabel}
                        </p>
                        <p className="text-[10px] text-white/25">
                          {formatDate(conv.updatedAt, locale)}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="
                          mt-0.5 shrink-0 rounded p-0.5 text-white/0
                          transition-colors group-hover:text-white/30
                          hover:!text-red-400
                        "
                        title={isEs ? "Eliminar" : "Delete"}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.07] px-4 py-3">
            <p className="text-[10px] text-white/25 leading-relaxed">
              {isEs
                ? "Análisis informativo. No constituye asesoría legal formal."
                : "Informational analysis. Not formal legal advice."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
