import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecommendationsController } from './recommendations.controller';

@Module({
  providers: [RecommendationsService, PrismaService],
  exports: [RecommendationsService],
  controllers: [RecommendationsController],
})
export class RecommendationsModule {}
