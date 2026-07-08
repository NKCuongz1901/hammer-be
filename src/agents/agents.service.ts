import { Injectable, Logger } from '@nestjs/common';
import { CrawlerService } from 'src/crawler/crawler.service';
import { ExtractionService } from 'src/extraction/extraction.service';
import { MatchingService } from 'src/matching/matching.service';
import { OpportunityService } from 'src/opportunity/opportunity.service';
import { OpportunityIngestionService } from 'src/pipeLine/opportunity-ingestion.service';
import { SourceLinksCsvService } from 'src/source-links/source-links-csv.service';
import { buildAgentsGraph } from './agents.graph';
import { AgentsStateType, AgentsStateUpdate } from './agents.state';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);
  private readonly graph;

  constructor(
    private readonly sourceLinksCsvService: SourceLinksCsvService,
    private readonly crawlerService: CrawlerService,
    private readonly extractionService: ExtractionService,
    private readonly opportunityService: OpportunityService,
    private readonly matchingService: MatchingService,
  ) {
    this.graph = buildAgentsGraph({
      importCsvNode: (state) => this.importCsvNode(state),
      crawlSourcesNode: (state) => this.crawlSourcesNode(state),
      extractOpportunitiesNode: (state) => this.extractOpportunitiesNode(state),
      matchOpportunitiesNode: (state) => this.matchOpportunitiesNode(state),
    });
  }

  async run(input: { csvPath: string; limit?: number }) {
    return this.graph.invoke({
      csvPath: input.csvPath,
      limit: input.limit,
    });
  }

  async *streamRun(input: { csvPath: string; limit?: number }) {
    const stream = await this.graph.stream(
      {
        csvPath: input.csvPath,
        limit: input.limit,
      },
      { streamMode: 'updates' },
    );

    for await (const chunk of stream) {
      yield chunk as Record<string, AgentsStateUpdate>;
    }
  }

  private async importCsvNode(
    state: AgentsStateType,
  ): Promise<AgentsStateUpdate> {
    try {
      this.logger.log(`Importing CSV: ${state.csvPath}`);

      const importResult = await this.sourceLinksCsvService.csvImport(
        state.csvPath,
      );

      const sources = await this.sourceLinksCsvService.findSourcesForCrawling(
        state.limit,
      );

      return {
        sourceIds: sources.map((source) => source.id),
        logs: [
          `importCsv: importedRows=${importResult.totalRows ?? 'unknown'}, selectedSources=${sources.length}`,
        ],
      };
    } catch (error) {
      const message = this.getErrorMessage(error);

      return {
        errors: [`importCsv: ${message}`],
        logs: ['importCsv: failed'],
      };
    }
  }

  private async crawlSourcesNode(
    state: AgentsStateType,
  ): Promise<AgentsStateUpdate> {
    const rawPageIds: string[] = [];
    const logs: string[] = [];
    const errors: string[] = [];

    for (const sourceId of state.sourceIds) {
      try {
        const source = await this.sourceLinksCsvService.findById(sourceId);

        if (!source) {
          errors.push(`crawlSources: source not found: ${sourceId}`);
          continue;
        }

        this.logger.log(`Crawling source: ${source.name} - ${source.url}`);

        const crawledPage = await this.crawlerService.crawlUrl(source.url);

        const rawPage = await this.crawlerService.saveRawPage(
          source.id,
          crawledPage,
        );

        rawPageIds.push(rawPage.id);

        logs.push(
          `crawlSources: source=${source.name}, rawPageId=${rawPage.id}`,
        );
      } catch (error) {
        errors.push(`crawlSources: ${this.getErrorMessage(error)}`);
      }
    }

    return {
      rawPageIds,
      logs,
      errors,
    };
  }

  private async extractOpportunitiesNode(
    state: AgentsStateType,
  ): Promise<AgentsStateUpdate> {
    const opportunityIds: string[] = [];
    const logs: string[] = [];
    const errors: string[] = [];

    for (const rawPageId of state.rawPageIds) {
      try {
        const rawPage = await this.crawlerService.findByIdWithSource(rawPageId);

        if (!rawPage) {
          errors.push(`extractOpportunities: rawPage not found: ${rawPageId}`);
          continue;
        }

        this.logger.log(`Extracting opportunities from rawPage: ${rawPage.id}`);

        const extraction = await this.extractionService.extractOpportunities({
          sourceName: rawPage.source.name,
          sourceUrl: rawPage.finalUrl || rawPage.url,
          sourceCity: rawPage.source.city,
          sourceCountry: rawPage.source.country,
          pageTitle: rawPage.title,
          pageText: rawPage.text,
        });

        for (const opportunity of extraction.opportunities) {
          const savedOpportunity =
            await this.opportunityService.saveExtractedOpportunity({
              sourceId: rawPage.source.id,
              rawPageId: rawPage.id,
              sourceUrl: rawPage.finalUrl || rawPage.url,
              fallbackCity: rawPage.source.city,
              fallbackCountry: rawPage.source.country,
              opportunity,
            });

          opportunityIds.push(savedOpportunity.id);
        }

        logs.push(
          `extractOpportunities: rawPageId=${rawPage.id}, opportunities=${extraction.opportunities.length}`,
        );
      } catch (error) {
        errors.push(`extractOpportunities: ${this.getErrorMessage(error)}`);
      }
    }

    return {
      opportunityIds,
      logs,
      errors,
    };
  }

  private async matchOpportunitiesNode(
    state: AgentsStateType,
  ): Promise<AgentsStateUpdate> {
    const recommendationIds: string[] = [];
    const logs: string[] = [];
    const errors: string[] = [];

    for (const opportunityId of state.opportunityIds) {
      try {
        this.logger.log(`Matching opportunity: ${opportunityId}`);

        const recommendations =
          await this.matchingService.matchOpportunityToDancers(opportunityId);

        recommendationIds.push(
          ...recommendations.map((recommendation) => recommendation.id),
        );

        logs.push(
          `matchOpportunities: opportunityId=${opportunityId}, recommendations=${recommendations.length}`,
        );
      } catch (error) {
        errors.push(`matchOpportunities: ${this.getErrorMessage(error)}`);
      }
    }

    return {
      recommendationIds,
      logs,
      errors,
    };
  }

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
