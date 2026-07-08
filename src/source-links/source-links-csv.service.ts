import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaService } from 'src/prisma/prisma.service';
import { SourceLinkCreateDto } from './dto/source-link-create.dto';
import {
  buildSourceCode,
  isHttpUrl,
  normalizeUrl,
  parseBoolean,
} from 'src/common/utils/string.ultils';
import { SourceLinkFilterDto } from './dto/source-link-filter.dto';

@Injectable()
export class SourceLinksCsvService {
  constructor(private readonly prismaService: PrismaService) {}

  async csvImport(csvFilePath: string) {
    const csv = readFileSync(csvFilePath, 'utf-8');
    const rows = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as SourceLinkCreateDto[];

    const result = [] as any;

    for (const row of rows) {
      const url = normalizeUrl(row.url);
      if (!isHttpUrl(url)) {
        result.push({
          sourceCode: row.sourceCode,
          status: 'skipped_invalid_url',
          url,
        });
        continue;
      }

      const sourceCode = buildSourceCode(row.category, url);

      const source = await this.prismaService.sourceLink.upsert({
        where: {
          sourceCode,
        },
        create: {
          sourceCode,
          category: row.category,
          name: row.name,
          url,
          city: row.city,
          country: row.city,
          enabled: true,
          priority: 1,
        },
        update: {
          category: row.category,
          name: row.name,
          url,
          city: row.city,
          country: row.city,
          enabled: true,
          priority: 1,
        },
      });
      result.push({
        sourceCode: source.sourceCode,
        name: source.name,
        status: 'upserted',
        url: source.url,
      });
    }
    return {
      totalRows: rows.length,
      imported: result.filter((r) => r.status === 'upserted').length,
      skipped: result.filter((r) => r.status !== 'upserted').length,
      result,
    };
  }

  async getSourceForCrawl(limit?: number) {
    return this.prismaService.sourceLink.findMany({
      where: {
        enabled: true,
        category: {
          notIn: [
            'facebook_public',
            'public_facebook',
            'facebook',
            'discovery_query',
            'google_query',
          ],
        },
      },
      orderBy: {
        priority: 'asc',
      },
      take: limit || 10,
    });
  }

  async markCrawlSuccess(sourceId: string) {
    return this.prismaService.sourceLink.update({
      where: {
        id: sourceId,
      },
      data: {
        lastCrawledAt: new Date(),
        crawlStatus: 'success',
        errorMessage: null,
      },
    });
  }

  async markCrawlFailed(sourceId: string, errorMessage: string) {
    return this.prismaService.sourceLink.update({
      where: {
        id: sourceId,
      },
      data: {
        lastCrawledAt: new Date(),
        crawlStatus: 'failed',
        errorMessage,
      },
    });
  }

  async findSourcesForCrawling(limit?: number) {
    return this.prismaService.sourceLink.findMany({
      where: {
        enabled: true,
      },
      orderBy: [
        {
          priority: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
      take: limit,
    });
  }

  async findById(id: string) {
    return this.prismaService.sourceLink.findUnique({
      where: {
        id,
      },
    });
  }

  async getSourceLinks(filter: SourceLinkFilterDto) {
    const { page = 1, itemsPerPage = 10 } = filter;
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;
    const data = await this.prismaService.sourceLink.findMany({
      skip,
      take,
    });
    const total = await this.prismaService.sourceLink.count();
    const totalPages = Math.ceil(total / itemsPerPage);
    return { data, total, totalPages, currentPage: page };
  }
}
