import { Injectable } from '@nestjs/common';

type LocationInput = {
  opportunityCity?: string | null;
  opportunityCountry?: string | null;
  dancerCity?: string | null;
  dancerCountry?: string | null;
  dancerTravelRadiusKm?: number | null;
};

@Injectable()
export class LocationScoreService {
  calculate(input: LocationInput) {
    const opportunityCity = this.normalize(input.opportunityCity);
    const dancerCity = this.normalize(input.dancerCity);

    if (opportunityCity && dancerCity && opportunityCity === dancerCity) {
      return 100;
    }

    const opportunityCountry = this.normalize(input.opportunityCountry);
    const dancerCountry = this.normalize(input.dancerCountry);

    if (
      opportunityCountry &&
      dancerCountry &&
      opportunityCountry === dancerCountry
    ) {
      return 70;
    }

    if (input.dancerTravelRadiusKm && input.dancerTravelRadiusKm > 0) {
      return 50;
    }

    if (!opportunityCity && !opportunityCountry) {
      return 30;
    }

    return 0;
  }

  private normalize(value?: string | null) {
    return value?.trim().toLowerCase() || null;
  }
}
