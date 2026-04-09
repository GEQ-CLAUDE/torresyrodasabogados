"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Conversation,
  ChatMessage,
  AttachedFile,
  PracticeArea,
  ChatRequest,
} from "@/lib/ai-types";

const STORAGE_KEY = "trb_conversations";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function useConversations(locale: "es" | "en") {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<AttachedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadConversations();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveId(stored[0].id);
    }
  }, []);

  const persistAndSet = useCallback((updated: Conversation[]) => {
    setConversations(updated);
    saveConversations(updated);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const newConversation = useCallback(
    (caseRef: string, area: PracticeArea): string => {
      const id = randomId();
      const now = Date.now();
      const conv: Conversation = {
        id,
        caseRef: caseRef.trim() || "Consulta jurídica",
        practiceArea: area,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      persistAndSet([conv, ...conversations]);
      setActiveId(id);
      return id;
    },
    [conversations, persistAndSet]
  );

  const setActive = useCallback((id: string) => {
    setActiveId(id);
    setStreamingContent("");
    setIsStreaming(false);
    setIsSearching(false);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      const updated = conversations.filter((c) => c.id !== id);
      persistAndSet(updated);
      if (activeId === id) {
        setActiveId(updated.length > 0 ? updated[0].id : null);
      }
    },
    [conversations, persistAndSet, activeId]
  );

  const uploadFile = useCallback(async (file: File): Promise<void> => {
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        setUploadError(err.error ?? "Error al subir el archivo");
        return;
      }
      const attached: AttachedFile = await res.json();
      setPendingAttachments((prev) => [...prev, attached]);
    } catch {
      setUploadError("Error de conexión al subir el archivo");
    }
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!activeConversation || isStreaming) return;
      if (!content.trim() && pendingAttachments.length === 0) return;

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatMessage = {
        id: randomId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
        attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
      };

      // Optimistically add user message and clear attachments
      const messagesWithUser = [...activeConversation.messages, userMessage];
      const updatedConvs = conversations.map((c) =>
        c.id === activeId
          ? { ...c, messages: messagesWithUser, updatedAt: Date.now() }
          : c
      );
      persistAndSet(updatedConvs);
      setPendingAttachments([]);

      setIsStreaming(true);
      setIsSearching(false);
      setStreamingContent("");

      try {
        const payload: ChatRequest = {
          messages: messagesWithUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          practiceArea: activeConversation.practiceArea,
          locale,
          attachments: userMessage.attachments,
        };

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assembled = "";
        const SEARCH_SIGNAL = "\x00SEARCHING\x00";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          if (chunk.includes(SEARCH_SIGNAL)) {
            setIsSearching(true);
            // Strip the signal marker from displayed text
            const cleaned = chunk.replace(new RegExp(SEARCH_SIGNAL, "g"), "");
            if (cleaned) {
              assembled += cleaned;
              setStreamingContent(assembled);
            }
          } else {
            if (isSearching) setIsSearching(false);
            assembled += chunk;
            setStreamingContent(assembled);
          }
        }

        // Commit the assistant message
        const assistantMessage: ChatMessage = {
          id: randomId(),
          role: "assistant",
          content: assembled,
          timestamp: Date.now(),
        };

        const finalConvs = conversations.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...messagesWithUser, assistantMessage],
                updatedAt: Date.now(),
              }
            : c
        );
        // Re-read latest conversations to avoid stale closure
        setConversations((prev) => {
          const result = prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: [...messagesWithUser, assistantMessage],
                  updatedAt: Date.now(),
                }
              : c
          );
          saveConversations(result);
          return result;
        });
        void finalConvs; // suppress unused warning
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errorMessage: ChatMessage = {
            id: randomId(),
            role: "assistant",
            content:
              locale === "es"
                ? "Lo siento, ocurrió un error al procesar su consulta. Por favor, inténtelo nuevamente."
                : "Sorry, an error occurred while processing your query. Please try again.",
            timestamp: Date.now(),
          };
          setConversations((prev) => {
            const result = prev.map((c) =>
              c.id === activeId
                ? {
                    ...c,
                    messages: [...messagesWithUser, errorMessage],
                    updatedAt: Date.now(),
                  }
                : c
            );
            saveConversations(result);
            return result;
          });
        }
      } finally {
        setIsStreaming(false);
        setIsSearching(false);
        setStreamingContent("");
      }
    },
    [
      activeConversation,
      activeId,
      conversations,
      isStreaming,
      isSearching,
      locale,
      pendingAttachments,
      persistAndSet,
    ]
  );

  return {
    conversations,
    activeConversation,
    activeId,
    streamingContent,
    isStreaming,
    isSearching,
    pendingAttachments,
    uploadError,
    newConversation,
    setActive,
    deleteConversation,
    uploadFile,
    removeAttachment,
    sendMessage,
    clearUploadError: () => setUploadError(null),
  };
}
