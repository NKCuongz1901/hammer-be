import { Injectable } from '@nestjs/common';

@Injectable()
export class AvailabilityScoreService {
  calculate(input: {
    dancerAvailability?: unknown;
    deadline?: Date | null;
    eventStartDate?: Date | null;
  }) {
    if (input.deadline && input.deadline < new Date()) {
      return 0;
    }

    return 70;
  }
}
