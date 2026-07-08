import { Module } from '@nestjs/common';
import { DancerService } from './dancer.service';
import { DancerController } from './dancer.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DancerController],
  providers: [DancerService, PrismaService],
  exports: [DancerService],
})
export class DancerModule {}
