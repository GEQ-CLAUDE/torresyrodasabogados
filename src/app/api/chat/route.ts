import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `Eres el asistente virtual de Torres & Rodas Abogados, un despacho jurídico especializado con sede en Cuenca, Ecuador.

Áreas de práctica:
- Derecho Tributario (impuestos, declaraciones, disputas con el SRI)
- Derecho Administrativo (actos administrativos, recursos, contratos públicos)
- Derecho Público (constitucional, regulatorio, entidades del Estado)
- Contraloría (auditoría gubernamental, responsabilidades, glosas)
- Derecho Empresarial (constitución de empresas, contratos, fusiones)

Tu misión:
1. Escuchar al usuario, identificar su problema legal y el área de práctica correspondiente.
2. Dar orientación inicial clara y profesional.
3. Recomendar agendar una consulta formal con el equipo.
4. NUNCA brindar asesoría legal vinculante ni reemplazar la consulta con un abogado.

Tono: profesional, cálido, conciso. Responde siempre en el mismo idioma que el usuario (español o inglés).

Contacto del despacho:
- Teléfono / WhatsApp: +593 99 598 5515 / +593 98 436 5799
- Dirección: Av. Paucarbamba 3-142 y Francisco Sojos, Cuenca, Ecuador`;

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
            )
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
