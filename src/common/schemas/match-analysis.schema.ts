import { z } from 'zod';

export const MatchAnalysisSchema = z.object({
  shouldRecommend: z.boolean(),
  reason: z.string(),
  risks: z.array(z.string()),
  suggestedMessage: z.string(),
});

export type MatchAnalysis = z.infer<typeof MatchAnalysisSchema>;
