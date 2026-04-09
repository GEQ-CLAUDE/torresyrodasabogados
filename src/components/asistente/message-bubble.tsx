"use client";

import { useState, useCallback } from "react";
import { Copy, Check, FileText } from "lucide-react";
import type { ChatMessage } from "@/lib/ai-types";

interface Props {
  message: ChatMessage;
  locale: "es" | "en";
}

function formatRelativeTime(timestamp: number, locale: string): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === "es" ? "ahora" : "now";
  if (mins < 60)
    return locale === "es" ? `hace ${mins}m` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return locale === "es" ? `hace ${hrs}h` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return locale === "es" ? `hace ${days}d` : `${days}d ago`;
}

// Minimal markdown renderer: bold, headings, lists, blockquotes, links
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={key++} className="my-2 space-y-1 pl-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-white/85 text-sm leading-relaxed">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B5945A]" />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine;

    // Headings
    if (line.startsWith("## ")) {
      flushList();
      nodes.push(
        <h3
          key={key++}
          className="mt-4 mb-1 font-serif text-base font-semibold text-[#d4b47a] tracking-wide"
        >
          {line.slice(3)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      nodes.push(
        <h4
          key={key++}
          className="mt-3 mb-1 font-sans text-sm font-semibold text-white/90 uppercase tracking-widest"
        >
          {line.slice(4)}
        </h4>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      flushList();
      nodes.push(<hr key={key++} className="my-3 border-white/10" />);
      continue;
    }

    // Blockquote (disclaimer)
    if (line.startsWith("> ")) {
      flushList();
      nodes.push(
        <blockquote
          key={key++}
          className="my-3 border-l-2 border-[#B5945A]/50 pl-3 text-xs text-white/55 italic"
        >
          {line.slice(2)}
        </blockquote>
      );
      continue;
    }

    // Bullet list items
    if (line.match(/^[-*•]\s/) || line.match(/^[✅⚠️]/)) {
      const content = line.replace(/^[-*•]\s/, "").trim();
      listItems.push(content);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      nodes.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Regular paragraph
    flushList();
    nodes.push(
      <p
        key={key++}
        className="text-sm text-white/85 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
  }

  flushList();
  return nodes;
}

function inlineFormat(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Inline code / legal citations
    .replace(/`(.+?)`/g, '<code class="text-[#d4b47a] text-xs bg-white/10 px-1 rounded">$1</code>')
    // URLs
    .replace(
      /(https?:\/\/[^\s,)]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#B5945A] underline underline-offset-2 hover:text-[#d4b47a] transition-colors">$1</a>'
    );
}

export function MessageBubble({ message, locale }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div
        className={`
          relative max-w-[85%] rounded-lg px-4 py-3
          ${
            isUser
              ? "bg-[#354a62] text-white rounded-br-none"
              : "bg-white/[0.05] border-l-2 border-[#B5945A] rounded-bl-none"
          }
        `}
      >
        {/* Attached files */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {message.attachments.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-white/70"
              >
                <FileText size={12} className="shrink-0 text-[#B5945A]" />
                <span className="max-w-[160px] truncate">{f.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {isUser ? (
          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="space-y-0.5">
            {renderMarkdown(message.content)}
          </div>
        )}

        {/* Footer row */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] text-white/35">
            {formatRelativeTime(message.timestamp, locale)}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-white/40 opacity-0 transition-all hover:text-white/70 group-hover:opacity-100"
              title={locale === "es" ? "Copiar respuesta" : "Copy response"}
            >
              {copied ? (
                <>
                  <Check size={10} />
                  {locale === "es" ? "Copiado" : "Copied"}
                </>
              ) : (
                <>
                  <Copy size={10} />
                  {locale === "es" ? "Copiar" : "Copy"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
