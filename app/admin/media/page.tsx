import MediaForm from "@/components/MediaForm";
import MediaGrid from "@/components/MediaGrid";
import { connectDB, hasDatabase } from "@/lib/db";
import { Media } from "@/lib/models";

export default async function MediaPage() {
  let rows: any[] = [];
  if (hasDatabase()) {
    try {
      await connectDB();
      rows = await Media.find({}).sort({ createdAt: -1 }).limit(200).lean();
    } catch {}
  }

  const items = rows.map((item) => ({
    id: String(item._id),
    name: String(item.name),
    url: String(item.url),
    alt: String(item.alt || ""),
    type: String(item.type || "image"),
    mimeType: String(item.mimeType || ""),
    sizeBytes: Number(item.sizeBytes || 0),
  }));

  return <>
    <h1 className="text-3xl font-black">Media library</h1>
    <p className="mb-6 mt-1 text-slate-500">Upload an image or PDF to MongoDB, or register an existing local/external URL.</p>
    <MediaForm />
    <MediaGrid initialItems={items} />
  </>;
}
