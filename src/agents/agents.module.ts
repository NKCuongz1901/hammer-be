import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { ExtractionModule } from 'src/extraction/extraction.module';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { SourceLinksModule } from 'src/source-links/source-links.module';
import { MatchingModule } from 'src/matching/matching.module';
import { OpportunityModule } from 'src/opportunity/opportunity.module';

@Module({
  imports: [
    SourceLinksModule,
    CrawlerModule,
    ExtractionModule,
    OpportunityModule,
    MatchingModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
