import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma';
import { PaginatedResponseDto, PaginationDto } from 'src/core/types/dto/pagination.dto';

class UserDocumentFile {
  @ApiProperty({ example: 'clxxx123456789' })
  id: string;

  @ApiProperty({ example: 'https://us-east-1.amazonaws.com/imagem?123' })
  url: string;
}

class AdminListDocumentQuery {
  @ApiProperty({ example: DocumentType.RG, enum: DocumentType })
  type: DocumentType;

  @ApiProperty({ example: false })
  validated: string;
}

export class UploadUserDocumentDto {
  // @ApiProperty({ type: 'string', format: 'binary' })
  // file: Express.Multer.File;

  @ApiProperty({ example: DocumentType.RG, enum: DocumentType })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ApiProperty({ example: '102.204.343-54' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  number: string;
}

export class UserDocumentResponseDto {
  @ApiProperty({ example: 'clxxx123456789' })
  id: string;

  @ApiProperty({ example: DocumentType.RG, enum: DocumentType })
  type: DocumentType;

  @ApiProperty({ example: '102.204.343-54' })
  number: string;

  @ApiProperty({ example: false })
  validated: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: UserDocumentFile })
  file: UserDocumentFile;
}

export class ListDocumentResponseDto extends Array<UserDocumentResponseDto> {}

export class AdminListDocumentDto extends PaginationDto {
  @ApiProperty({ example: DocumentType.RG, enum: DocumentType })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type?: DocumentType;

  @ApiProperty({ example: false })
  @IsBoolean()
  validated?: boolean;
}

export class AdminListDocumentResponseDto extends PaginatedResponseDto<UserDocumentResponseDto> {
  query: AdminListDocumentQuery;
}
