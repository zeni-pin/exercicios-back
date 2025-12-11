import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiTags } from '@nestjs/swagger';
import { ListPostsDto, ListResponse } from './dto/list-posts.dto';
import { Doc } from 'src/utils/documentation/doc';

@ApiTags('Public/Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Doc({
    name: 'List posts by username',
    response: ListResponse,
  })
  @Get('/user/:username')
  async listPostsByUsername(@Param('username') username: string, @Query() filters: ListPostsDto) {
    return await this.postsService.listPostsByUsername({ username, filters });
  }
}
