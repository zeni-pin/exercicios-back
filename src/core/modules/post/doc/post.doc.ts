import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';

class AuthorResponse {
  @ApiProperty({ example: 'john_doe' })
  username: string;
}

class PostFile {
  @ApiProperty({ example: 'clx0987654321' })
  id: string;

  @ApiProperty({ example: 'https://us-east-1.amazonaws.com/imagem?123' })
  url: string;
}

export class PostResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'My new post' })
  title: string;

  @ApiProperty({ example: 'This is my new post content' })
  content: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-02T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: PostFile })
  file?: PostFile;
}

export class EditPostResponse extends PostResponse {}

export class CreatePostResponse extends PostResponse {}

export class PostWithAuthorResponse extends PostResponse {
  @ApiProperty({ type: AuthorResponse })
  author: AuthorResponse;
}

export class ListPostsResponse extends PaginatedResponseDto<PostResponse> {
  @ApiProperty({ type: [PostResponse] })
  data: PostResponse[];
}

export class ListPostsWithAutorResponse extends PaginatedResponseDto<PostWithAuthorResponse> {
  @ApiProperty({ type: [PostWithAuthorResponse] })
  data: PostWithAuthorResponse[];

  @ApiProperty({
    example: {
      author: 'john_doe',
      title: 'my post',
    },
  })
  query?: {
    author?: string;
    title?: string;
  };
}

export class UpdatePostImageResponse extends PostResponse {}
