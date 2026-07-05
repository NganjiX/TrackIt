import 'dotenv/config';
import {
  PrismaClient,
  UserRole,
  BusinessType,
  CreditReadiness,
  TransactionType,
  PaymentStatus,
  DebtType,
  DebtStatus,
  NotificationType,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Generates a unique Passport ID in format SL-XXXXXXXX.
 */
function generatePassportId(): string {
  return `SL-${randomBytes(4).toString('hex').toUpperCase()}`;
}

/**
 * Seeds development database with admin user, sample business, and reference data.
 */
async function main(): Promise<void> {
  console.log('Seeding FinTrack database...');
  const seedPassword = 'Password123!';
  const seedPasswordHash = await bcrypt.hash(seedPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartledger.rw' },
    update: { passwordHash: seedPasswordHash, emailVerified: true },
    create: {
      email: 'admin@smartledger.rw',
      passwordHash: seedPasswordHash,
      fullName: 'System Administrator',
      role: UserRole.admin,
      emailVerified: true,
      language: 'en',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@kigalifresh.rw' },
    update: { passwordHash: seedPasswordHash, emailVerified: true },
    create: {
      email: 'owner@kigalifresh.rw',
      passwordHash: seedPasswordHash,
      fullName: 'Jean Bizimungu',
      role: UserRole.user,
      emailVerified: true,
      language: 'en',
    },
  });

  const business = await prisma.business.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      ownerId: owner.id,
      passportId: generatePassportId(),
      name: 'Kigali Fresh Market',
      type: BusinessType.retail_shop,
      industry: 'Grocery & Produce',
      location: 'Kigali, Gasabo District',
      yearsOperating: 3,
      numEmployees: 5,
      goals: 'Expand to a second location and apply for an MFI loan within 12 months.',
      currency: 'RWF',
      healthScore: 0,
      creditReadiness: CreditReadiness.low,
      onboardingComplete: true,
    },
  });

  const customerCount = await prisma.customer.count({ where: { businessId: business.id } });
  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        {
          businessId: business.id,
          name: 'Marie Uwase',
          phone: '+250788123456',
          email: 'marie@example.com',
          address: 'Kigali, Nyarugenge',
          createdById: owner.id,
        },
        {
          businessId: business.id,
          name: 'Paul Nkurunziza',
          phone: '+250789654321',
          createdById: owner.id,
        },
      ],
    });
  }

  const txnCount = await prisma.transaction.count({ where: { businessId: business.id } });
  if (txnCount === 0) {
    const txns = [
      { type: TransactionType.sale, category: 'Produce', amount: 85000, description: 'Weekly vegetable sales', productService: 'Vegetables', daysAgo: 1 },
      { type: TransactionType.sale, category: 'Produce', amount: 120000, description: 'Fruit market day', productService: 'Fruits', daysAgo: 3 },
      { type: TransactionType.expense, category: 'Rent', amount: 150000, description: 'Shop rent', productService: 'Rent', daysAgo: 5 },
      { type: TransactionType.expense, category: 'Utilities', amount: 25000, description: 'Electricity bill', productService: 'Utilities', daysAgo: 7 },
      { type: TransactionType.sale, category: 'Produce', amount: 95000, description: 'Tomato sales', productService: 'Tomatoes', daysAgo: 10 },
      { type: TransactionType.purchase, category: 'Stock', amount: 200000, description: 'Wholesale produce purchase', productService: 'Produce stock', daysAgo: 12 },
      { type: TransactionType.sale, category: 'Produce', amount: 110000, description: 'Weekend sales', productService: 'Mixed produce', daysAgo: 14 },
      { type: TransactionType.expense, category: 'Transport', amount: 15000, description: 'Delivery costs', productService: 'Transport', daysAgo: 15 },
      { type: TransactionType.sale, category: 'Produce', amount: 78000, description: 'Morning market', productService: 'Vegetables', daysAgo: 20 },
      { type: TransactionType.expense, category: 'Supplies', amount: 35000, description: 'Packaging materials', productService: 'Supplies', daysAgo: 25 },
    ];

    for (const txn of txns) {
      const date = new Date();
      date.setDate(date.getDate() - txn.daysAgo);
      await prisma.transaction.create({
        data: {
          businessId: business.id,
          type: txn.type,
          category: txn.category,
          amount: txn.amount,
          description: txn.description,
          date,
          paymentStatus: PaymentStatus.paid,
          productService: txn.productService,
          createdById: owner.id,
        },
      });
    }

    await prisma.business.update({
      where: { id: business.id },
      data: { healthScore: 35, creditReadiness: CreditReadiness.medium },
    });
  }

  const supplierCount = await prisma.supplier.count({ where: { businessId: business.id } });
  if (supplierCount === 0) {
    await prisma.supplier.create({
      data: {
        businessId: business.id,
        name: 'Rwanda Produce Wholesale',
        phone: '+250788999888',
        email: 'orders@rpw.rw',
        createdById: owner.id,
      },
    });
  }

  const debtCount = await prisma.debt.count({ where: { businessId: business.id } });
  if (debtCount === 0) {
    const customers = await prisma.customer.findMany({
      where: { businessId: business.id },
      take: 2,
    });
    const supplier = await prisma.supplier.findFirst({
      where: { businessId: business.id },
    });

    const futureDue = new Date();
    futureDue.setDate(futureDue.getDate() + 14);

    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 10);

    if (customers[0]) {
      await prisma.debt.create({
        data: {
          businessId: business.id,
          type: DebtType.receivable,
          partyName: customers[0].name,
          customerId: customers[0].id,
          amount: 75000,
          paidAmount: 0,
          dueDate: futureDue,
          status: DebtStatus.pending,
          description: 'Credit sale — weekly vegetable order',
          createdById: owner.id,
        },
      });
    }

    if (customers[1]) {
      await prisma.debt.create({
        data: {
          businessId: business.id,
          type: DebtType.receivable,
          partyName: customers[1].name,
          customerId: customers[1].id,
          amount: 120000,
          paidAmount: 40000,
          dueDate: pastDue,
          status: DebtStatus.overdue,
          description: 'Outstanding balance from fruit market day',
          createdById: owner.id,
        },
      });
    }

    if (supplier) {
      await prisma.debt.create({
        data: {
          businessId: business.id,
          type: DebtType.payable,
          partyName: supplier.name,
          supplierId: supplier.id,
          amount: 200000,
          paidAmount: 100000,
          dueDate: futureDue,
          status: DebtStatus.partial,
          description: 'Wholesale produce invoice — partial payment made',
          createdById: owner.id,
        },
      });
    }
  }

  const productCount = await prisma.product.count({ where: { businessId: business.id } });
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          businessId: business.id,
          name: 'Fresh Tomatoes',
          category: 'Produce',
          price: 1500,
          cost: 900,
          stockQuantity: 85,
          lowStockThreshold: 20,
          unit: 'kg',
          createdById: owner.id,
        },
        {
          businessId: business.id,
          name: 'Green Bananas',
          category: 'Produce',
          price: 800,
          cost: 500,
          stockQuantity: 12,
          lowStockThreshold: 15,
          unit: 'bunch',
          createdById: owner.id,
        },
        {
          businessId: business.id,
          name: 'Irish Potatoes',
          category: 'Produce',
          price: 1200,
          cost: 750,
          stockQuantity: 45,
          lowStockThreshold: 10,
          unit: 'kg',
          createdById: owner.id,
        },
      ],
    });
  }

  const historicalCutoff = new Date('2025-01-01');
  const historicalCount = await prisma.transaction.count({
    where: { businessId: business.id, date: { lt: historicalCutoff } },
  });

  if (historicalCount === 0) {
    const yearlyData = [
      { year: 2022, sales: 4200000, expenses: 2800000 },
      { year: 2023, sales: 5800000, expenses: 3500000 },
      { year: 2024, sales: 7200000, expenses: 4100000 },
      { year: 2025, sales: 8500000, expenses: 4800000 },
    ];

    for (const yr of yearlyData) {
      const midYear = new Date(yr.year, 5, 15);
      await prisma.transaction.createMany({
        data: [
          {
            businessId: business.id,
            type: TransactionType.sale,
            category: 'Produce',
            amount: Math.round(yr.sales * 0.6),
            description: `${yr.year} mid-year sales summary`,
            date: midYear,
            paymentStatus: PaymentStatus.paid,
            productService: 'Mixed produce',
            createdById: owner.id,
          },
          {
            businessId: business.id,
            type: TransactionType.sale,
            category: 'Produce',
            amount: Math.round(yr.sales * 0.4),
            description: `${yr.year} end-of-year sales`,
            date: new Date(yr.year, 11, 20),
            paymentStatus: PaymentStatus.paid,
            productService: 'Mixed produce',
            createdById: owner.id,
          },
          {
            businessId: business.id,
            type: TransactionType.expense,
            category: 'Rent',
            amount: Math.round(yr.expenses * 0.35),
            description: `${yr.year} shop rent`,
            date: new Date(yr.year, 0, 10),
            paymentStatus: PaymentStatus.paid,
            productService: 'Rent',
            createdById: owner.id,
          },
          {
            businessId: business.id,
            type: TransactionType.expense,
            category: 'Stock',
            amount: Math.round(yr.expenses * 0.45),
            description: `${yr.year} stock purchases`,
            date: new Date(yr.year, 3, 15),
            paymentStatus: PaymentStatus.paid,
            productService: 'Produce stock',
            createdById: owner.id,
          },
          {
            businessId: business.id,
            type: TransactionType.expense,
            category: 'Utilities',
            amount: Math.round(yr.expenses * 0.2),
            description: `${yr.year} utilities`,
            date: new Date(yr.year, 8, 5),
            paymentStatus: PaymentStatus.paid,
            productService: 'Utilities',
            createdById: owner.id,
          },
        ],
      });
    }
  }

  const notifCount = await prisma.notification.count({
    where: { businessId: business.id, userId: owner.id },
  });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          businessId: business.id,
          userId: owner.id,
          title: 'Low stock alert',
          message: 'Green Bananas is running low (12 bunches remaining). Consider restocking soon.',
          type: NotificationType.alert,
          link: '/inventory',
        },
        {
          businessId: business.id,
          userId: owner.id,
          title: 'Credit readiness update',
          message: 'Your health score has improved. View your Digital Business Passport for details.',
          type: NotificationType.info,
          link: '/passport',
        },
      ],
    });
  }

  console.log(`Admin user: ${admin.email}`);
  console.log(`Business owner: ${owner.email} (password: Password123!)`);
  console.log(`Business: ${business.name} (${business.passportId})`);
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
