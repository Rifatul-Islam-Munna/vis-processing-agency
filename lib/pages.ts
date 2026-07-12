import { defaultPages, defaultPageList, type PageRecord } from "@/content";
import { connectDB, hasDatabase } from "@/lib/db";
import { Page } from "@/lib/models";
import { getSettings, interpolate } from "@/lib/settings";

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function getPage(slug: string, includeDraft = false): Promise<PageRecord | null> {
  let page: PageRecord | null = null;

  if (hasDatabase()) {
    try {
      await connectDB();
      const found = await Page.findOne({ slug, ...(includeDraft ? {} : { published: true }) }).lean();
      if (found) page = plain(found) as unknown as PageRecord;
    } catch {}
  }

  if (!page) {
    const fallback = defaultPages[slug];
    if (fallback && (includeDraft || fallback.published)) page = plain(fallback);
  }

  if (!page) return null;
  const settings = await getSettings();

  return {
    ...page,
    title: interpolate(page.title, settings),
    html: interpolate(page.html, settings),
    headHtml: interpolate(page.headHtml || "", settings),
    customCss: interpolate(page.customCss || "", settings),
    customJs: interpolate(page.customJs || "", settings),
    seo: {
      ...page.seo,
      title: interpolate(page.seo?.title || page.title, settings),
      description: interpolate(page.seo?.description || "", settings),
      ogTitle: interpolate(page.seo?.ogTitle || page.title, settings),
    },
  };
}

export async function listPages(includeDraft = true) {
  if (hasDatabase()) {
    try {
      await connectDB();
      const rows = await Page.find(includeDraft ? {} : { published: true })
        .sort({ sortOrder: 1, title: 1 })
        .lean();
      if (rows.length) return plain(rows) as unknown as PageRecord[];
    } catch {}
  }

  return defaultPageList.filter((page) => includeDraft || page.published).map(plain);
}
