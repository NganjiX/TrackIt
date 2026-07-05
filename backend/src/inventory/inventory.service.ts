import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../common/dto/pagination-query.dto';
import { isLowStock } from './inventory.utils';

/**
 * Product inventory management (INV-01..04).
 */
@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
  ) {}

  async findAll(ownerId: string, query: ProductQueryDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const { skip, take, page, limit } = getPaginationParams(query);

    const where: Prisma.ProductWhereInput = { businessId: business.id };

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'asc' }
      : { name: 'asc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items.map((p) => this.toResponse(p)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findLowStock(ownerId: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);

    const products = await this.prisma.product.findMany({
      where: { businessId: business.id },
      orderBy: { stockQuantity: 'asc' },
    });

    const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);

    return {
      count: lowStock.length,
      data: lowStock.map((p) => this.toResponse(p)),
    };
  }

  async findOne(ownerId: string, id: string) {
    const product = await this.getScopedProduct(ownerId, id);
    return this.toResponse(product);
  }

  async create(ownerId: string, userId: string, dto: CreateProductDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const product = await this.prisma.product.create({
      data: {
        businessId: business.id,
        ...dto,
        createdById: userId,
      },
    });
    return this.toResponse(product);
  }

  async update(ownerId: string, id: string, dto: UpdateProductDto) {
    await this.getScopedProduct(ownerId, id);
    const product = await this.prisma.product.update({ where: { id }, data: dto });
    return this.toResponse(product);
  }

  async remove(ownerId: string, id: string) {
    await this.getScopedProduct(ownerId, id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted' };
  }

  private async getScopedProduct(ownerId: string, id: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const product = await this.prisma.product.findFirst({
      where: { id, businessId: business.id },
    });
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }
    return product;
  }

  private toResponse(product: {
    id: string;
    name: string;
    category: string;
    price: Prisma.Decimal;
    cost: Prisma.Decimal;
    stockQuantity: number;
    lowStockThreshold: number;
    unit: string;
    createdAt: Date;
  }) {
    const isLow = isLowStock(product.stockQuantity, product.lowStockThreshold);
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      cost: Number(product.cost),
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      unit: product.unit,
      isLowStock: isLow,
      createdAt: product.createdAt.toISOString(),
    };
  }
}
