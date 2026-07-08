import { Module } from '@nestjs/common';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { MatchingService } from './matching.service';
import { MatchAgentService } from './match-agent.service';

import { StyleScoreService } from './scoring/style-score.service';
import { LocationScoreService } from './scoring/location-score.service';
import { TypeScoreService } from './scoring/type-score.service';
import { AvailabilityScoreService } from './scoring/availability-score.service';
import { ExperienceScoreService } from './scoring/experience-score.service';
import { CompensationScoreService } from './scoring/compensation-score.service';
import { FinalScoreService } from './scoring/final-score.service';

import { GetOpportunityTool } from './tools/get-opportunity.tool';
import { GetDancerTool } from './tools/get-dancer.tool';
import { CalculateMatchScoreTool } from './tools/calculate-match-score.tool';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [RecommendationsModule],
  providers: [
    MatchingService,
    MatchAgentService,

    StyleScoreService,
    LocationScoreService,
    TypeScoreService,
    AvailabilityScoreService,
    ExperienceScoreService,
    CompensationScoreService,
    FinalScoreService,

    GetOpportunityTool,
    GetDancerTool,
    CalculateMatchScoreTool,
    PrismaService,
  ],
  exports: [MatchingService],
})
export class MatchingModule {}
