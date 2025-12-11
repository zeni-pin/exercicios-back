import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Doc } from 'src/utils/documentation/doc';
import { EditPostDto } from './dto/edit-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/utils/decorators/user-id.decorator';
import {
  EditPostResponse,
  CreatePostResponse,
  PostResponse,
  ListPostsResponse,
  UpdatePostImageResponse,
} from './doc/post.doc';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Private/Posts')
@UseGuards(JwtAuthGuard)
@Controller('private/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Doc({
    name: 'Create post',
    description: `Create a new post`,
    response: CreatePostResponse,
    statusCode: HttpStatus.CREATED,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async create(
    @UserId() userId: string,
    @Body() body: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.postService.create({ userId, body, file });
  }

  @Doc({
    name: 'List posts',
    description: `List user's posts with pagination`,
    response: ListPostsResponse,
  })
  @Get()
  async list(@UserId() userId: string, @Query() query: ListPostsDto) {
    return await this.postService.list({ userId, query });
  }

  @Doc({
    name: 'Get post by ID',
    description: `Get a specific post by ID`,
    response: PostResponse,
  })
  @Get('/:postId')
  async findById(@UserId() userId: string, @Param('postId') postId: string) {
    return await this.postService.findById({ userId, postId });
  }

  @Doc({
    name: 'Edit post',
    description: `Edit a user's post`,
    response: EditPostResponse,
  })
  @Put('/:postId')
  async edit(@UserId() userId: string, @Param('postId') postId: string, @Body() body: EditPostDto) {
    return await this.postService.edit({ userId, postId, body });
  }

  @Doc({
    name: 'Delete post',
    description: `Delete a user's post`,
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Delete('/:postId')
  async delete(@UserId() userId: string, @Param('postId') postId: string) {
    await this.postService.delete({ userId, postId });
  }

  @Doc({
    name: 'Update post image',
    description: `Update a post's image`,
    response: UpdatePostImageResponse,
    statusCode: HttpStatus.ACCEPTED,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/:postId/image')
  async updateImage(
    @UserId() userId: string,
    @Param('postId') postId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.postService.updateImage({ userId, postId, file });
  }
}
