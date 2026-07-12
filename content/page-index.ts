import fs from "node:fs";
import path from "node:path";
import { brotliDecompressSync } from "node:zlib";

export type DefaultPage = {
  slug: string;
  sourceFile: string;
  title: string;
  html: string;
  headHtml: string;
  customCss: string;
  customJs: string;
  published: boolean;
  sortOrder: number;
  seo: {
    title: string;
    description: string;
    keywords: string;
    canonical: string;
    ogTitle: string;
    ogImage: string;
    noIndex: boolean;
    jsonLd: string;
  };
};

function loadDefaultPages(): Record<string, DefaultPage> {
  const contentDir = path.join(process.cwd(), "content");
  const encoded = fs
    .readdirSync(contentDir)
    .filter((name) => name.startsWith("default-pages.part-") && name.endsWith(".b64"))
    .sort()
    .map((name) => fs.readFileSync(path.join(contentDir, name), "utf8").trim())
    .join("");
  if (!encoded) throw new Error("Default page bundle is missing");
  const json = brotliDecompressSync(Buffer.from(encoded, "base64")).toString("utf8");
  return JSON.parse(json) as Record<string, DefaultPage>;
}

export const defaultPages = loadDefaultPages();
export const defaultPageList = Object.values(defaultPages).sort(
  (a, b) => a.sortOrder - b.sortOrder,
);
