import type { BaseFrontmatter } from '../base';

export function getNutritionSchema(fm: BaseFrontmatter) {
  if (!('nutrition' in fm) || !fm.nutrition) return undefined;
  const n = fm.nutrition as {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  return {
    '@type': 'NutritionInformation' as const,
    calories: n.calories,
    proteinContent: n.protein,
    carbohydrateContent: n.carbs,
    fatContent: n.fat,
  };
}

export function getRatingSchema(fm: BaseFrontmatter) {
  if (!('rating' in fm) || !fm.rating) return undefined;
  const r = fm.rating as {
    value: number;
    bestRating?: number;
    worstRating?: number;
  };
  return {
    '@type': 'Rating' as const,
    ratingValue: r.value,
    bestRating: r.bestRating ?? 5,
    worstRating: r.worstRating ?? 1,
  };
}
