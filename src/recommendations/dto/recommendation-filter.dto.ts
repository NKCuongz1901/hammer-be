import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class RecommendationFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  itemsPerPage?: number;
}
