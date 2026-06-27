import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { baseSchema } from '@vedify/schema';

const blog = defineCollection({
  type: 'content_layer',
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: baseSchema,
});

export const collections = { blog };
