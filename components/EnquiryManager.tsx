"use client";

import { useState } from "react";

type ManagedEnquiry = {
  id: string;
  pageSlug: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  data: Record<string, unknown>;
  status: "new" | "read" | "closed";
  createdAt: string;
};

export default function EnquiryManager({ initialItems }: { initialItems: ManagedEnquiry[] }) {
  const [items, setItems] = useState(initialItems);

  async function updateStatus(id: string, status: ManagedEnquiry["status"]) {
    const response = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) setItems((rows) => rows.map((row) => row.id === id ? { ...row, status } : row));
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this enquiry?")) return;
    const response = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    if (response.ok) setItems((rows) => rows.filter((row) => row.id !== id));
  }

  if (!items.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No enquiries yet.</div>;

  return <div className="space-y-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="font-black">{item.subject || item.name || "Website enquiry"}</h2><p className="mt-1 text-sm text-slate-500">{item.email} {item.phone && `• ${item.phone}`} • /{item.pageSlug}</p></div>
      <div className="flex gap-2"><select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value as ManagedEnquiry["status"])} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="new">New</option><option value="read">Read</option><option value="closed">Closed</option></select><button onClick={() => remove(item.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600">Delete</button></div>
    </div>
    {item.message && <p className="mt-4 whitespace-pre-wrap">{item.message}</p>}
    <details className="mt-4"><summary className="cursor-pointer text-sm font-bold text-indigo-600">All submitted fields</summary><pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(item.data, null, 2)}</pre></details>
    <time className="mt-3 block text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</time>
  </article>)}</div>;
}
