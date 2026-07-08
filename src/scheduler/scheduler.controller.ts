import { Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('run-crawl')
  async runCrawlNow() {
    return this.schedulerService.handleCrawlPipelineCron();
  }

  @Sse('run-crawl/stream')
  streamCrawl(): Observable<MessageEvent> {
    return this.schedulerService.streamCrawlPipeline();
  }
}
