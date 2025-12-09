import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  ListDocumentResponseDto,
  UploadUserDocumentDto,
  UserDocumentResponseDto,
} from '../../common/dto/document.dto';
import { Doc } from 'src/utils/documentation/doc';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/utils/decorators/user-id.decorator';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { UserRole } from 'generated/prisma';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('User/Documents')
@Roles(UserRole.USER)
@Controller('/user/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Doc({
    name: 'Enviar documento',
    response: UserDocumentResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createDocument(
    @Body() data: UploadUserDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: string,
  ) {
    return await this.documentService.createDocument({ data, file, userId });
  }

  @Doc({
    name: 'Listar documentos',
    response: ListDocumentResponseDto,
  })
  @Get()
  async listDocument(@UserId() userId: string) {
    return await this.documentService.listDocument({ userId });
  }

  @Doc({
    name: 'Apagar documento',
  })
  @Delete(':documentId')
  async deleteDocument(@Param('documentId') documentId: string, @UserId() userId: string) {
    return await this.documentService.deleteDocument({ documentId, userId });
  }
}
