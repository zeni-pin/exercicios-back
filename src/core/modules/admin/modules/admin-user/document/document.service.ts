import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import {
  AdminListDocumentDto,
  AdminListDocumentResponseDto,
  UserDocumentResponseDto,
} from 'src/core/modules/common/dto/document.dto';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { ENUM_FILE_TYPE } from 'src/integrations/persistence/storage/file/file.enum';
import { FileService } from 'src/integrations/persistence/storage/file/file.service';
import { AppErrorBadRequest, AppErrorNotFound } from 'src/utils/errors/app-errors';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly file: FileService,
  ) {}

  async listDocument(params: {
    query: AdminListDocumentDto;
  }): Promise<AdminListDocumentResponseDto> {
    const { query } = params;
    const { type, validated, limit, page } = query;

    let where: Prisma.DocumentWhereInput = {};

    if (type) {
      where.type = {
        equals: type,
      };
    }

    if (validated !== undefined) {
      where.validated = {
        equals: validated,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: { file: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    const documents = await this.file.updateUrlsInObjects(data);

    const documentData = documents.map((doc) => {
      return {
        id: doc.id,
        type: doc.type,
        number: doc.number,
        validated: doc.validated,
        createdAt: doc.createdAt,
        file: { id: doc.file.id, url: doc.file.url },
      };
    });

    return {
      data: documentData,
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      query: {
        type,
        validated: validated?.toString(),
      },
    };
  }

  async approveDocument(params: { documentId: string }): Promise<UserDocumentResponseDto> {
    const { documentId } = params;

    const doc = await this.prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!doc) {
      throw new AppErrorNotFound('Documento não encontrado');
    }

    if (doc.validated) {
      throw new AppErrorBadRequest('Documento já validado');
    }

    const updatedDoc = await this.prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        validated: true,
      },
    });

    const docFile = await this.file.getFile({
      entity: ENUM_FILE_TYPE.USER_DOCUMENT,
      entityId: documentId,
    });

    return {
      ...updatedDoc,
      file: {
        id: docFile.id,
        url: docFile.url,
      },
    };
  }
}
