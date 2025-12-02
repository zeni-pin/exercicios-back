import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { Doc } from 'src/utils/documentation/doc';
import { FindUserByIdResponseDto, ListUserResponseDto } from './doc/user.doc';

@ApiTags('Public/User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Doc({
    name: 'Listar usuários',
    response: ListUserResponseDto,
  })
  @Get('/')
  async findAll() {
    return await this.userService.findAll();
  }

  @Doc({
    name: 'Pegar dados de um usuário através do id',
    response: FindUserByIdResponseDto,
  })
  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }
}
