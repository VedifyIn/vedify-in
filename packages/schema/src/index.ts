import { z } from 'zod';

export { z };

export * from './enums';
export * from './nested';
export * from './base';

import {
  simpleContentSchema,
  tutorialCodeSchema,
  recipeSchema,
  bookSchema,
  researchSchema,
  podcastSchema,
  quoteSchema,
  courseSchema,
} from './variants';

export {
  simpleContentSchema,
  tutorialCodeSchema,
  recipeSchema,
  bookSchema,
  researchSchema,
  podcastSchema,
  quoteSchema,
  courseSchema,
};

// ── 5. DISCRIMINATED UNION (Main export) ────────────────────────────
const discriminatedContentSchema = z.discriminatedUnion('type', [
  simpleContentSchema,
  tutorialCodeSchema,
  recipeSchema,
  bookSchema,
  researchSchema,
  podcastSchema,
  quoteSchema,
  courseSchema,
]);

export const contentSchema = discriminatedContentSchema.superRefine((data, ctx) => {
  if (
    data.seriesPart !== undefined &&
    data.totalParts !== undefined &&
    data.seriesPart > data.totalParts
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'seriesPart must not exceed totalParts',
      path: ['seriesPart'],
    });
  }

  if (data.series && data.seriesPart === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'seriesPart is required when series is set',
      path: ['seriesPart'],
    });
  }

  if (data.tags.length > 0 && !data.topic) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'topic is required when tags are set',
      path: ['topic'],
    });
  }

  if (['Course', 'CourseLesson'].includes(data.type) && !data.difficulty) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'difficulty is required for Course and CourseLesson',
      path: ['difficulty'],
    });
  }
});

export type ContentFrontmatter = z.infer<typeof contentSchema>;

// ── 6. HELPER FUNCTIONS ─────────────────────────────────────────────
import type { Video } from './nested';

export function validateFrontmatter(data: unknown): ContentFrontmatter {
  return contentSchema.parse(data);
}

export function hasVideo(
  content: ContentFrontmatter,
): content is ContentFrontmatter & { video: Video } {
  return content.video !== undefined;
}

export function hasAeoDirectAnswer(content: ContentFrontmatter): boolean {
  return content.aeoDirectAnswer !== undefined && content.aeoDirectAnswer.length > 0;
}

export function isRecipe(
  content: ContentFrontmatter,
): content is ContentFrontmatter & { type: 'Recipe' } {
  return content.type === 'Recipe';
}

// ── 7. POLICY ENFORCER ──────────────────────────────────────────────
export { enforcePolicy } from './policy-enforcer';
export type { PolicyWarning, PolicyResult } from './policy-enforcer';

// ── 8. SCHEMA LIBRARY (JSON-LD generation) ──────────────────────────
export { SchemaLibrary } from './schema-library';
export type { ResolvedAuthor } from './schema-library';
