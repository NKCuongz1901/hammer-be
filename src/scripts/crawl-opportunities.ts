import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { OpportunityIngestionService } from 'src/pipeLine/opportunity-ingestion.service';

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
    const service = app.get(OpportunityIngestionService);

    const csvPath = getArg('csv', 'data/source-links.csv')!;
    const outputPath = getArg('output', 'generated/opportunities.json')!;
    const limitArg = getArg('limit');
    const limit = limitArg ? Number(limitArg) : undefined;

    const result = await service.run({
      csvPath,
      outputPath,
      limit,
    });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});