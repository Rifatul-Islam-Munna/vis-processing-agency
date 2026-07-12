"use client";

import { useState } from "react";

export default function MediaForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  return <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-5" onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!data.get("url") && !(data.get("file") instanceof File && (data.get("file") as File).size)) {
      return setMessage("Choose a file or enter a URL");
    }
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/media", { method: "POST", body: data });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setMessage(result.error || "Unable to add media");
    form.reset();
    window.location.reload();
  }}>
    <input name="name" placeholder="Media name" className="rounded-xl border border-slate-300 px-4 py-3" />
    <input name="url" placeholder="Existing asset or external URL" className="rounded-xl border border-slate-300 px-4 py-3" />
    <input name="alt" placeholder="Alt text" className="rounded-xl border border-slate-300 px-4 py-3" />
    <input name="file" type="file" accept="image/*,application/pdf" className="rounded-xl border border-slate-300 bg-white px-3 py-2" />
    <button disabled={busy} className="rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Uploading..." : "Add media"}</button>
    {message && <p className="md:col-span-2 xl:col-span-5 text-sm font-bold text-red-600">{message}</p>}
  </form>;
}
