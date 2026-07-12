"use client";

import { useState } from "react";

type MediaItem = { id: string; name: string; url: string; alt: string; type: string; mimeType: string; sizeBytes: number };

export default function MediaGrid({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);

  async function remove(id: string) {
    if (!window.confirm("Delete this media item?")) return;
    const response = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (response.ok) setItems((rows) => rows.filter((row) => row.id !== id));
  }

  return <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex aspect-video items-center justify-center bg-slate-100">
      {item.type === "image" ? <img src={item.url} alt={item.alt || item.name} className="h-full w-full object-cover" /> : <a href={item.url} target="_blank" className="font-bold text-indigo-600">Open document ↗</a>}
    </div>
    <div className="p-4"><h2 className="font-bold">{item.name}</h2><code className="mt-2 block max-h-12 overflow-hidden break-all text-xs text-slate-500">{item.url}</code><div className="mt-3 flex items-center justify-between"><span className="text-xs text-slate-500">{item.sizeBytes ? `${Math.ceil(item.sizeBytes / 1024)} KB` : item.type}</span><button onClick={() => remove(item.id)} className="text-sm font-bold text-red-600">Delete</button></div></div>
  </article>)}</div>;
}
