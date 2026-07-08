import { Injectable, Logger } from '@nestjs/common';
import { ChatGoogle } from '@langchain/google';
import { ConfigService } from '@nestjs/config';
import { DanceOpportunityExtractionResultSchema } from 'src/common/schemas/dance-opportunity.schema';
import { truncateForLlm } from 'src/common/utils/string.ultils';

export type ExtractedOpportunity = {
  title: string;
  organization: string | null;
  opportunityType: string;
  description: string;
  danceStyles: string[];
  locationText: string | null;
  city: string | null;
  country: string | null;
  requirements: Record<string, unknown> | null;
  compensation: Record<string, unknown> | null;
  applicationUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  deadline: string | null;
  eventStartDate: string | null;
  eventEndDate: string | null;
  confidence: number;
  missingFields: string[];
};

export type ExtractOpportunitiesInput = {
  sourceName: string;
  sourceUrl: string;
  sourceCity?: string | null;
  sourceCountry?: string | null;
  pageTitle?: string | null;
  pageText: string;
};

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  private readonly configService = new ConfigService();
  private readonly googleApiKey = this.configService.get('GOOGLE_API_KEY');

  private readonly model = new ChatGoogle({
    model: 'gemini-2.5-flash',
    apiKey: this.googleApiKey,
    temperature: 0,
  });

  private readonly structuredModel = this.model.withStructuredOutput(
    DanceOpportunityExtractionResultSchema,
    {
      name: 'dance_opportunity_extraction',
    },
  );

  async extractOpportunities(input: ExtractOpportunitiesInput) {
    const {
      sourceName,
      sourceUrl,
      sourceCity,
      sourceCountry,
      pageTitle,
      pageText,
    } = input;
    const truncatedPageText = truncateForLlm(pageText);

    const prompt = `
        You are an expert dance job, casting, audition, and performance opportunity extraction agent.
        
        Extract only real and actionable opportunities for dancers.
        
        Valid opportunity examples:
        - dance instructor job
        - dance teacher job
        - dance audition
        - performer casting
        - choreographer role
        - agency signup
        - public performance signup
        - dance workshop with application or booking information
        
        Do not extract:
        - generic studio homepage with no hiring, casting, signup, or opportunity
        - general article with no actionable opportunity
        - navigation menu items
        - unrelated classes unless they clearly invite instructors, performers, or applicants
        
        Rules:
        - Do not invent missing information.
        - If a field is not visible in the text, return null and add it to missingFields.
        - If application form, contact email, contact phone, or apply URL exists, capture it.
        - If page city/country is unclear, use source city/country as fallback only if reasonable.
        - Dates must be ISO date strings if you can confidently normalize them.
        - If date cannot be normalized, leave date field as null.
        - Description should be concise but useful.
        - confidence must be 0 to 1.
        
        Source:
        Name: ${sourceName}
        URL: ${sourceUrl}
        Known city: ${sourceCity || ''}
        Known country: ${sourceCountry || ''}
        Page title: ${pageTitle || ''}
        
        Page text:
        ${truncatedPageText}
        `;

    return this.structuredModel.invoke(prompt);
  }
}
