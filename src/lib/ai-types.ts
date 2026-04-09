export type PracticeArea =
  | "tributario"
  | "administrativo"
  | "publico"
  | "contraloria"
  | "consultoria"
  | "general";

export interface AttachedFile {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt";
  content: string; // extracted text
  size: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: AttachedFile[];
  isScenario?: boolean;
}

export interface Conversation {
  id: string;
  caseRef: string;
  practiceArea: PracticeArea;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface PracticeAreaMeta {
  id: PracticeArea;
  labelEs: string;
  labelEn: string;
  suggestedPromptsEs: string[];
  suggestedPromptsEn: string[];
}

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  practiceArea: PracticeArea;
  locale: "es" | "en";
  attachments?: AttachedFile[];
}
