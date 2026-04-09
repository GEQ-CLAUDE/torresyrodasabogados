import { NextRequest } from "next/server";

// pdf-parse is CJS — require avoids ESM/CJS mismatch in bundler moduleResolution
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (
  buf: Buffer,
  opts?: { max?: number }
) => Promise<{ text: string; numpages: number }>;

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let type: "pdf" | "docx" | "txt";
    let content: string;

    if (name.endsWith(".pdf")) {
      type = "pdf";
      const result = await pdfParse(buffer);
      content = result.text.trim();
    } else if (name.endsWith(".docx")) {
      type = "docx";
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      content = result.value.trim();
    } else if (name.endsWith(".txt")) {
      type = "txt";
      content = buffer.toString("utf-8").trim();
    } else {
      return Response.json(
        { error: "Unsupported file type. Use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (!content) {
      return Response.json(
        { error: "Could not extract text from file." },
        { status: 422 }
      );
    }

    const id = crypto.randomUUID();

    return Response.json({
      id,
      name: file.name,
      type,
      content: content.slice(0, 80000),
      size: file.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Failed to process file" }, { status: 500 });
  }
}
