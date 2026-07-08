import { Controller, Get, Param, Query } from '@nestjs/common';
import { SourceLinksCsvService } from './source-links-csv.service';
import { SourceLinkFilterDto } from './dto/source-link-filter.dto';

@Controller('source-links')
export class SourceLinksController {
  constructor(private readonly sourceLinksService: SourceLinksCsvService) {}

  @Get()
  async getSourceLinks(@Query() filter: SourceLinkFilterDto) {
    return this.sourceLinksService.getSourceLinks(filter);
  }

  @Get(':id')
  async getSourceLinkById(@Param('id') id: string) {
    return this.sourceLinksService.findById(id);
  }
}
