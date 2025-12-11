import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { ListPostsDto, ListResponse } from './dto/list-posts.dto';
import { Prisma } from 'generated/prisma';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPostsByUsername(params: {
    username: string;
    filters: ListPostsDto;
  }): Promise<ListResponse> {
    const { filters, username } = params;
    const { limit, page, search } = filters;

    let where: Prisma.PostWhereInput = {
      author: {
        username,
      },
    };

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const postData = data.map((post) => {
      return {
        ...post,
        author: username,
      };
    });

    return new PaginatedResponseDto({
      total,
      page,
      limit,
      data: postData,
      query: {
        search,
      },
    });
  }
}
