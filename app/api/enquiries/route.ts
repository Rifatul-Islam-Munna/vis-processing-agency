import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Enquiry } from "@/lib/models";

function first(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = (body.data && typeof body.data === "object" ? body.data : body) as Record<string, unknown>;
    const user = await getSession();
    const name = first(body, ["name", "fullname", "full_name", "fname"]) || first(data, ["name", "fullname", "full_name", "fname", "your_name"]);
    const email = first(body, ["email"]) || first(data, ["email", "your_email"]);
    const phone = first(body, ["phone", "mobile", "telephone"]) || first(data, ["phone", "mobile", "telephone", "your_phone"]);
    const subject = first(body, ["subject"]) || first(data, ["subject", "visa_type", "service"]);
    const message = first(body, ["message", "comment"]) || first(data, ["message", "comment", "write_your_message"]);

    await connectDB();
    const enquiry = await Enquiry.create({
      pageSlug: String(body.pageSlug || ""),
      name,
      email,
      phone,
      subject,
      message,
      data,
      userId: user?.id,
    });
    return NextResponse.json({ ok: true, id: String(enquiry._id) });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 400 });
  }
}
