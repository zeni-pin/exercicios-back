import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { EditPostDto } from './dto/edit-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { AppErrorBadRequest, AppErrorNotFound } from 'src/utils/errors/app-errors';
import { Prisma } from 'generated/prisma';
import {
  EditPostResponse,
  CreatePostResponse,
  ListPostsResponse,
  UpdatePostImageResponse,
} from './doc/post.doc';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';
import { FileService } from 'src/integrations/persistence/storage/file/file.service';
import {
  ENUM_FILE_TYPE,
  ENUM_OPERATOR_TYPE,
} from 'src/integrations/persistence/storage/file/file.enum';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly file: FileService,
  ) {}

  private async getUserProfile(userId: string) {
    const profile = await this.prismaService.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppErrorNotFound('Profile not found');
    }

    return profile;
  }

  async findById({ userId, postId }: { userId: string; postId: string }) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
        deleted: false,
        author: {
          userId,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        file: { select: { id: true, url: true } },
      },
    });

    if (!post) {
      throw new AppErrorNotFound('Post not found');
    }

    return post;
  }

  async create({
    userId,
    body,
    file,
  }: {
    userId: string;
    body: CreatePostDto;
    file?: Express.Multer.File;
  }): Promise<CreatePostResponse> {
    const profile = await this.getUserProfile(userId);

    const post = await this.prismaService.$transaction(async (prisma) => {
      const createdPost = await prisma.post.create({
        data: {
          title: body.title,
          content: body.content,
          authorId: profile.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!file) {
        return createdPost;
      }

      const createdFile = await this.file.saveFile({
        file: file,
        entity: ENUM_FILE_TYPE.POST_COVER,
        entityId: createdPost.id,
        operatorType: ENUM_OPERATOR_TYPE.USER,
        operatorId: profile.id,
      });

      const updatedPost = await prisma.post.update({
        where: {
          id: createdPost.id,
        },
        data: {
          fileId: createdFile.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          file: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });

      return updatedPost;
    });

    if (!post) {
      throw new AppErrorBadRequest('Erro ao criar post');
    }

    return post;
  }

  async list({
    userId,
    query,
  }: {
    userId: string;
    query: ListPostsDto;
  }): Promise<ListPostsResponse> {
    const { page, limit } = query;

    const profile = await this.getUserProfile(userId);

    const where: Prisma.PostWhereInput = {
      authorId: profile.id,
      deleted: false,
    };

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          file: { select: { id: true, url: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.post.count({ where }),
    ]);

    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        if (post.file) {
          const postFile = await this.file.getFile({
            entity: ENUM_FILE_TYPE.POST_COVER,
            entityId: post.id,
          });

          return await this.prismaService.post.update({
            where: { id: post.id },
            data: { fileId: postFile.id },
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              updatedAt: true,
              file: { select: { id: true, url: true } },
            },
          });
        } else return post;
      }),
    );

    return new PaginatedResponseDto({
      data: updatedPosts,
      total,
      page,
      limit,
    });
  }

  async edit({
    userId,
    postId,
    body,
  }: {
    userId: string;
    postId: string;
    body: EditPostDto;
  }): Promise<EditPostResponse> {
    await this.findById({ userId, postId });

    return await this.prismaService.post.update({
      where: { id: postId },
      data: body,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete({ userId, postId }: { userId: string; postId: string }): Promise<void> {
    const post = await this.findById({ userId, postId });

    if (post.file) {
      await this.file.deleteFile(post.file.id);
    }

    await this.prismaService.post.update({
      where: { id: postId },
      data: { deleted: true },
    });
  }

  async updateImage({
    userId,
    postId,
    file,
  }: {
    userId: string;
    postId: string;
    file: Express.Multer.File;
  }): Promise<UpdatePostImageResponse> {
    const profile = await this.getUserProfile(userId);

    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
        authorId: profile.id,
      },
    });

    if (!post) {
      throw new AppErrorNotFound('Post não encontrado');
    }

    const updatedPost = await this.prismaService.$transaction(async (prisma) => {
      if (post.fileId) {
        await this.file.deleteFile(post.fileId);
      }

      const createdFile = await this.file.saveFile({
        file: file,
        entity: ENUM_FILE_TYPE.POST_COVER,
        entityId: post.id,
        operatorType: ENUM_OPERATOR_TYPE.USER,
        operatorId: profile.id,
      });

      return await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          fileId: createdFile.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          file: { select: { id: true, url: true } },
        },
      });
    });

    if (!updatedPost) {
      throw new AppErrorBadRequest('Erro ao atualizar imagem');
    }

    return updatedPost;
  }
}
