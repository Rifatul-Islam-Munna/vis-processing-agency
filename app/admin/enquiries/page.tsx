import EnquiryManager from "@/components/EnquiryManager";
import { connectDB, hasDatabase } from "@/lib/db";
import { Enquiry } from "@/lib/models";

export default async function EnquiriesPage() {
  let rows: any[] = [];
  if (hasDatabase()) {
    try {
      await connectDB();
      rows = await Enquiry.find({}).sort({ createdAt: -1 }).limit(300).lean();
    } catch {}
  }

  const items = rows.map((row) => ({
    id: String(row._id),
    pageSlug: String(row.pageSlug || ""),
    name: String(row.name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    subject: String(row.subject || ""),
    message: String(row.message || ""),
    data: JSON.parse(JSON.stringify(row.data || {})),
    status: ["new", "read", "closed"].includes(row.status) ? row.status : "new",
    createdAt: new Date(row.createdAt).toISOString(),
  }));

  return <>
    <h1 className="text-3xl font-black">Enquiries</h1>
    <p className="mb-6 mt-1 text-slate-500">Review, update and remove submissions captured from public forms.</p>
    <EnquiryManager initialItems={items} />
  </>;
}
