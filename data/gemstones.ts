export type GemFamily = "Sapphire" | "Ruby" | "Emerald" | "Spinel";
export type GemAvailability = "Available" | "Reserved";
export type GemCut = "Oval" | "Cushion" | "Emerald" | "Round";

export type Gemstone = {
  slug: string;
  name: string;
  family: GemFamily;
  reference: string;
  /** Basename of the GLB in /public/gem-vault-all (without -glass.glb). */
  model: string;
  weight: string;
  colour: string;
  cut: GemCut;
  origin: string;
  status: GemAvailability;
  treatment: string | null;
  certification: string | null;
  blurb: string;
  palette: {
    base: string;
    deep: string;
    light: string;
    glow: string;
  };
  featured?: boolean;
};

/**
 * Demonstration inventory. Specifications, references and availability are
 * sample content and must be replaced with verified stock before launch.
 */
export const gemstones: Gemstone[] = [
  {
    slug: "ceylon-blue-sapphire",
    name: "Ceylon Blue Sapphire",
    family: "Sapphire",
    reference: "KGI-BS-1042",
    model: "sapphire",
    weight: "3.82 ct",
    colour: "Royal blue",
    cut: "Oval",
    origin: "Ratnapura, Sri Lanka",
    status: "Available",
    treatment: null,
    certification: null,
    blurb:
      "A classic Ceylon sapphire in a deep royal blue, chosen for the evenness of its colour and the balance of its oval proportions.",
    palette: {
      base: "#1b52b8",
      deep: "#061a49",
      light: "#7fb2ff",
      glow: "#2f6fe4",
    },
    featured: true,
  },
  {
    slug: "ruby",
    name: "Ruby",
    family: "Ruby",
    reference: "KGI-RB-0781",
    model: "ruby",
    weight: "2.14 ct",
    colour: "Vivid red",
    cut: "Cushion",
    origin: "Mozambique",
    status: "Available",
    treatment: null,
    certification: null,
    blurb:
      "A saturated red ruby with a softly cushioned outline, selected for the intensity of its colour and lively presence.",
    palette: {
      base: "#b3172f",
      deep: "#42020f",
      light: "#ff7a8c",
      glow: "#e02040",
    },
  },
  {
    slug: "emerald",
    name: "Emerald",
    family: "Emerald",
    reference: "KGI-EM-0326",
    model: "emerald",
    weight: "2.76 ct",
    colour: "Rich green",
    cut: "Emerald",
    origin: "Zambia",
    status: "Reserved",
    treatment: null,
    certification: null,
    blurb:
      "A rich green emerald in a step-cut outline, with the quiet depth of character that makes emeralds unlike any other stone.",
    palette: {
      base: "#0f7a51",
      deep: "#03291c",
      light: "#7de3b1",
      glow: "#13a06a",
    },
  },
  {
    slug: "padparadscha-sapphire",
    name: "Padparadscha Sapphire",
    family: "Sapphire",
    reference: "KGI-PS-0915",
    model: "imperial-topaz",
    weight: "1.68 ct",
    colour: "Pink-orange",
    cut: "Oval",
    origin: "Sri Lanka",
    status: "Available",
    treatment: null,
    certification: null,
    blurb:
      "A delicate pink-orange sapphire, the colour traditionally associated with the padparadscha name, in a refined oval cut.",
    palette: {
      base: "#e07a62",
      deep: "#4a1a16",
      light: "#ffc2ad",
      glow: "#f08a6c",
    },
  },
  {
    slug: "yellow-sapphire",
    name: "Yellow Sapphire",
    family: "Sapphire",
    reference: "KGI-YS-0448",
    model: "heliodor",
    weight: "4.25 ct",
    colour: "Golden yellow",
    cut: "Cushion",
    origin: "Sri Lanka",
    status: "Available",
    treatment: null,
    certification: null,
    blurb:
      "A warm golden-yellow sapphire with generous size and a luminous, sunlit character.",
    palette: {
      base: "#d7a52e",
      deep: "#3d2a03",
      light: "#ffe49a",
      glow: "#f0bc48",
    },
  },
  {
    slug: "rose-spinel",
    name: "Rose Spinel",
    family: "Spinel",
    reference: "KGI-SP-0612",
    model: "spinel",
    weight: "2.08 ct",
    colour: "Rose pink",
    cut: "Round",
    origin: "Sri Lanka",
    status: "Available",
    treatment: null,
    certification: null,
    blurb:
      "A rose-pink spinel in a round cut, prized for its fresh colour and the natural brilliance of the material.",
    palette: {
      base: "#cf5b81",
      deep: "#3d0b1c",
      light: "#ffb6cb",
      glow: "#e8739a",
    },
  },
];

export const families: Array<GemFamily | "All"> = [
  "All",
  "Sapphire",
  "Ruby",
  "Emerald",
  "Spinel",
];

export const availabilityOptions: Array<GemAvailability | "All"> = [
  "All",
  "Available",
  "Reserved",
];

export function getGemstone(slug: string) {
  return gemstones.find((gem) => gem.slug === slug);
}

export function getGemstoneByReference(reference: string) {
  return gemstones.find((gem) => gem.reference === reference);
}

export const cutFamilyLabel = (cut: GemCut) => `${cut} cut`;
