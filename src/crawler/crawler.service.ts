import { Injectable, Logger } from '@nestjs/common';
import { chromium } from 'playwright';
import { cleanPageText, sha256 } from 'src/common/utils/string.ultils';
import { PrismaService } from 'src/prisma/prisma.service';

export type CrawledPage = {
  url: string;
  finalUrl: string;
  title: string;
  html: string;
  text: string;
  contentHash: string;
  statusCode?: number;
};

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  constructor(private readonly prisma: PrismaService) {}

  async crawlUrl(url: string): Promise<CrawledPage> {
    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage({
        userAgent:
          'HammerDanceOpportunityBot/0.1 (+contact: your-email@example.com)',
      });

      this.logger.log(`Opening ${url}`);

      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });

      await page
        .waitForLoadState('networkidle', {
          timeout: 10000,
        })
        .catch(() => undefined);

      const title = await page.title();
      const html = await page.content();

      const rawText = await page
        .locator('body')
        .innerText({
          timeout: 10000,
        })
        .catch(() => '');

      const text = cleanPageText(rawText);

      return {
        url,
        finalUrl: page.url(),
        title,
        html,
        text,
        contentHash: sha256(`${page.url()}\n${text}`),
        statusCode: response?.status(),
      };
    } finally {
      await browser.close();
    }
  }

  async saveRawPage(sourceId: string, page: CrawledPage) {
    return this.prisma.rawPage.upsert({
      where: {
        sourceId_contentHash: {
          sourceId,
          contentHash: page.contentHash,
        },
      },
      create: {
        sourceId,
        url: page.url,
        finalUrl: page.finalUrl,
        title: page.title,
        html: page.html,
        text: page.text,
        contentHash: page.contentHash,
        statusCode: page.statusCode || null,
      },
      update: {
        finalUrl: page.finalUrl,
        title: page.title,
        html: page.html,
        text: page.text,
        statusCode: page.statusCode || null,
        errorMessage: null,
        scrapedAt: new Date(),
      },
    });
  }

  async findByIdWithSource(id: string) {
    return this.prisma.rawPage.findUnique({
      where: {
        id,
      },
      include: {
        source: true,
      },
    });
  }
}
