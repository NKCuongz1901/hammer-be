import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetDancerTool {
  constructor(private readonly prisma: PrismaService) {}

  create() {
    return new DynamicStructuredTool({
      name: 'get_dancer',
      description: 'Get one dancer by ID.',
      schema: z.object({
        dancerId: z.string(),
      }),
      func: async ({ dancerId }) => {
        const dancer = await this.prisma.dancer.findUnique({
          where: { id: dancerId },
        });

        if (!dancer) {
          throw new Error('Dancer not found');
        }

        return JSON.stringify(dancer);
      },
    });
  }
}
