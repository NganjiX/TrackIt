import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'List suppliers with search (SUPP-04)' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.suppliersService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier with computed balances (SUPP-02)' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.suppliersService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create supplier (SUPP-01)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(user.id, user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete supplier' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.suppliersService.remove(user.id, id);
  }
}
