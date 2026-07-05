import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions with filter and search (TXN-03, TXN-04)' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create transaction (TXN-01, TXN-02)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
