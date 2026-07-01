import { z } from 'zod';
import { baseSchema } from '../base';
import { quoteObjectSchema } from '../nested';

export const quoteSchema = baseSchema.extend({
  type: z.literal('Quote'),
  quote: quoteObjectSchema.optional(),
});
