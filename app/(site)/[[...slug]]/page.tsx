import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages";
import { getSettings } from "@/lib/settings";
import PageTracker from "@/components/PageTracker";
import FormCapture from "@/components/FormCapture";
import HeadMarkup from "@/components/HeadMarkup";

export const dynamic = "force-dynamic";

function key(parts?: string[]) {
  return !parts?.length ? "home" : parts.join("/");
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const resolved = await params;
  const page = await getPage(key(resolved.slug));
  if (!page) return {};
  const settings = await getSettings();
  const seo = page.seo || {};
  const title = seo.title || page.title;
  const description = seo.description || undefined;

  return {
    title,
    description,
    keywords: seo.keywords ? seo.keywords.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    robots: seo.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: seo.ogTitle || title,
      description,
      url: seo.canonical || settings.siteUrl,
      images: seo.ogImage ? [seo.ogImage] : undefined,
      type: "website",
    },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title: seo.ogTitle || title,
      description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function PublicPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolved = await params;
  const slug = key(resolved.slug);
  const page = await getPage(slug);
  if (!page) notFound();
  const settings = await getSettings();
  const headHtml = [settings.customHead, page.headHtml].filter(Boolean).join("\n");
  const jsonLd = page.seo?.jsonLd?.trim();

  return <>
    <PageTracker slug={slug} />
    <FormCapture slug={slug} />
    <HeadMarkup html={headHtml} />
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd.replace(/</g, "\\u003c") }} />}
    {settings.customCss && <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />}
    {page.customCss && <style dangerouslySetInnerHTML={{ __html: page.customCss }} />}
    <div dangerouslySetInnerHTML={{ __html: page.html }} />
    {settings.customJs && <script dangerouslySetInnerHTML={{ __html: settings.customJs }} />}
    {page.customJs && <script dangerouslySetInnerHTML={{ __html: page.customJs }} />}
  </>;
}
