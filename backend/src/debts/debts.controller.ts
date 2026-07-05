import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { CreateDebtDto, RecordDebtPaymentDto, UpdateDebtDto } from './dto/debt.dto';
import { DebtQueryDto } from './dto/debt-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Debts')
@ApiBearerAuth()
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  @ApiOperation({ summary: 'List debts with filter and pagination (DEBT-05)' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: DebtQueryDto) {
    return this.debtsService.findAll(user.id, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Debt summary cards (DEBT-03)' })
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.debtsService.getSummary(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt detail with payment history' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.debtsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create receivable or payable debt (DEBT-01)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDebtDto) {
    return this.debtsService.create(user.id, user.id, dto);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Record partial or full payment (DEBT-02)' })
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RecordDebtPaymentDto,
  ) {
    return this.debtsService.recordPayment(user.id, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update debt details' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
  ) {
    return this.debtsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete debt' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.debtsService.remove(user.id, id);
  }
}
