import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinalScoreService } from './scoring/final-score.service';
import { MatchAgentService } from './match-agent.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly finalScoreService: FinalScoreService,
    private readonly matchAgentService: MatchAgentService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async matchOpportunityToDancers(opportunityId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    if (!this.isMatchableOpportunity(opportunity)) {
      this.logger.warn(`Opportunity is not matchable: ${opportunityId}`);
      return [];
    }

    const dancers = await this.prisma.dancer.findMany({
      where: {
        isActive: true,
      },
    });

    const savedRecommendations: Awaited<
      ReturnType<RecommendationsService['upsert']>
    >[] = [];

    for (const dancer of dancers) {
      const score = this.finalScoreService.calculate(opportunity, dancer);

      if (!score.hardFilterPassed) {
        continue;
      }

      if (score.finalScore < 65) {
        continue;
      }

      const analysis = await this.matchAgentService.analyzeMatch({
        opportunity,
        dancer,
        score,
      });

      if (!analysis.shouldRecommend) {
        continue;
      }

      const recommendation = await this.recommendationsService.upsert({
        opportunityId: opportunity.id,
        dancerId: dancer.id,

        finalScore: score.finalScore,
        styleScore: score.styleScore,
        locationScore: score.locationScore,
        typeScore: score.typeScore,
        availabilityScore: score.availabilityScore,
        experienceScore: score.experienceScore,
        compensationScore: score.compensationScore,

        reason: analysis.reason,
        risks: [...score.risks, ...analysis.risks],
        suggestedMessage: analysis.suggestedMessage,
        status: 'pending_review',
      });

      savedRecommendations.push(recommendation);
    }

    return savedRecommendations;
  }

  async matchAllCompleteOpportunities() {
    const opportunities = await this.prisma.opportunity.findMany({
      where: {
        status: 'complete',
        confidence: {
          gte: 0.7,
        },
        completenessScore: {
          gte: 70,
        },
      },
      orderBy: {
        extractedAt: 'desc',
      },
    });

    const results: {
      opportunityId: string;
      recommendations: number;
    }[] = [];

    for (const opportunity of opportunities) {
      const recommendations = await this.matchOpportunityToDancers(
        opportunity.id,
      );

      results.push({
        opportunityId: opportunity.id,
        recommendations: recommendations.length,
      });
    }

    return results;
  }

  private isMatchableOpportunity(opportunity: {
    status: string;
    confidence: number;
    completenessScore: number;
    applicationUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  }) {
    const hasContact =
      Boolean(opportunity.applicationUrl) ||
      Boolean(opportunity.contactEmail) ||
      Boolean(opportunity.contactPhone);

    return (
      opportunity.status === 'complete' &&
      opportunity.confidence >= 0.7 &&
      opportunity.completenessScore >= 70 &&
      hasContact
    );
  }
}
