import { Controller, Get, Param, Query } from '@nestjs/common';
import { DancerService } from './dancer.service';
import { DancerFilterDto } from './dto/dancer-filter.dto';

@Controller('dancer')
export class DancerController {
  constructor(private readonly dancerService: DancerService) {}

  @Get()
  async getDancers(@Query() filter: DancerFilterDto) {
    return this.dancerService.getDancers(filter);
  }

  @Get(':id')
  async getDancerById(@Param('id') id: string) {
    return this.dancerService.findById(id);
  }

  @Get(':id/recommendations')
  async getDancerRecommendations(@Param('id') id: string) {
    return this.dancerService.getRecommendations(id);
  }
}
