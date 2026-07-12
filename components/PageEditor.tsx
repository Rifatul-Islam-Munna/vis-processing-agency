"use client";

import { useMemo, useState } from "react";

const previewStyles = [
  "/assets/css/bootstrap.min.css",
  "/assets/css/animate.min.css",
  "/assets/css/slick.css",
  "/assets/css/magnific-popup.css",
  "/assets/css/aos.css",
  "/assets/css/spacing.css",
  "/assets/css/main.css",
  "/assets/fonts/bootstrap-icons.css",
];

export default function PageEditor({ page, isNew = false }: { page: any; isNew?: boolean }) {
  const [html, setHtml] = useState(String(page.html || ""));
  const [customCss, setCustomCss] = useState(String(page.customCss || ""));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const preview = useMemo(() => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${previewStyles.map((href) => `<link rel="stylesheet" href="${href}">`).join("")}<style>${customCss}</style></head><body>${html}</body></html>`, [html, customCss]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const seo = {
      title: form.get("seoTitle"),
      description: form.get("seoDescription"),
      keywords: form.get("keywords"),
      canonical: form.get("canonical"),
      ogTitle: form.get("ogTitle"),
      ogImage: form.get("ogImage"),
      noIndex: form.get("noIndex") === "on",
      jsonLd: form.get("jsonLd"),
    };
    const body = {
      title: form.get("title"),
      slug: form.get("slug"),
      published: form.get("published") === "on",
      html,
      headHtml: form.get("headHtml"),
      customCss,
      customJs: form.get("customJs"),
      seo,
    };
    const response = await fetch(isNew ? "/api/admin/pages" : `/api/admin/pages/${page._id || page.slug}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setMessage(result.error || "Save failed");
    if (isNew) return window.location.assign(`/admin/pages/${result.page._id}`);
    setMessage("Saved successfully");
  }

  return <form className="space-y-6" onSubmit={save}>
    <div className="grid gap-4 md:grid-cols-2"><Field label="Page title" name="title" value={page.title} /><Field label="URL slug" name="slug" value={page.slug} /></div>
    <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" defaultChecked={page.published !== false} /> Published</label>

    <div className="grid gap-5 2xl:grid-cols-2">
      <label className="block"><span className="mb-1.5 block text-sm font-bold">Complete page HTML</span><textarea name="html" rows={30} value={html} onChange={(event) => setHtml(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm" /></label>
      <div><span className="mb-1.5 block text-sm font-bold">Live visual preview</span><iframe title="Live page preview" sandbox="allow-same-origin" srcDoc={preview} className="h-[760px] w-full rounded-xl border border-slate-300 bg-white" /></div>
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <Area label="Page-specific head HTML" name="headHtml" value={page.headHtml} />
      <label className="block"><span className="mb-1.5 block text-sm font-bold">Page-specific CSS</span><textarea name="customCss" rows={8} value={customCss} onChange={(event) => setCustomCss(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm" /></label>
      <Area label="Page-specific JavaScript" name="customJs" value={page.customJs} />
      <Area label="JSON-LD structured data" name="jsonLd" value={page.seo?.jsonLd} />
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-xl font-black">SEO and social sharing</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title" name="seoTitle" value={page.seo?.title} />
        <Field label="Open Graph title" name="ogTitle" value={page.seo?.ogTitle} />
        <Field label="Keywords" name="keywords" value={page.seo?.keywords} />
        <Field label="Canonical URL" name="canonical" value={page.seo?.canonical} />
        <Field label="Open Graph image" name="ogImage" value={page.seo?.ogImage} />
        <label className="flex items-center gap-2 pt-7 text-sm font-bold"><input type="checkbox" name="noIndex" defaultChecked={page.seo?.noIndex} /> Prevent search indexing</label>
      </div>
      <Area label="Meta description" name="seoDescription" value={page.seo?.description} rows={4} />
    </section>

    <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
      <button disabled={busy} className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Save page"}</button>
      {!isNew && <a target="_blank" href={page.slug === "home" ? "/" : `/${page.slug}`} className="rounded-xl border border-slate-300 px-5 py-3 font-bold">Open page ↗</a>}
      <span className="text-sm font-semibold text-emerald-700">{message}</span>
    </div>
  </form>;
}

function Field({ label, name, value }: { label: string; name: string; value?: string }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-bold">{label}</span><input name={name} defaultValue={value || ""} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /></label>;
}

function Area({ label, name, value, rows = 8 }: { label: string; name: string; value?: string; rows?: number }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-bold">{label}</span><textarea name={name} rows={rows} defaultValue={value || ""} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm" /></label>;
}
