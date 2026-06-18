import { Controller, Get, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UsersService } from 'src/users/users.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private usersService: UsersService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users - admin only' })
  findAll() {
    return this.usersService.findAll();
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user - admin only' })
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
