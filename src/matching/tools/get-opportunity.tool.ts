import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetOpportunityTool {
  constructor(private readonly prisma: PrismaService) {}

  create() {
    return new DynamicStructuredTool({
      name: 'get_opportunity',
      description: 'Get one opportunity by ID.',
      schema: z.object({
        opportunityId: z.string(),
      }),
      func: async ({ opportunityId }) => {
        const opportunity = await this.prisma.opportunity.findUnique({
          where: { id: opportunityId },
        });

        if (!opportunity) {
          throw new Error('Opportunity not found');
        }

        return JSON.stringify(opportunity);
      },
    });
  }
}
