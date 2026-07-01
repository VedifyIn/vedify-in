import { z } from 'zod';
import { baseSchema } from '../base';
import { mediaObjectSchema } from '../nested';

export const podcastSchema = baseSchema.extend({
  type: z.literal('PodcastEpisode'),
  media: mediaObjectSchema.optional(),
  episodeNumber: z.number().int().positive().optional(),
  seasonNumber: z.number().int().positive().optional(),
  podcastSeries: z.string().optional(),
});
