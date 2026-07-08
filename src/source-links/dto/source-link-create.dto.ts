import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SourceLinkCreateDto {
    @IsNotEmpty()
    @IsString()
    sourceCode: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    url: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    contactType?: string;

    @IsOptional()
    @IsString()
    fit?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    enabled?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}