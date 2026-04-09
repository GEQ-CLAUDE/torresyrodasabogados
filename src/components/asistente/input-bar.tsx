"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Zap, X, FileText, Loader2 } from "lucide-react";
import type { AttachedFile } from "@/lib/ai-types";

interface Props {
  locale: "es" | "en";
  isStreaming: boolean;
  isSearching: boolean;
  pendingAttachments: AttachedFile[];
  onSend: (content: string) => void;
  onAttach: (file: File) => Promise<void>;
  onRemoveAttachment: (id: string) => void;
  disabled?: boolean;
}

export function InputBar({
  locale,
  isStreaming,
  isSearching,
  pendingAttachments,
  onSend,
  onAttach,
  onRemoveAttachment,
  disabled = false,
}: Props) {
  const [value, setValue] = useState("");
  const [scenarioMode, setScenarioMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEs = locale === "es";
  const isDisabled = disabled || isStreaming;

  const scenarioPrefix = isEs
    ? "MODO ESCENARIO: Simula el siguiente escenario legal y analiza posibles resultados con base en la jurisprudencia y normativa ecuatoriana: "
    : "SCENARIO MODE: Simulate the following legal scenario and analyse possible outcomes based on Ecuadorian jurisprudence and legislation: ";

  const handleSubmit = useCallback(() => {
    const text = value.trim();
    if (!text && pendingAttachments.length === 0) return;
    if (isDisabled) return;

    const finalContent = scenarioMode && text ? `${scenarioPrefix}${text}` : text;
    onSend(finalContent);
    setValue("");
    setScenarioMode(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, pendingAttachments.length, isDisabled, scenarioMode, scenarioPrefix, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onAttach(file);
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSend = (value.trim().length > 0 || pendingAttachments.length > 0) && !isDisabled;

  return (
    <div className="border-t border-white/[0.07] bg-[#1a2535] px-4 py-3">
      {/* Pending attachments */}
      {pendingAttachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {pendingAttachments.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-1.5 rounded-md border border-[#B5945A]/30 bg-white/[0.05] px-2 py-1"
            >
              <FileText size={12} className="shrink-0 text-[#B5945A]" />
              <span className="max-w-[140px] truncate text-xs text-white/70">{f.name}</span>
              <button
                onClick={() => onRemoveAttachment(f.id)}
                className="ml-0.5 text-white/40 transition-colors hover:text-white/70"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scenario mode badge */}
      {scenarioMode && (
        <div className="mb-2 flex items-center gap-1.5 rounded-md border border-[#B5945A]/40 bg-[#B5945A]/10 px-2.5 py-1.5">
          <Zap size={12} className="text-[#B5945A]" />
          <span className="text-xs text-[#B5945A]">
            {isEs ? "Modo simulación activo" : "Simulation mode active"}
          </span>
          <button
            onClick={() => setScenarioMode(false)}
            className="ml-auto text-[#B5945A]/60 hover:text-[#B5945A]"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Search indicator */}
      {isSearching && (
        <div className="mb-2 flex items-center gap-2 text-xs text-[#B5945A]">
          <Loader2 size={12} className="animate-spin" />
          {isEs ? "Buscando en fuentes jurídicas ecuatorianas..." : "Searching Ecuadorian legal sources..."}
        </div>
      )}

      {/* Streaming indicator */}
      {isStreaming && !isSearching && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-white/40">
          <span className="inline-flex gap-0.5">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
          </span>
          {isEs ? "Analizando..." : "Analysing..."}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled || uploading}
          className="
            shrink-0 rounded-md p-2 text-white/40 transition-colors
            hover:bg-white/[0.07] hover:text-white/70
            disabled:cursor-not-allowed disabled:opacity-40
          "
          title={isEs ? "Adjuntar documento (PDF, DOCX, TXT)" : "Attach document (PDF, DOCX, TXT)"}
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Scenario mode toggle */}
        <button
          onClick={() => setScenarioMode((v) => !v)}
          disabled={isDisabled}
          className={`
            shrink-0 rounded-md p-2 transition-colors
            disabled:cursor-not-allowed disabled:opacity-40
            ${
              scenarioMode
                ? "text-[#B5945A]"
                : "text-white/40 hover:bg-white/[0.07] hover:text-white/70"
            }
          `}
          title={isEs ? "Simular escenario legal" : "Simulate legal scenario"}
        >
          <Zap size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={1}
          placeholder={
            isDisabled && isStreaming
              ? isEs ? "Esperando respuesta..." : "Waiting for response..."
              : isEs
              ? "Describe tu consulta o sube un documento..."
              : "Describe your legal query or upload a document..."
          }
          className="
            min-h-[40px] flex-1 resize-none rounded-md border border-white/10
            bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-white/30
            outline-none transition-colors
            focus:border-[#B5945A]/40 focus:bg-white/[0.09]
            disabled:cursor-not-allowed disabled:opacity-60
          "
          style={{ maxHeight: "160px" }}
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          className="
            shrink-0 rounded-md bg-[#B5945A] p-2.5 text-[#1a2535]
            transition-all hover:bg-[#d4b47a]
            disabled:cursor-not-allowed disabled:opacity-40
          "
          title={isEs ? "Enviar (Enter)" : "Send (Enter)"}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Hint */}
      <p className="mt-1.5 text-center text-[10px] text-white/25">
        {isEs
          ? "Enter para enviar · Shift+Enter nueva línea"
          : "Enter to send · Shift+Enter for new line"}
      </p>
    </div>
  );
}
