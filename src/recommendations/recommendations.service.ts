import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGoogle } from '@langchain/google';
import { ConfigService } from '@nestjs/config';
import { DraftEmailSchema } from 'src/common/schemas/draft-email.schema';
import { RecommendationFilterDto } from './dto/recommendation-filter.dto';

type UpsertRecommendationInput = {
  opportunityId: string;
  dancerId: string;

  finalScore: number;
  styleScore?: number;
  locationScore?: number;
  typeScore?: number;
  availabilityScore?: number;
  experienceScore?: number;
  compensationScore?: number;

  reason?: string;
  risks?: string[];
  suggestedMessage?: string;
  status?: string;
};

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(filter: RecommendationFilterDto) {
    const { page = 1, itemsPerPage = 10 } = filter;
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;

    const data = await this.prisma.recommendation.findMany({
      skip,
      take,
      include: {
        opportunity: true,
        dancer: true,
      },
      orderBy: [{ finalScore: 'desc' }, { createdAt: 'desc' }],
    });
    const total = await this.prisma.recommendation.count();
    const totalPages = Math.ceil(total / itemsPerPage);

    return { data, total, totalPages, currentPage: page };
  }

  async findById(id: string) {
    return this.prisma.recommendation.findUnique({
      where: {
        id,
      },
      include: {
        opportunity: true,
        dancer: true,
      },
    });
  }

  private readonly configService = new ConfigService();
  private readonly model = new ChatGoogle({
    model: 'gemini-2.5-flash',
    apiKey: this.configService.get('GOOGLE_API_KEY'),
    temperature: 1,
  });

  private readonly structuredModel = this.model.withStructuredOutput(
    DraftEmailSchema,
    {
      name: 'draft_email',
    },
  );

  async generateDraftEmail(recommendId: string) {
    const reccommendation = await this.prisma.recommendation.findUnique({
      where: {
        id: recommendId,
      },
      include: {
        opportunity: true,
        dancer: true,
      },
    });
    if (!reccommendation) {
      throw new Error('Recommendation not found');
    }

    const result = await this.structuredModel.invoke(`
      Write a short professional application message for a dancer applying to a dance opportunity.
      
      Return only a JSON object with this shape:
      {
        "message": "..."
      }
      
      Rules:
      - Use only the provided data.
      - Do not invent experience, awards, availability, portfolio, or certifications.
      - Do not mention AI, matching score, recommendation system, or database.
      - Keep it warm, professional, confident, and concise.
      - The message should be ready to copy and paste into an email or application form.
      - Start with "Dear Hiring Team," unless a specific organization/contact name is available.
      - End with the dancer's name.
      
      Opportunity:
      ${JSON.stringify(reccommendation.opportunity, null, 2)}
      
      Dancer:
      ${JSON.stringify(reccommendation.dancer, null, 2)}
      
      Recommendation reason:
      ${reccommendation.reason || ''}
      `);

    return result.message;
  }

  async upsert(input: UpsertRecommendationInput) {
    return this.prisma.recommendation.upsert({
      where: {
        opportunityId_dancerId: {
          opportunityId: input.opportunityId,
          dancerId: input.dancerId,
        },
      },
      create: {
        opportunityId: input.opportunityId,
        dancerId: input.dancerId,

        finalScore: input.finalScore,
        styleScore: input.styleScore,
        locationScore: input.locationScore,
        typeScore: input.typeScore,
        availabilityScore: input.availabilityScore,
        experienceScore: input.experienceScore,
        compensationScore: input.compensationScore,

        reason: input.reason,
        risks: input.risks || [],
        suggestedMessage: input.suggestedMessage,
        status: input.status || 'pending_review',
      },
      update: {
        finalScore: input.finalScore,
        styleScore: input.styleScore,
        locationScore: input.locationScore,
        typeScore: input.typeScore,
        availabilityScore: input.availabilityScore,
        experienceScore: input.experienceScore,
        compensationScore: input.compensationScore,

        reason: input.reason,
        risks: input.risks || [],
        suggestedMessage: input.suggestedMessage,
        status: input.status || 'pending_review',
      },
    });
  }
}
