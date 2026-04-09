"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useConversations } from "@/hooks/use-conversations";
import { Sidebar } from "@/components/asistente/sidebar";
import { ChatArea } from "@/components/asistente/chat-area";
import { NewCaseModal } from "@/components/asistente/new-case-modal";
import type { PracticeArea } from "@/lib/ai-types";

const ACCESS_CODE = process.env.NEXT_PUBLIC_ACCESS_CODE;

function AccessGate({
  locale,
  onUnlock,
}: {
  locale: "es" | "en";
  onUnlock: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const isEs = locale === "es";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      sessionStorage.setItem("trb_access", "1");
      onUnlock();
    } else {
      setError(true);
      setCode("");
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#1a2535]">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1e2f42] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="font-serif text-2xl font-semibold text-white">
            Torres & Rodas
          </p>
          <p className="mt-1 text-sm text-[#B5945A]">
            {isEs ? "Asistente Jurídico IA" : "AI Legal Assistant"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50">
              {isEs ? "Código de acceso" : "Access code"}
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              placeholder={isEs ? "Ingresa el código" : "Enter access code"}
              autoFocus
              className="
                w-full rounded-md border border-white/10 bg-white/[0.06]
                px-3 py-2.5 text-sm text-white placeholder-white/30
                outline-none focus:border-[#B5945A]/50
              "
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-400">
                {isEs ? "Código incorrecto. Intente nuevamente." : "Incorrect code. Please try again."}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-[#B5945A] py-2.5 text-sm font-medium text-[#1a2535] transition-colors hover:bg-[#d4b47a]"
          >
            {isEs ? "Acceder" : "Access"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AsistentePage() {
  const rawLocale = useLocale();
  const locale: "es" | "en" = rawLocale === "en" ? "en" : "es";

  // Access gate
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (!ACCESS_CODE) return true;
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("trb_access") === "1";
  });

  const [showNewModal, setShowNewModal] = useState(false);

  const {
    conversations,
    activeConversation,
    activeId,
    streamingContent,
    isStreaming,
    isSearching,
    pendingAttachments,
    newConversation,
    setActive,
    deleteConversation,
    uploadFile,
    removeAttachment,
    sendMessage,
  } = useConversations(locale);

  const handleCreate = useCallback(
    (caseRef: string, area: PracticeArea) => {
      newConversation(caseRef, area);
    },
    [newConversation]
  );

  const handleNew = useCallback(() => {
    setShowNewModal(true);
  }, []);

  if (!unlocked) {
    return <AccessGate locale={locale} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        locale={locale}
        onSelect={setActive}
        onDelete={deleteConversation}
        onNew={handleNew}
      />

      <ChatArea
        conversation={activeConversation}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
        isSearching={isSearching}
        pendingAttachments={pendingAttachments}
        locale={locale}
        onSend={sendMessage}
        onAttach={uploadFile}
        onRemoveAttachment={removeAttachment}
        onNew={handleNew}
      />

      {showNewModal && (
        <NewCaseModal
          locale={locale}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
