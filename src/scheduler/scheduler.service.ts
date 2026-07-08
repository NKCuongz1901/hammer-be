import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { AgentsService } from 'src/agents/agents.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isRunning = false;

  constructor(
    private readonly agentsService: AgentsService,
    private readonly configService: ConfigService,
  ) {}

  // Mỗi ngày 2:00 sáng
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCrawlPipelineCron() {
    const enabled = this.configService.get<string>(
      'CRON_CRAWL_ENABLED',
      'true',
    );
    if (enabled !== 'true') {
      return;
    }

    if (this.isRunning) {
      this.logger.warn('Crawl job skipped: previous run still in progress');
      return;
    }

    this.isRunning = true;

    try {
      this.logger.log('Starting scheduled crawl pipeline...');

      const result = await this.agentsService.run({
        csvPath: this.configService.get(
          'CRAWL_CSV_PATH',
          'data/source-links.csv',
        ),
        limit: Number(this.configService.get('CRAWL_LIMIT', '20')),
      });

      this.logger.log(`Crawl pipeline finished: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error('Scheduled crawl pipeline failed', error);
    } finally {
      this.isRunning = false;
    }
  }

  streamCrawlPipeline(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      let cancelled = false;

      const emit = (data: unknown) =>
        subscriber.next({ data } as MessageEvent);

      const csvPath = this.configService.get(
        'CRAWL_CSV_PATH',
        'data/source-links.csv',
      );
      const limit = Number(this.configService.get('CRAWL_LIMIT', '20'));

      void (async () => {
        if (this.isRunning) {
          emit({
            type: 'busy',
            message: 'Crawl pipeline is already running',
          });
          subscriber.complete();
          return;
        }

        this.isRunning = true;

        try {
          this.logger.log('Starting streamed crawl pipeline...');
          emit({ type: 'start', csvPath, limit });

          for await (const chunk of this.agentsService.streamRun({
            csvPath,
            limit,
          })) {
            if (cancelled) break;

            const node = Object.keys(chunk)[0];
            emit({ type: 'node', node, update: chunk[node] });
          }

          if (!cancelled) {
            emit({ type: 'done' });
          }

          this.logger.log('Streamed crawl pipeline finished');
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error('Streamed crawl pipeline failed', error);
          emit({ type: 'error', message });
        } finally {
          this.isRunning = false;
          subscriber.complete();
        }
      })();

      return () => {
        cancelled = true;
      };
    });
  }
}
