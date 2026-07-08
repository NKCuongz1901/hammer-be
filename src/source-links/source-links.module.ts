import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SourceLinksCsvService } from './source-links-csv.service';
import { SourceLinksController } from './source-links.controller';

@Module({
  controllers: [SourceLinksController],
  providers: [SourceLinksCsvService, PrismaService],
  exports: [SourceLinksCsvService],
})
export class SourceLinksModule {}
