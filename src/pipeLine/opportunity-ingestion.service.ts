import { Injectable, Logger } from '@nestjs/common';
import { SourceLinksCsvService } from '../source-links/source-links-csv.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { ExtractionService } from 'src/extraction/extraction.service';
import { OpportunityService } from 'src/opportunity/opportunity.service';


@Injectable()
export class OpportunityIngestionService {
  private readonly logger = new Logger(OpportunityIngestionService.name);

  constructor(
    private readonly sourceLinksCsvService: SourceLinksCsvService,
    private readonly sourceLinksService: SourceLinksCsvService,
    private readonly crawlerService: CrawlerService,
    private readonly extractionService: ExtractionService,
    private readonly opportunityService: OpportunityService,
  ) {}

  async run(params: {
    csvPath: string;
    limit?: number;
    outputPath?: string;
  }) {
    this.logger.log(`Importing CSV: ${params.csvPath}`);

    const importResult = await this.sourceLinksCsvService.csvImport(params.csvPath);

    this.logger.log(
      `CSV imported. totalRows=${importResult.totalRows}, imported=${importResult.imported}, skipped=${importResult.skipped}`,
    );

    const sources = await this.sourceLinksService.getSourceForCrawl(
      params.limit,
    );

    this.logger.log(`Sources selected for crawl: ${sources.length}`);

    let totalRawPages = 0;
    let totalExtracted = 0;
    let totalSaved = 0;
    let totalFailed = 0;

    for (const source of sources) {
      try {
        this.logger.log(`[${source.sourceCode}] Crawling ${source.url}`);

        const page = await this.crawlerService.crawlUrl(source.url);

        if (!page.text || page.text.length < 100) {
          throw new Error('Page text is too short or empty');
        }

        const rawPage = await this.crawlerService.saveRawPage(source.id, page);
        totalRawPages += 1;

        this.logger.log(
          `[${source.sourceCode}] RawPage saved: ${rawPage.id}, text=${page.text.length} chars`,
        );

        const extraction = await this.extractionService.extractOpportunities({
          sourceName: source.name,
          sourceUrl: source.url,
          sourceCity: source.city,
          sourceCountry: source.country,
          pageTitle: page.title,
          pageText: page.text,
        });

        const opportunities =
          extraction.opportunities as any;

        totalExtracted += opportunities.length;

        this.logger.log(
          `[${source.sourceCode}] Extracted opportunities: ${opportunities.length}`,
        );

        for (const opportunity of opportunities) {
          await this.opportunityService.saveExtractedOpportunity({
            sourceId: source.id,
            sourceUrl: source.url,
            rawPageId: rawPage.id,
            fallbackCity: source.city,
            fallbackCountry: source.country,
            opportunity,
          });

          totalSaved += 1;
        }

        await this.sourceLinksService.markCrawlSuccess(source.id);

        await this.sleep(1500);
      } catch (error) {
        totalFailed += 1;

        const message =
          error instanceof Error ? error.message : 'Unknown crawl error';

        this.logger.error(`[${source.sourceCode}] Failed: ${message}`);

        await this.sourceLinksService.markCrawlFailed(source.id, message);
      }
    }

    const exportResult = await this.opportunityService.exportToJson(
      params.outputPath || 'generated/opportunities.json',
    );

    return {
      csv: importResult,
      crawl: {
        totalSources: sources.length,
        totalRawPages,
        totalExtracted,
        totalSaved,
        totalFailed,
      },
      export: exportResult,
    };
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}