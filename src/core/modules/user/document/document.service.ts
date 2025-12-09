import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { FileService } from 'src/integrations/persistence/storage/file/file.service';
import {
  ListDocumentResponseDto,
  UploadUserDocumentDto,
  UserDocumentResponseDto,
} from '../../common/dto/document.dto';
import {
  ENUM_FILE_TYPE,
  ENUM_OPERATOR_TYPE,
} from 'src/integrations/persistence/storage/file/file.enum';
import { AppErrorBadRequest, AppErrorNotFound } from 'src/utils/errors/app-errors';
import { DocumentType } from 'generated/prisma';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly file: FileService,
  ) {}

  private validateDocumentNumber(params: { number: string; type: DocumentType }) {
    const { number, type } = params;

    switch (type) {
      case DocumentType.RG:
        if (number.length >= 7 && number.length <= 9) return true;
      case DocumentType.CNH || DocumentType.CPF:
        if (number.length === 11) return true;
    }

    throw new AppErrorBadRequest('Erro ao validar documento');
  }

  async createDocument(params: {
    data: UploadUserDocumentDto;
    file: Express.Multer.File;
    userId: string;
  }): Promise<UserDocumentResponseDto> {
    const { data, file, userId } = params;
    const { number, type } = data;

    this.validateDocumentNumber(data);

    const existingDoc = await this.prisma.document.findFirst({
      where: {
        userId: userId,
        type: type,
      },
    });

    if (existingDoc) {
      throw new AppErrorBadRequest('Usuário já possui um documento desse tipo');
    }

    const doc = await this.prisma.$transaction(async (prisma) => {
      const createdDoc = await prisma.document.create({
        data: {
          number,
          type,
          userId,
        },
      });

      const createdFile = await this.file.saveFile({
        file,
        entity: ENUM_FILE_TYPE.USER_DOCUMENT,
        entityId: createdDoc.id,
        operatorType: ENUM_OPERATOR_TYPE.USER,
        operatorId: userId,
      });

      const updatedDoc = await prisma.document.update({
        where: {
          id: createdDoc.id,
        },
        data: {
          fileId: createdFile.id,
        },
        include: {
          file: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });

      return updatedDoc;
    });

    if (!doc) {
      throw new AppErrorBadRequest('Erro ao criar novo documento');
    }

    return doc;
  }

  async listDocument(params: { userId: string }): Promise<ListDocumentResponseDto> {
    const { userId } = params;

    const documents = await this.prisma.document.findMany({
      where: {
        userId,
      },
      include: {
        file: true,
      },
    });

    if (documents.length === 0) {
      return [];
    }

    const updatedDocuments = await this.file.updateUrlsInObjects(documents);

    const documentData = updatedDocuments.map((doc) => {
      return {
        id: doc.id,
        type: doc.type,
        number: doc.number,
        validated: doc.validated,
        createdAt: doc.createdAt,
        file: { id: doc.file.id, url: doc.file.url },
      };
    });

    return documentData;
  }

  async deleteDocument(params: { documentId: string; userId: string }): Promise<void> {
    const { documentId, userId } = params;

    const doc = await this.prisma.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!doc) {
      throw new AppErrorNotFound('Documento não encontrado');
    }

    if (doc.validated) {
      throw new AppErrorBadRequest('Não é possível apagar um documento validado');
    }

    await this.prisma.document.delete({
      where: {
        id: documentId,
      },
    });
  }
}
