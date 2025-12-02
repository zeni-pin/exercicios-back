import { ApiProperty } from '@nestjs/swagger';

class Post {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Título' })
  title: string;

  @ApiProperty({ example: 'Conteúdo' })
  content: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

class PostsResponseDto extends Array<Post> {}

class ListUserData {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Maudie_Bauch' })
  username: string;

  @ApiProperty({ example: 'Bio 0' })
  bio: string;

  @ApiProperty({ example: '1982-08-04T14:29:38.836Z' })
  birthDate: Date;

  @ApiProperty({ example: 5 })
  numberOfPosts: number;
}

class ProfileResponseDto {
  @ApiProperty({ example: 'Bio 0' })
  bio: string;

  @ApiProperty({ example: '1982-08-04T14:29:38.836Z' })
  birthDate: Date;

  @ApiProperty({ type: PostsResponseDto })
  posts: PostsResponseDto;
}

export class FindUserByIdResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user0@example.com' })
  email: string;

  @ApiProperty({ example: '2025-07-31T18:51:07.711Z' })
  createdAt: Date;

  @ApiProperty({ type: ProfileResponseDto })
  profile: ProfileResponseDto;
}

export class ListUserResponseDto extends Array<ListUserData> {}
