import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Enquiry } from "@/lib/models";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { status } = await req.json();
  if (!["new", "read", "closed"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  await connectDB();
  const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  return NextResponse.json({ ok: true, status: enquiry.status });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await connectDB();
  await Enquiry.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
