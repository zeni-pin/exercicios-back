import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { FindUserByIdResponseDto, ListUserResponseDto } from './doc/user.doc';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<FindUserByIdResponseDto> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            birthDate: true,
            posts: {
              select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  }

  async findAll(): Promise<ListUserResponseDto> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        profile: {
          select: {
            username: true,
            bio: true,
            birthDate: true,
            posts: true,
          },
        },
      },
    });

    const data = users.map((user) => {
      return {
        id: user.id,
        username: user.profile.username,
        bio: user.profile.bio,
        birthDate: user.profile.birthDate,
        numberOfPosts: user.profile.posts.length,
      };
    });

    return data;
  }
}
