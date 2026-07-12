import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const administrator = await requireAdmin();
  const form = await req.formData();
  const file = form.get("file");
  let url = String(form.get("url") || "").trim();
  let name = String(form.get("name") || "").trim();
  const alt = String(form.get("alt") || "").trim();
  let mimeType = "";
  let sizeBytes = 0;
  let type = "image";

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Files must be 5 MB or smaller" }, { status: 400 });
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return NextResponse.json({ error: "Only images and PDFs are supported" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    mimeType = file.type;
    sizeBytes = file.size;
    type = file.type.startsWith("image/") ? "image" : "document";
    url = `data:${file.type};base64,${buffer.toString("base64")}`;
    name ||= file.name;
  }

  if (!url) return NextResponse.json({ error: "Choose a file or provide a URL" }, { status: 400 });
  name ||= "Media item";

  await connectDB();
  const item = await Media.create({ name, url, alt, type, mimeType, sizeBytes, createdBy: administrator.id });
  return NextResponse.json({ item: { id: String(item._id) } });
}
