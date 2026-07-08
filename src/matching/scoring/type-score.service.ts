import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeScoreService {
  calculate(opportunityType?: string | null, preferredTypes: string[] = []) {
    if (!opportunityType) {
      return 50;
    }

    if (!preferredTypes.length) {
      return 60;
    }

    const normalizedOpportunityType = this.normalize(opportunityType);

    const normalizedPreferredTypes = preferredTypes.map((type) =>
      this.normalize(type),
    );

    if (normalizedPreferredTypes.includes(normalizedOpportunityType)) {
      return 100;
    }

    const compatibilityMap: Record<string, string[]> = {
      dance_instructor: ['dance_teacher', 'workshop'],
      dance_teacher: ['dance_instructor', 'workshop'],
      audition: ['casting', 'performance', 'agency_signup'],
      casting: ['audition', 'performance', 'agency_signup'],
      performance: ['audition', 'casting', 'agency_signup'],
      workshop: ['dance_instructor', 'dance_teacher'],
    };

    const compatibleTypes = compatibilityMap[normalizedOpportunityType] || [];

    const hasCompatibleType = compatibleTypes.some((type) =>
      normalizedPreferredTypes.includes(type),
    );

    return hasCompatibleType ? 70 : 30;
  }

  private normalize(value: string) {
    return value.trim().toLowerCase();
  }
}
