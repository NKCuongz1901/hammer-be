import { Injectable } from '@nestjs/common';

@Injectable()
export class CompensationScoreService {
  calculate(input: {
    compensation: unknown;
    dancerMinCompensation?: number | null;
  }) {
    if (!input.dancerMinCompensation) {
      return 80;
    }

    const compensation = input.compensation as {
      min?: number | null;
      max?: number | null;
      isPaid?: boolean | null;
    } | null;

    if (!compensation) {
      return 50;
    }

    if (compensation.isPaid === false) {
      return 20;
    }

    const maxPay = compensation.max || compensation.min;

    if (!maxPay) {
      return 50;
    }

    if (maxPay >= input.dancerMinCompensation) {
      return 100;
    }

    return 30;
  }
}
