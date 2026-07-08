import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { MatchingService } from 'src/matching/matching.service';

function getArg(name: string, fallback?: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) {
    return fallback;
  }

  return process.argv[index + 1] || fallback;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const matchingService = app.get(MatchingService);

    const opportunityId = getArg('opportunityId');

    if (opportunityId) {
      const result =
        await matchingService.matchOpportunityToDancers(opportunityId);

      console.log(
        JSON.stringify(
          {
            opportunityId,
            recommendations: result.length,
            result,
          },
          null,
          2,
        ),
      );

      return;
    }

    const result = await matchingService.matchAllCompleteOpportunities();

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
