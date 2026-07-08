import { Injectable } from '@nestjs/common';

@Injectable()
export class StyleScoreService {
  calculate(jobStyles: string[] = [], dancerStyles: string[] = []) {
    if (!jobStyles.length) {
      return {
        score: 50,
        matchedStyles: [],
      };
    }

    const normalizedJobStyles = jobStyles.map((style) =>
      this.normalizeStyle(style),
    );

    const normalizedDancerStyles = dancerStyles.map((style) =>
      this.normalizeStyle(style),
    );

    const matchedStyles = normalizedJobStyles.filter((style) =>
      normalizedDancerStyles.includes(style),
    );

    if (!matchedStyles.length) {
      return {
        score: 0,
        matchedStyles: [],
      };
    }

    const score = Math.round(
      (matchedStyles.length / normalizedJobStyles.length) * 100,
    );

    return {
      score,
      matchedStyles,
    };
  }

  private normalizeStyle(style: string) {
    const value = style
      .toLowerCase()
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const aliases: Record<string, string> = {
      hiphop: 'hip hop',
      'hip-hop': 'hip hop',
      'hip hop': 'hip hop',
      kpop: 'k-pop',
      'k pop': 'k-pop',
      'k-pop': 'k-pop',
      streetjazz: 'street jazz',
      'street jazz': 'street jazz',
      jazz: 'jazz',
      ballet: 'ballet',
      contemporary: 'contemporary',
      popping: 'popping',
      locking: 'locking',
      waacking: 'waacking',
      house: 'house',
      breakdance: 'breakdance',
      breaking: 'breakdance',
    };

    return aliases[value] || value;
  }
}
