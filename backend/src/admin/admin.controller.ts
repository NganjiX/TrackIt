import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/admin.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform statistics (UC-14)' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  listUsers(@Query() query: PaginationQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Get('businesses')
  @ApiOperation({ summary: 'List all businesses' })
  listBusinesses(@Query() query: PaginationQueryDto) {
    return this.adminService.listBusinesses(query);
  }

  @Get('businesses/:id')
  @ApiOperation({ summary: 'Get business detail' })
  getBusiness(@Param('id') id: string) {
    return this.adminService.getBusiness(id);
  }
}
