import { Injectable } from '@nestjs/common';
import { StyleScoreService } from './style-score.service';
import { LocationScoreService } from './location-score.service';
import { TypeScoreService } from './type-score.service';
import { AvailabilityScoreService } from './availability-score.service';
import { ExperienceScoreService } from './experience-score.service';
import { CompensationScoreService } from './compensation-score.service';
import { Dancer, Opportunity } from 'generated/prisma/client';

export type MatchScoreResult = {
  finalScore: number;
  styleScore: number;
  locationScore: number;
  typeScore: number;
  availabilityScore: number;
  experienceScore: number;
  compensationScore: number;
  hardFilterPassed: boolean;
  failedReasons: string[];
  matchedStyles: string[];
  risks: string[];
};

@Injectable()
export class FinalScoreService {
  constructor(
    private readonly styleScoreService: StyleScoreService,
    private readonly locationScoreService: LocationScoreService,
    private readonly typeScoreService: TypeScoreService,
    private readonly availabilityScoreService: AvailabilityScoreService,
    private readonly experienceScoreService: ExperienceScoreService,
    private readonly compensationScoreService: CompensationScoreService,
  ) {}

  calculate(opportunity: Opportunity, dancer: Dancer): MatchScoreResult {
    const hardFilter = this.runHardFilter(opportunity, dancer);

    if (!hardFilter.passed) {
      return {
        finalScore: 0,
        styleScore: 0,
        locationScore: 0,
        typeScore: 0,
        availabilityScore: 0,
        experienceScore: 0,
        compensationScore: 0,
        hardFilterPassed: false,
        failedReasons: hardFilter.failedReasons,
        matchedStyles: [],
        risks: [],
      };
    }

    const styleResult = this.styleScoreService.calculate(
      opportunity.danceStyles,
      dancer.danceStyles,
    );

    const locationScore = this.locationScoreService.calculate({
      opportunityCity: opportunity.city,
      opportunityCountry: opportunity.country,
      dancerCity: dancer.city,
      dancerCountry: dancer.country,
      dancerTravelRadiusKm: dancer.travelRadiusKm,
    });

    const typeScore = this.typeScoreService.calculate(
      opportunity.opportunityType,
      dancer.preferredTypes,
    );

    const availabilityScore = this.availabilityScoreService.calculate({
      dancerAvailability: dancer.availability,
      deadline: opportunity.deadline,
      eventStartDate: opportunity.eventStartDate,
    });

    const experienceScore = this.experienceScoreService.calculate({
      opportunityType: opportunity.opportunityType,
      dancerYearsExperience: dancer.yearsExperience,
      dancerSkillLevel: dancer.skillLevel,
    });

    const compensationScore = this.compensationScoreService.calculate({
      compensation: opportunity.compensation,
      dancerMinCompensation: dancer.minCompensation,
    });

    const finalScore =
      styleResult.score * 0.35 +
      locationScore * 0.2 +
      typeScore * 0.15 +
      availabilityScore * 0.1 +
      experienceScore * 0.1 +
      compensationScore * 0.1;

    const risks = this.buildRisks(opportunity, dancer);

    return {
      finalScore: Math.round(finalScore),
      styleScore: styleResult.score,
      locationScore,
      typeScore,
      availabilityScore,
      experienceScore,
      compensationScore,
      hardFilterPassed: true,
      failedReasons: [],
      matchedStyles: styleResult.matchedStyles,
      risks,
    };
  }

  private runHardFilter(opportunity: Opportunity, dancer: Dancer) {
    const failedReasons: string[] = [];

    const hasApplicationMethod =
      Boolean(opportunity.applicationUrl) ||
      Boolean(opportunity.contactEmail) ||
      Boolean(opportunity.contactPhone);

    if (!hasApplicationMethod) {
      failedReasons.push('Opportunity has no application or contact method.');
    }

    if (opportunity.deadline && opportunity.deadline < new Date()) {
      failedReasons.push('Opportunity deadline has passed.');
    }

    if (!dancer.isActive) {
      failedReasons.push('Dancer is not active.');
    }

    if (!opportunity.city && !opportunity.country) {
      failedReasons.push('Opportunity has no clear location.');
    }

    const jobStyles = opportunity.danceStyles || [];
    const dancerStyles = dancer.danceStyles || [];

    if (jobStyles.length && dancerStyles.length) {
      const styleResult = this.styleScoreService.calculate(
        jobStyles,
        dancerStyles,
      );

      if (styleResult.score === 0) {
        failedReasons.push('No matching dance style.');
      }
    }

    return {
      passed: failedReasons.length === 0,
      failedReasons,
    };
  }

  private buildRisks(opportunity: Opportunity, dancer: Dancer) {
    const risks: string[] = [];

    if (!opportunity.compensation) {
      risks.push('Compensation is missing.');
    }

    if (!opportunity.deadline && !opportunity.eventStartDate) {
      risks.push('Deadline or event date is missing.');
    }

    if (!dancer.portfolioUrls?.length) {
      risks.push('Dancer has no portfolio URLs.');
    }

    return risks;
  }
}
