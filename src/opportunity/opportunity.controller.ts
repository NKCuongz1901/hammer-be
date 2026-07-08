import { Controller, Get, Param, Query } from '@nestjs/common';
import { OpportunityService } from './opportunity.service';
import { OpportunityFilterDto } from './dto/opportunity-filter.dto';

@Controller('opportunity')
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Get()
  async getOpportunities(@Query() filter: OpportunityFilterDto) {
    return this.opportunityService.getOpportunities(filter);
  }

  @Get(':id')
  async getOpportunityById(@Param('id') id: string) {
    return this.opportunityService.findById(id);
  }
}
