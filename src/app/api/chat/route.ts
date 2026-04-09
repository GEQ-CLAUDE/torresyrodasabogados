import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/ai-config";
import type { ChatRequest, AttachedFile } from "@/lib/ai-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CONTEXT_MESSAGES = 20;
const MAX_TOOL_ITERATIONS = 5;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "web_search",
    description:
      "Busca en internet legislación ecuatoriana reciente, circulares del SRI, resoluciones de la Contraloría, actualizaciones del SERCOP, jurisprudencia de la Corte Nacional o la Corte Constitucional, y casos similares. Usa esta herramienta siempre que el abogado pregunte sobre normativa reciente, casos análogos o actualizaciones legales.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Consulta de búsqueda en español, optimizada para fuentes jurídicas ecuatorianas. Incluye términos legales precisos.",
        },
        source_hint: {
          type: "string",
          description:
            "Dominio preferido (opcional). Ej: sri.gob.ec, contraloria.gob.ec, registro-oficial.gob.ec, sercop.gob.ec",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "read_url",
    description:
      "Lee el contenido completo de una URL específica de una fuente jurídica ecuatoriana (Registro Oficial, SRI, Contraloría, SERCOP, Función Judicial, Corte Constitucional). Úsala para leer una resolución, circular o artículo en detalle.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "URL completa del documento o artículo a leer",
        },
      },
      required: ["url"],
    },
  },
];

async function executeWebSearch(query: string, sourceHint?: string): Promise<string> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return "Búsqueda web no disponible: BRAVE_SEARCH_API_KEY no configurada.";
  }

  const fullQuery = sourceHint ? `site:${sourceHint} ${query}` : query;
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(fullQuery)}&count=5&country=ec&search_lang=es`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!res.ok) return `Error en búsqueda (${res.status}): ${res.statusText}`;

    const data = await res.json();
    const results = (data.web?.results ?? []) as Array<{
      title: string;
      url: string;
      description?: string;
    }>;

    if (results.length === 0) return "No se encontraron resultados para esta búsqueda.";

    return results
      .map((r) => `**${r.title}**\nURL: ${r.url}\n${r.description ?? ""}`)
      .join("\n\n---\n\n");
  } catch (err) {
    return `Error ejecutando búsqueda: ${err instanceof Error ? err.message : "Error desconocido"}`;
  }
}

async function executeReadUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TorresRodasBot/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return `No se pudo acceder a la URL (${res.status})`;

    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, 6000);
  } catch (err) {
    return `Error leyendo URL: ${err instanceof Error ? err.message : "Error desconocido"}`;
  }
}

async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<string> {
  if (name === "web_search") return executeWebSearch(input.query, input.source_hint);
  if (name === "read_url") return executeReadUrl(input.url);
  return "Herramienta no reconocida";
}

function buildMessagesWithAttachments(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  attachments: AttachedFile[]
): Anthropic.MessageParam[] {
  if (attachments.length === 0) return messages as Anthropic.MessageParam[];

  const result = [...messages] as Array<{ role: "user" | "assistant"; content: string }>;
  const lastIdx = result.length - 1;
  const attachmentText = attachments
    .map(
      (f) =>
        `\n\n=== DOCUMENTO ADJUNTO: ${f.name} (${f.type.toUpperCase()}) ===\n${f.content}\n=== FIN DEL DOCUMENTO ===`
    )
    .join("\n");

  result[lastIdx] = {
    ...result[lastIdx],
    content: result[lastIdx].content + attachmentText,
  };
  return result as Anthropic.MessageParam[];
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const { practiceArea, locale, attachments = [] } = body;

    if (!body.messages || !Array.isArray(body.messages)) {
      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildSystemPrompt(practiceArea ?? "general", locale ?? "es");
    const trimmedMessages = body.messages.slice(-MAX_CONTEXT_MESSAGES);
    let currentMessages = buildMessagesWithAttachments(trimmedMessages, attachments);

    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    // Run the agentic loop in the background
    (async () => {
      try {
        let iterations = 0;

        while (iterations < MAX_TOOL_ITERATIONS) {
          iterations++;
          const isLastIteration = iterations >= MAX_TOOL_ITERATIONS;

          const response = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: systemPrompt,
            tools: TOOLS,
            messages: currentMessages,
            stream: false,
          });

          if (response.stop_reason === "tool_use" && !isLastIteration) {
            await writer.write(encoder.encode("\x00SEARCHING\x00"));

            const toolUseBlocks = response.content.filter(
              (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
            );

            const toolResults = await Promise.all(
              toolUseBlocks.map(async (block) => ({
                type: "tool_result" as const,
                tool_use_id: block.id,
                content: await executeTool(
                  block.name,
                  block.input as Record<string, string>
                ),
              }))
            );

            currentMessages = [
              ...currentMessages,
              { role: "assistant" as const, content: response.content },
              { role: "user" as const, content: toolResults },
            ];
            continue;
          }

          // Stream the final response
          const finalStream = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: systemPrompt,
            tools: TOOLS,
            messages: currentMessages,
            stream: true,
          });

          for await (const event of finalStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              await writer.write(encoder.encode(event.delta.text));
            }
          }
          break;
        }

        await writer.close();
      } catch (err) {
        console.error("Chat stream error:", err);
        const msg = err instanceof Error ? err.message : "Error interno";
        await writer.write(encoder.encode(`\n\n[Error: ${msg}]`));
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
