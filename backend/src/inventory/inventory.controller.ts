import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  @ApiOperation({ summary: 'List products with search and sort (INV-02, INV-04)' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ProductQueryDto) {
    return this.inventoryService.findAll(user.id, query);
  }

  @Get('products/low-stock')
  @ApiOperation({ summary: 'List low-stock products (INV-03)' })
  findLowStock(@CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.findLowStock(user.id);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product detail' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.inventoryService.findOne(user.id, id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product (INV-01)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProductDto) {
    return this.inventoryService.create(user.id, user.id, dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.inventoryService.update(user.id, id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.inventoryService.remove(user.id, id);
  }
}
