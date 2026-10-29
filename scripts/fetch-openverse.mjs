import fs from "node:fs";
import path from "node:path";

const queries = JSON.parse(process.argv[2] || "[]");
const outDir = path.resolve("assets-candidates/openverse");
fs.mkdirSync(outDir, { recursive: true });

const manifest = [];
for (const query of queries) {
  const params = new URLSearchParams({
    q: query,
    license_type: "commercial",
    page_size: "20",
    aspect_ratio: "wide",
    size: "large",
  });
  let data;
  try {
    const res = await fetch(`https://api.openverse.org/v1/images/?${params}`);
    if (!res.ok) {
      console.error("FAILED", query, res.status);
      continue;
    }
    data = await res.json();
  } catch (error) {
    console.error("FAILED", query, error.message);
    continue;
  }
  let index = 0;
  for (const item of data.results ?? []) {
    if ((item.width ?? 0) < 1200 || (item.height ?? 0) < 600) continue;
    if (!/\.(jpe?g|png)$/i.test(item.url ?? "")) continue;
    index += 1;
    const slug = `${query.replace(/[^a-z0-9]+/gi, "-")}-${index}`;
    const file = path.join(outDir, `${slug}.jpg`);
    try {
      const img = await fetch(item.url, {
        headers: { "User-Agent": "KGemsSiteBuilder/1.0" },
      });
      if (!img.ok) continue;
      const buffer = Buffer.from(await img.arrayBuffer());
      if (buffer.length < 30000) continue;
      fs.writeFileSync(file, buffer);
      manifest.push({
        query,
        title: item.title,
        file: path.relative(process.cwd(), file),
        width: item.width,
        height: item.height,
        license: item.license,
        creator: item.creator,
        foreignLandingUrl: item.foreign_landing_url,
        source: item.source,
      });
      console.log("ok", slug, `${item.width}x${item.height}`, item.title?.slice(0, 60));
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
