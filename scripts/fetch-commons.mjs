import fs from "node:fs";
import path from "node:path";

const queries = JSON.parse(process.argv[2] || "[]");
const outDir = path.resolve("assets-candidates");
fs.mkdirSync(outDir, { recursive: true });

const manifest = [];

for (const query of queries) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1200",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": "KGemsSiteBuilder/1.0 (asset research)" },
  });
  if (!res.ok) {
    console.error("FAILED", query, res.status);
    continue;
  }
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const license =
      info.extmetadata?.LicenseShortName?.value ??
      info.extmetadata?.License?.value ??
      "unknown";
    const artist = (info.extmetadata?.Artist?.value ?? "")
      .replace(/<[^>]*>/g, "")
      .trim();
    const safe = page.title
      .replace(/^File:/, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .slice(0, 70);
    const slug = `${query.replace(/[^a-z0-9]+/gi, "-")}-${safe}`;
    const file = path.join(outDir, `${slug}.jpg`);
    try {
      const img = await fetch(info.thumburl ?? info.url, {
        headers: { "User-Agent": "KGemsSiteBuilder/1.0 (asset research)" },
      });
      if (!img.ok) continue;
      fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
      manifest.push({
        query,
        title: page.title.replace(/^File:/, ""),
        file: path.relative(process.cwd(), file),
        width: info.width,
        height: info.height,
        license,
        artist,
        descriptionUrl: info.descriptionurl,
        originalUrl: info.url,
      });
      console.log("ok", slug, info.width + "x" + info.height, license);
    } catch (error) {
      console.error("download failed", slug, error.message);
    }
  }
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("TOTAL", manifest.length);
