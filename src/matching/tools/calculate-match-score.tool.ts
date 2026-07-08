import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FinalScoreService } from '../scoring/final-score.service';
import { DynamicStructuredTool } from '@langchain/core/tools';
import z from 'zod';

@Injectable()
export class CalculateMatchScoreTool {
  constructor(
    private readonly prisma: PrismaService,
    private readonly finalScoreService: FinalScoreService,
  ) {}

  create() {
    return new DynamicStructuredTool({
      name: 'calculate_match_score',
      description:
        'Calculate deterministic match score between one opportunity and one dancer.',
      schema: z.object({
        opportunityId: z.string(),
        dancerId: z.string(),
      }),
      func: async ({ opportunityId, dancerId }) => {
        const [opportunity, dancer] = await Promise.all([
          this.prisma.opportunity.findUnique({
            where: { id: opportunityId },
          }),
          this.prisma.dancer.findUnique({
            where: { id: dancerId },
          }),
        ]);

        if (!opportunity) {
          throw new Error('Opportunity not found');
        }

        if (!dancer) {
          throw new Error('Dancer not found');
        }

        const score = this.finalScoreService.calculate(opportunity, dancer);

        return JSON.stringify(score);
      },
    });
  }
}
