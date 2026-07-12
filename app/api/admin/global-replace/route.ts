import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Page } from "@/lib/models";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(req: Request) {
  await requireAdmin();
  const { find, replace = "" } = await req.json();

  if (!find || typeof find !== "string") {
    return NextResponse.json({ error: "Find text is required" }, { status: 400 });
  }

  await connectDB();
  const pages = await Page.find({ html: { $regex: escapeRegex(find) } });
  let modified = 0;

  for (const page of pages) {
    const next = page.html.split(find).join(String(replace));
    if (next !== page.html) {
      page.html = next;
      await page.save();
      modified += 1;
    }
  }

  return NextResponse.json({ modified });
}
