import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationFilterDto } from './dto/recommendation-filter.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  async getRecommendations(@Query() filter: RecommendationFilterDto) {
    return this.recommendationsService.getRecommendations(filter);
  }

  @Get(':id/draft-email')
  async getDraftEmail(@Param('id') id: string) {
    return this.recommendationsService.generateDraftEmail(id);
  }

  @Get(':id')
  async getRecommendationById(@Param('id') id: string) {
    return this.recommendationsService.findById(id);
  }
}
