import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractedOpportunity } from '../extraction/extraction.service';
import { calculateOpportunityCompleteness } from './opportunity-completeness';
import { sha256 } from 'src/common/utils/string.ultils';
import { OpportunityFilterDto } from './dto/opportunity-filter.dto';

@Injectable()
export class OpportunityService {
  constructor(private readonly prisma: PrismaService) {}

  async saveExtractedOpportunity(input: {
    sourceId: string;
    sourceUrl: string;
    rawPageId: string;
    fallbackCity?: string | null;
    fallbackCountry?: string | null;
    opportunity: ExtractedOpportunity;
  }) {
    const opp = input.opportunity;

    const quality = calculateOpportunityCompleteness(opp);

    const canonicalKey = this.buildCanonicalKey({
      sourceUrl: input.sourceUrl,
      title: opp.title,
      organization: opp.organization,
      city: opp.city || input.fallbackCity,
      country: opp.country || input.fallbackCountry,
      deadline: opp.deadline,
      eventStartDate: opp.eventStartDate,
    });

    return this.prisma.opportunity.upsert({
      where: {
        canonicalKey,
      },
      create: {
        sourceId: input.sourceId,
        rawPageId: input.rawPageId,

        title: opp.title,
        organization: opp.organization,
        opportunityType: opp.opportunityType,
        description: opp.description,
        danceStyles: opp.danceStyles || [],

        locationText: opp.locationText,
        city: opp.city || input.fallbackCity || null,
        country: opp.country || input.fallbackCountry || null,

        requirements: opp.requirements
          ? JSON.stringify(opp.requirements)
          : undefined,
        compensation: opp.compensation
          ? JSON.stringify(opp.compensation)
          : undefined,

        applicationUrl: opp.applicationUrl,
        contactEmail: opp.contactEmail,
        contactPhone: opp.contactPhone,

        deadline: this.parseNullableDate(opp.deadline),
        eventStartDate: this.parseNullableDate(opp.eventStartDate),
        eventEndDate: this.parseNullableDate(opp.eventEndDate),

        confidence: opp.confidence,
        completenessScore: quality.completenessScore,
        missingFields: quality.missingFields,

        rawUrl: input.sourceUrl,
        canonicalKey,

        status:
          quality.completenessScore >= 70 && opp.confidence >= 0.7
            ? 'complete'
            : 'incomplete',
      },
      update: {
        rawPageId: input.rawPageId,

        title: opp.title,
        organization: opp.organization,
        opportunityType: opp.opportunityType,
        description: opp.description,
        danceStyles: opp.danceStyles || [],

        locationText: opp.locationText,
        city: opp.city || input.fallbackCity || null,
        country: opp.country || input.fallbackCountry || null,

        requirements: opp.requirements
          ? JSON.stringify(opp.requirements)
          : undefined,
        compensation: opp.compensation
          ? JSON.stringify(opp.compensation)
          : undefined,

        applicationUrl: opp.applicationUrl,
        contactEmail: opp.contactEmail,
        contactPhone: opp.contactPhone,

        deadline: this.parseNullableDate(opp.deadline),
        eventStartDate: this.parseNullableDate(opp.eventStartDate),
        eventEndDate: this.parseNullableDate(opp.eventEndDate),

        confidence: opp.confidence,
        completenessScore: quality.completenessScore,
        missingFields: quality.missingFields,

        status:
          quality.completenessScore >= 70 && opp.confidence >= 0.7
            ? 'complete'
            : 'incomplete',
      },
    });
  }

  async exportToJson(outputPath = 'generated/opportunities.json') {
    const { mkdirSync, writeFileSync } = await import('fs');
    const { dirname } = await import('path');

    const opportunities = await this.prisma.opportunity.findMany({
      include: {
        source: true,
        rawPage: {
          select: {
            id: true,
            url: true,
            finalUrl: true,
            title: true,
            scrapedAt: true,
          },
        },
      },
      orderBy: [
        {
          status: 'asc',
        },
        {
          completenessScore: 'desc',
        },
        {
          extractedAt: 'desc',
        },
      ],
    });

    mkdirSync(dirname(outputPath), {
      recursive: true,
    });

    writeFileSync(
      outputPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          total: opportunities.length,
          opportunities,
        },
        null,
        2,
      ),
      'utf8',
    );

    return {
      outputPath,
      total: opportunities.length,
    };
  }

  private buildCanonicalKey(input: {
    sourceUrl: string;
    title: string;
    organization?: string | null;
    city?: string | null;
    country?: string | null;
    deadline?: string | null;
    eventStartDate?: string | null;
  }) {
    return sha256(
      [
        input.sourceUrl,
        input.title,
        input.organization || '',
        input.city || '',
        input.country || '',
        input.deadline || '',
        input.eventStartDate || '',
      ]
        .join('|')
        .toLowerCase()
        .trim(),
    );
  }

  private parseNullableDate(value?: string | null) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  async getOpportunities(filter: OpportunityFilterDto) {
    const { page = 1, itemsPerPage = 20 } = filter;
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;
    const data = await this.prisma.opportunity.findMany({
      skip,
      take,
      orderBy: {
        extractedAt: 'desc',
      },
    });
    const total = await this.prisma.opportunity.count();
    const totalPages = Math.ceil(total / itemsPerPage);
    return { data, total, totalPages, currentPage: page };
  }

  async findById(id: string) {
    return this.prisma.opportunity.findUnique({
      where: {
        id,
      },
    });
  }
}
