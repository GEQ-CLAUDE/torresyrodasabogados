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

  // Refs to avoid stale closures inside async streaming callbacks
  const abortRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadConversations();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveId(stored[0].id);
      activeIdRef.current = stored[0].id;
    }
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;

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
      setConversations((prev) => {
        const updated = [conv, ...prev];
        saveConversations(updated);
        return updated;
      });
      setActiveId(id);
      activeIdRef.current = id;
      return id;
    },
    []
  );

  const setActive = useCallback((id: string) => {
    setActiveId(id);
    activeIdRef.current = id;
    setStreamingContent("");
    setIsStreaming(false);
    setIsSearching(false);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversations(updated);
      return updated;
    });
    setActiveId((prev) => {
      if (prev !== id) return prev;
      // activate first remaining
      const remaining = conversations.filter((c) => c.id !== id);
      const next = remaining.length > 0 ? remaining[0].id : null;
      activeIdRef.current = next;
      return next;
    });
  }, [conversations]);

  const uploadFile = useCallback(async (file: File): Promise<void> => {
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        setUploadError((err as { error?: string }).error ?? "Error al subir el archivo");
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
      // Read current values via functional state updates to avoid stale closures
      const currentId = activeIdRef.current;
      if (!currentId) return;
      if (!content.trim() && pendingAttachments.length === 0) return;

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Capture attachments and clear queue
      const attachmentsSnapshot = [...pendingAttachments];
      setPendingAttachments([]);

      // Read the active conversation at send time
      let activeConv: Conversation | undefined;
      setConversations((prev) => {
        activeConv = prev.find((c) => c.id === currentId);
        return prev; // no change yet
      });

      // Small synchronous pause to let setConversations read complete
      await Promise.resolve();

      if (!activeConv) return;

      const userMessage: ChatMessage = {
        id: randomId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
        attachments: attachmentsSnapshot.length > 0 ? attachmentsSnapshot : undefined,
      };

      const messagesWithUser = [...activeConv.messages, userMessage];

      // Optimistically commit user message
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === currentId
            ? { ...c, messages: messagesWithUser, updatedAt: Date.now() }
            : c
        );
        saveConversations(updated);
        return updated;
      });

      setIsStreaming(true);
      setIsSearching(false);
      setStreamingContent("");

      try {
        const payload: ChatRequest = {
          messages: messagesWithUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          practiceArea: activeConv.practiceArea,
          locale: localeRef.current,
          attachments: userMessage.attachments,
        };

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assembled = "";
        const SEARCH_SIGNAL = "\x00SEARCHING\x00";
        let searching = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          if (chunk.includes(SEARCH_SIGNAL)) {
            if (!searching) {
              searching = true;
              setIsSearching(true);
            }
            const cleaned = chunk.replace(new RegExp(SEARCH_SIGNAL, "g"), "");
            if (cleaned) {
              assembled += cleaned;
              setStreamingContent(assembled);
            }
          } else {
            if (searching) {
              searching = false;
              setIsSearching(false);
            }
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

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === currentId
              ? {
                  ...c,
                  messages: [...messagesWithUser, assistantMessage],
                  updatedAt: Date.now(),
                }
              : c
          );
          saveConversations(updated);
          return updated;
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errorMessage: ChatMessage = {
            id: randomId(),
            role: "assistant",
            content:
              localeRef.current === "es"
                ? "Lo siento, ocurrió un error al procesar su consulta. Por favor, inténtelo nuevamente."
                : "Sorry, an error occurred while processing your query. Please try again.",
            timestamp: Date.now(),
          };
          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === currentId
                ? {
                    ...c,
                    messages: [...messagesWithUser, errorMessage],
                    updatedAt: Date.now(),
                  }
                : c
            );
            saveConversations(updated);
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        setIsSearching(false);
        setStreamingContent("");
      }
    },
    [pendingAttachments]
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
