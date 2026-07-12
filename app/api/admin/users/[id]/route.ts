import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const administrator = await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};

  if (body.role !== undefined) {
    if (!['admin', 'user'].includes(body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    patch.role = body.role;
  }
  if (body.active !== undefined) patch.active = Boolean(body.active);

  if (administrator.id === id && (patch.role === "user" || patch.active === false)) {
    return NextResponse.json({ error: "You cannot remove your own administrator access" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user: { id: String(user._id), role: user.role, active: user.active !== false } });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const administrator = await requireAdmin();
  const { id } = await params;
  if (administrator.id === id) return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  await connectDB();
  await User.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
