import { Injectable } from '@nestjs/common';

@Injectable()
export class ExperienceScoreService {
  calculate(input: {
    opportunityType?: string | null;
    dancerYearsExperience?: number | null;
    dancerSkillLevel?: string | null;
  }) {
    const years = input.dancerYearsExperience || 0;
    const skill = input.dancerSkillLevel?.toLowerCase();

    if (skill === 'professional') return 100;
    if (skill === 'advanced') return 85;
    if (skill === 'intermediate') return 65;
    if (skill === 'beginner') return 35;

    if (years >= 5) return 90;
    if (years >= 3) return 75;
    if (years >= 1) return 55;

    return 40;
  }
}
