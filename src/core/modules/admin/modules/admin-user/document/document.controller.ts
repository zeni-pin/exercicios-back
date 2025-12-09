import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import {
  AdminListDocumentDto,
  AdminListDocumentResponseDto,
  UserDocumentResponseDto,
} from 'src/core/modules/common/dto/document.dto';
import { UserId } from 'src/utils/decorators/user-id.decorator';
import { Doc } from 'src/utils/documentation/doc';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserRole } from 'generated/prisma';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Admin/Users/Documents')
@Roles(UserRole.ADMIN)
@Controller('/admin/users/documents')
export class DocumentController {
  constructor(private readonly adminDocumentService: DocumentService) {}

  @Doc({
    name: 'Listar documentos',
    response: AdminListDocumentResponseDto,
  })
  @Get()
  async listDocument(@Query() query: AdminListDocumentDto) {
    return await this.adminDocumentService.listDocument({ query });
  }

  @Doc({
    name: 'Aprovar documento',
    response: UserDocumentResponseDto,
  })
  @Patch(':documentId/approve')
  async approveDocument(@Param('documentId') documentId: string) {
    return await this.adminDocumentService.approveDocument({ documentId });
  }
}
