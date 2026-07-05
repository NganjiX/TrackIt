import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers with search (CUST-04)' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.customersService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer with computed balances (CUST-02)' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer (CUST-01)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(user.id, user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.remove(user.id, id);
  }
}
