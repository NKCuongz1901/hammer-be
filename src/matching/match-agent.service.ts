import { ChatGoogle } from '@langchain/google';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchAnalysisSchema } from 'src/common/schemas/match-analysis.schema';

@Injectable()
export class MatchAgentService {
  private readonly configService = new ConfigService();

  private readonly model = new ChatGoogle({
    model: 'gemini-2.5-flash',
    apiKey: this.configService.get('GOOGLE_API_KEY'),
    temperature: 0,
  });

  private readonly structuredModel = this.model.withStructuredOutput(
    MatchAnalysisSchema,
    {
      name: 'match_analysis',
    },
  );

  async analyzeMatch(input: {
    opportunity: unknown;
    dancer: unknown;
    score: unknown;
  }) {
    const prompt = `
You are a dance talent matching analyst.

You will receive:
1. A dance opportunity
2. A dancer profile
3. Deterministic match scores calculated by business rules

Rules:
- Do not change or recalculate the score.
- Do not invent missing information.
- If finalScore is below 65, shouldRecommend must be false.
- If hardFilterPassed is false, shouldRecommend must be false.
- Explain why the match is relevant.
- Mention risks and missing info.
- Write a short friendly message that can be sent to the dancer.
- Keep the reason practical and concise.

Opportunity:
${JSON.stringify(input.opportunity, null, 2)}

Dancer:
${JSON.stringify(input.dancer, null, 2)}

Score:
${JSON.stringify(input.score, null, 2)}
`;

    return this.structuredModel.invoke(prompt);
  }
}
