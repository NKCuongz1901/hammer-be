import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DancerFilterDto } from './dto/dancer-filter.dto';

@Injectable()
export class DancerService {
  constructor(private readonly prisma: PrismaService) {}

  async getDancers(filter: DancerFilterDto) {
    const { page = 1, itemsPerPage = 10 } = filter;
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;

    const data = await this.prisma.dancer.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.prisma.dancer.count();
    const totalPages = Math.ceil(total / itemsPerPage);

    return { data, total, totalPages, currentPage: page };
  }

  async findById(id: string) {
    return this.prisma.dancer.findUnique({
      where: {
        id,
      },
    });
  }

  async getRecommendations(dancerId: string) {
    return this.prisma.recommendation.findMany({
      where: {
        dancerId,
      },
      include: {
        opportunity: true,
      },
      orderBy: {
        finalScore: 'desc',
      },
    });
  }
}
