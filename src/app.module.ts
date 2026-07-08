import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { SourceLinksModule } from './source-links/source-links.module';
import { CrawlerModule } from './crawler/crawler.module';
import { ExtractionModule } from './extraction/extraction.module';
import { OpportunityModule } from './opportunity/opportunity.module';
import { PipelineModule } from './pipeLine/pipeline.module';
import { MatchingModule } from './matching/matching.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AgentsModule } from './agents/agents.module';
import { DancerModule } from './dancer/dancer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    SourceLinksModule,
    CrawlerModule,
    ExtractionModule,
    OpportunityModule,
    PipelineModule,
    MatchingModule,
    RecommendationsModule,
    SchedulerModule,
    AgentsModule,
    DancerModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
