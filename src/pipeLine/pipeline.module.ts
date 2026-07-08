import { Module } from "@nestjs/common";
import { OpportunityIngestionService } from "./opportunity-ingestion.service";
import { CrawlerModule } from "src/crawler/crawler.module";
import { SourceLinksModule } from "src/source-links/source-links.module";
import { ExtractionModule } from "src/extraction/extraction.module";
import { OpportunityModule } from "src/opportunity/opportunity.module";


@Module({
    imports:[
        SourceLinksModule,
        CrawlerModule,
        ExtractionModule,
        OpportunityModule,
    ],
    providers: [OpportunityIngestionService],
    exports: [OpportunityIngestionService],
})
export class PipelineModule {}