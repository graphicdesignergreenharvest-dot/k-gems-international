import fs from "node:fs";
import path from "node:path";

const style =
  "cinematic editorial photograph, luxury jewellery campaign, photorealistic, 85mm lens, shallow depth of field, fine film grain, deep shadows, champagne gold highlights, no text, no logo, no watermark";
const scenes = [
  {
    id: "scene-1-mud",
    seed: 1412,
    prompt:
      "Extreme macro photograph of wet dark brown earth and mud in a Sri Lankan gem pit, a naturally rough irregular royal blue sapphire crystal half buried, an elegant woman's hand gently reaching down to lift it, tiny water droplets, fine roots and soil particles, faint blue glints inside the rough stone, soft dramatic sunlight breaking through, " +
      style,
  },
  {
    id: "scene-2-cutting",
    seed: 2431,
    prompt:
      "Master gem cutter's hands working a royal blue sapphire on a precision lapidary faceting machine, brass dop and faceting head, tiny water droplets catching the light, unfinished rough sapphire beside a finished oval faceted royal blue gemstone, dark workshop, warm focused task lamp, macro detail, " +
      style,
  },
  {
    id: "scene-3-lab",
    seed: 3317,
    prompt:
      "Professional gemologist wearing white laboratory gloves examining a large oval royal blue sapphire under a gemological microscope, refractometer, jeweller's loupe and precision tweezers on a spotless white laboratory bench, cool scientific light with a warm gold reflection on the stone, macro, " +
      style,
  },
  {
    id: "scene-4-craft",
    seed: 4276,
    prompt:
      "Close-up of a master jeweller's hands setting an oval royal blue sapphire into a refined yellow gold ring with precision pliers, a matching sapphire pendant and earrings resting on the dark workbench, fine metal tools, warm workshop light, macro detail, " +
      style,
  },
  {
    id: "scene-5-showroom",
    seed: 5189,
    prompt:
      "Interior of an ultra luxury jewellery showroom, cream marble, dark walnut panelling, glass display cabinets, warm champagne gold lighting, cream mannequin bust wearing a royal blue sapphire pendant necklace and matching earrings, gold sapphire ring on a navy velvet ring stand, elegant reflections, no people, " +
      style,
  },
  {
    id: "scene-6-portrait",
    seed: 6203,
    prompt:
      "Luxury fashion editorial portrait of an elegant woman wearing a yellow gold necklace with a large oval royal blue sapphire pendant, matching sapphire earrings and a delicate gold sapphire ring, refined cream silk outfit, dark studio backdrop, soft directional studio light, three-quarter view, one hand raised near her collarbone, realistic skin texture, composed negative space, " +
      style,
  },
];

const outDir = path.resolve("assets-candidates/scenes");
fs.mkdirSync(outDir, { recursive: true });

async function generate(scene) {
  const params = new URLSearchParams({
    width: "1024",
    height: "576",
    nologo: "true",
    seed: String(scene.seed),
    model: "flux",
  });
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(scene.prompt)}?${params}`;
  const file = path.join(outDir, `${scene.id}.jpg`);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(240000) });
      if (!res.ok) {
        console.error(scene.id, "HTTP", res.status);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 20000) {
        console.error(scene.id, "too small", buf.length);
        continue;
      }
      fs.writeFileSync(file, buf);
      console.log("saved", scene.id, Math.round(buf.length / 1024) + "KB");
      return;
    } catch (error) {
      console.error(scene.id, "attempt", attempt, error.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

for (let i = 0; i < scenes.length; i += 2) {
  await Promise.all(scenes.slice(i, i + 2).map(generate));
}
console.log("done");
