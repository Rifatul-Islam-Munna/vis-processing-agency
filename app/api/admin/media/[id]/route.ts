import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await connectDB();
  await Media.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
