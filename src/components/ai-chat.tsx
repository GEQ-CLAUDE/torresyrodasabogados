"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";

type Message = { role: "user" | "assistant"; content: string };

const LABELS = {
  es: {
    title: "Asistente Legal",
    placeholder: "Cuéntanos tu consulta...",
    send: "Enviar",
    welcome:
      "Hola, soy el asistente virtual de Torres & Rodas Abogados. ¿En qué área legal puedo orientarte hoy?",
    btn: "Consulta rápida",
    disclaimer: "Orientación inicial · No reemplaza asesoría legal",
  },
  en: {
    title: "Legal Assistant",
    placeholder: "Describe your legal question...",
    send: "Send",
    welcome:
      "Hello, I'm the Torres & Rodas Abogados virtual assistant. How can I help you today?",
    btn: "Quick inquiry",
    disclaimer: "Initial guidance · Not a substitute for legal advice",
  },
};

export function AiChat() {
  const rawLocale = useLocale();
  const locale: "es" | "en" = rawLocale in LABELS ? (rawLocale as "es" | "en") : "es";
  const L = LABELS[locale];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: L.welcome },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) throw new Error("Network error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const { text } = JSON.parse(payload);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + text,
              };
              return updated;
            });
          } catch {
            // malformed chunk — skip
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content:
            locale === "es"
              ? "Lo sentimos, ocurrió un error. Por favor contáctanos directamente."
              : "Sorry, an error occurred. Please contact us directly.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={L.btn}
        className="fixed bottom-8 left-8 z-[999] flex items-center gap-2 bg-navy-deep border border-gold/50 text-gold text-xs font-semibold tracking-[0.12em] uppercase px-4 py-3 hover:bg-gold hover:text-navy-deep transition-all shadow-lg"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        {L.btn}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={L.title}
          className="fixed bottom-24 left-8 z-[1000] w-[340px] max-w-[calc(100vw-2rem)] bg-navy-deep border border-gold/25 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-gold">
                {L.title}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="text-white/40 hover:text-white text-xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto p-4 flex flex-col gap-3 max-h-[340px] min-h-[200px]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm font-light leading-relaxed px-3 py-2 max-w-[85%] ${
                  m.role === "user"
                    ? "self-end bg-gold/10 text-white border border-gold/20"
                    : "self-start text-white/80"
                }`}
              >
                {m.content}
                {i === messages.length - 1 &&
                  streaming &&
                  m.role === "assistant" && (
                    <span className="inline-block w-1 h-3 ml-0.5 bg-gold animate-pulse align-middle" />
                  )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-1.5 border-t border-gold/10">
            <p className="text-[10px] text-white/25 tracking-wide">{L.disclaimer}</p>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gold/20 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={L.placeholder}
              disabled={streaming}
              className="flex-1 bg-white/[0.06] border border-gold/25 text-white text-sm px-3 py-2 font-light placeholder:text-white/30 focus:outline-none focus:border-gold disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              className="bg-gold text-navy-deep text-xs font-semibold tracking-[0.1em] uppercase px-3 py-2 hover:bg-gold-light disabled:opacity-40 transition-colors"
            >
              {L.send}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
