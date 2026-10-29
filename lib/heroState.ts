export type HeroSharedState = {
  progress: number;
  featured: number;
  pointerX: number;
  pointerY: number;
  reduced: boolean;
};

export const featuredOrder = [0, 1, 3] as const;

export function featuredIndexForProgress(progress: number) {
  if (progress < 0.67) return 0;
  if (progress < 0.735) return 1;
  return 2;
}

export function heroPhaseForProgress(progress: number) {
  if (progress < 0.3) return 0; // Emergence
  if (progress < 0.56) return 1; // In Motion
  if (progress < 0.845) return 2; // The Selection
  return 3; // The Collection
}
