import fs from "node:fs";
import path from "node:path";
import { defaultPageList } from "../content/page-index";

const expectedSlugs = [
  "home", "home-2", "home-3", "home-4", "home-5", "about", "blog-classic", "blog-details", "blog-grid",
  "cart", "checkout", "contact", "country-details", "country-list", "course-details", "course-v1", "error", "faq",
  "services-details", "services", "shop-details", "shop", "team-details", "team", "testimonial",
].sort();
const errors: string[] = [];
const root = process.cwd();
const publicRoot = path.join(root, "public");

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function normalizeReference(reference: string) {
  return reference.trim().split("?")[0].split("#")[0];
}

function checkPublicReference(reference: string, source: string, baseDirectory = publicRoot) {
  const clean = normalizeReference(reference);
  if (!clean || clean.startsWith("data:") || clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("//") || clean.startsWith("#")) return;
  const target = clean.startsWith("/") ? path.join(publicRoot, clean.replace(/^\/+/, "")) : path.resolve(baseDirectory, clean);
  if (!target.startsWith(publicRoot) || !fs.existsSync(target)) errors.push(`${source}: missing ${clean}`);
}

const slugs = defaultPageList.map((page) => page.slug).sort();
if (defaultPageList.length !== 25) errors.push(`Expected 25 pages, got ${defaultPageList.length}`);
if (new Set(slugs).size !== defaultPageList.length) errors.push("Duplicate slugs");
if (JSON.stringify(slugs) !== JSON.stringify(expectedSlugs)) errors.push(`Route set mismatch: ${slugs.join(", ")}`);

let formCount = 0;
const referencedAssets = new Set<string>();
for (const page of defaultPageList) {
  if (!page.html.trim()) errors.push(`${page.slug}: empty HTML`);
  formCount += (page.html.match(/<form\b/gi) || []).length;
  if (/(?:href|src)=["'][^"']+\.html(?:[?#"'])/i.test(page.html)) errors.push(`${page.slug}: unresolved .html link`);
  for (const broken of ["course.html", "price.html", "login.html", "arrow-6.svg"]) {
    if (page.html.includes(broken)) errors.push(`${page.slug}: unresolved vendor reference ${broken}`);
  }
  for (const match of page.html.matchAll(/["']((?:\/)?assets\/[^"'#? )]+)/g)) {
    const reference = match[1].startsWith("/") ? match[1] : `/${match[1]}`;
    referencedAssets.add(reference);
    checkPublicReference(reference, page.slug);
  }
}
if (formCount < 30) errors.push(`Expected the imported template forms, found only ${formCount}`);

const assetFiles = walk(path.join(publicRoot, "assets"));
if (assetFiles.length < 250) errors.push(`Theme asset archive looks incomplete: ${assetFiles.length} files`);
for (const cssFile of assetFiles.filter((file) => file.endsWith(".css"))) {
  const css = fs.readFileSync(cssFile, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) checkPublicReference(match[1], path.relative(root, cssFile), path.dirname(cssFile));
}

for (const required of [
  "app/admin/page.tsx", "app/login/page.tsx", "app/register/page.tsx", "app/sitemap.ts", "app/robots.ts",
  "lib/db.ts", "lib/auth.ts", "lib/models.ts", "public/site.webmanifest",
  "content/default-pages.part-01.b64", "content/default-pages.part-04.b64",
]) {
  if (!fs.existsSync(path.join(root, required))) errors.push(`Missing required project file: ${required}`);
}

if (errors.length) {
  console.error(errors.slice(0, 150).join("\n"));
  process.exit(1);
}

console.log(`Verified ${defaultPageList.length} pages, ${slugs.length} unique routes, ${formCount} forms, ${referencedAssets.size} direct page assets and ${assetFiles.length} materialized theme files.`);
