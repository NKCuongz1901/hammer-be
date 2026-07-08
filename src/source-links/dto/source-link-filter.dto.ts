import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
export class SourceLinkFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  itemsPerPage?: number;
}
