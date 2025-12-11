import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { EditPostDto } from './dto/edit-post.dto';
import { AppErrorForbidden, AppErrorNotFound } from 'src/utils/errors/app-errors';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getPostByIdAndUserIdOrThrow(params: { postId: string; userId: string }) {
    const { postId, userId } = params;

    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
        deleted: false,
        author: {
          userId,
        },
      },
      include: {
        author: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppErrorNotFound('Post não encontrado');
    }

    return post;
  }

  async edit(params: { postId: string; body: EditPostDto; userId: string }): Promise<any> {
    const { postId, body, userId } = params;

    await this.getPostByIdAndUserIdOrThrow({ postId, userId });

    return await this.prismaService.post.update({
      where: { id: postId },
      data: body,
    });
  }

  async delete(params: { postId: string; userId: string }): Promise<void> {
    const { postId, userId } = params;

    await this.getPostByIdAndUserIdOrThrow({ postId, userId });

    await this.prismaService.post.update({
      where: {
        id: postId,
      },
      data: {
        deleted: true,
      },
    });
  }
}
