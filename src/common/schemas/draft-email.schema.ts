import { z } from 'zod';

export const DraftEmailSchema = z.object({
  message: z.string(),
});

export type DraftEmail = z.infer<typeof DraftEmailSchema>;
