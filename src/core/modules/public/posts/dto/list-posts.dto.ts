import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from 'src/core/types/dto/pagination.dto';

class QueryData {
  @ApiProperty({ example: 'Search', required: false })
  search?: string;
}

class PostData {
  @ApiProperty({ example: 'clxxx123456789', required: false })
  id: string;

  @ApiProperty({ example: 'Título', required: false })
  title: string;

  @ApiProperty({ example: 'Conteúdo', required: false })
  content: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  createdAt: Date;

  @ApiProperty({ example: 'Autor' })
  author: string;
}

export class ListPostsDto extends PaginationDto {
  @ApiProperty({ example: 'Search', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Array<PostData>;

  query: QueryData;
}
