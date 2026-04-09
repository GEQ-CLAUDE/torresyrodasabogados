"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { SuggestedPrompts } from "./suggested-prompts";
import { InputBar } from "./input-bar";
import { PRACTICE_AREAS } from "@/lib/ai-config";
import type { Conversation, ChatMessage, AttachedFile } from "@/lib/ai-types";
import { Scale } from "lucide-react";

interface Props {
  conversation: Conversation | null;
  streamingContent: string;
  isStreaming: boolean;
  isSearching: boolean;
  pendingAttachments: AttachedFile[];
  locale: "es" | "en";
  onSend: (content: string) => void;
  onAttach: (file: File) => Promise<void>;
  onRemoveAttachment: (id: string) => void;
  onNew: () => void;
}

export function ChatArea({
  conversation,
  streamingContent,
  isStreaming,
  isSearching,
  pendingAttachments,
  locale,
  onSend,
  onAttach,
  onRemoveAttachment,
  onNew,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEs = locale === "es";

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, streamingContent]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#1a2535]">
        <Scale size={40} className="mb-4 text-[#B5945A]/40" />
        <p className="font-serif text-2xl text-white/20">Torres & Rodas</p>
        <p className="mt-2 text-sm text-white/30">
          {isEs ? "Selecciona o crea una consulta para comenzar" : "Select or create a consultation to begin"}
        </p>
        <button
          onClick={onNew}
          className="mt-6 rounded-md bg-[#B5945A] px-5 py-2.5 text-sm font-medium text-[#1a2535] transition-colors hover:bg-[#d4b47a]"
        >
          {isEs ? "Nueva consulta" : "New consultation"}
        </button>
      </div>
    );
  }

  const areaMeta = PRACTICE_AREAS.find((a) => a.id === conversation.practiceArea);
  const areaLabel = areaMeta
    ? isEs
      ? areaMeta.labelEs
      : areaMeta.labelEn
    : conversation.practiceArea;

  const hasMessages = conversation.messages.length > 0;

  // Build full message list including streaming message
  const displayMessages: ChatMessage[] = [...conversation.messages];
  if (isStreaming && streamingContent) {
    displayMessages.push({
      id: "__streaming__",
      role: "assistant",
      content: streamingContent,
      timestamp: Date.now(),
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#1a2535]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-base font-semibold text-white">
            {conversation.caseRef}
          </h1>
          <p className="text-[11px] text-[#B5945A]">{areaLabel}</p>
        </div>
        <button
          onClick={onNew}
          className="
            shrink-0 rounded-md border border-white/10 px-3 py-1.5
            text-xs text-white/50 transition-colors hover:border-[#B5945A]/30
            hover:text-white/80
          "
        >
          {isEs ? "+ Nueva consulta" : "+ New query"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {!hasMessages && !isStreaming ? (
          <div className="flex h-full flex-col items-center justify-center">
            <SuggestedPrompts
              area={conversation.practiceArea}
              locale={locale}
              onSelect={onSend}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {displayMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} locale={locale} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <InputBar
        locale={locale}
        isStreaming={isStreaming}
        isSearching={isSearching}
        pendingAttachments={pendingAttachments}
        onSend={onSend}
        onAttach={onAttach}
        onRemoveAttachment={onRemoveAttachment}
      />
    </div>
  );
}
