const DEMO_NOW = new Date();
const DEMO_DAY = 24 * 60 * 60 * 1000;

const demoUser = {
  id: 'demo-user',
  email: 'demo@fintrack.app',
  fullName: 'Heavens Nganji',
  role: 'user',
  emailVerified: true,
  language: 'en',
  businessId: 'demo-business',
  onboardingComplete: true,
} as const;

const demoBusiness = {
  id: 'demo-business',
  passportId: 'FT-2026-00091',
  name: 'Heavens MSME Shop',
  type: 'retail_shop',
  industry: 'Retail & FMCG',
  location: 'Kigali',
  yearsOperating: 4,
  numEmployees: 6,
  goals: 'Scale stock turnover and qualify for financing',
  currency: 'RWF',
  healthScore: 64,
  creditReadiness: 'medium',
  creditReadinessLabel: 'Building Foundation',
  onboardingComplete: true,
};

const demoTransactions = [
  {
    id: 'txn-001',
    type: 'sale',
    category: 'Retail',
    amount: 185000,
    description: 'Weekly wholesale sales',
    date: new Date(DEMO_NOW.getTime() - DEMO_DAY).toISOString(),
    paymentStatus: 'paid',
    productService: 'Groceries',
    customerId: 'cust-001',
    supplierId: null,
    customer: { id: 'cust-001', name: 'Aline Traders' },
    supplier: null,
  },
  {
    id: 'txn-002',
    type: 'expense',
    category: 'Utilities',
    amount: 42000,
    description: 'Electricity and water bill',
    date: new Date(DEMO_NOW.getTime() - 2 * DEMO_DAY).toISOString(),
    paymentStatus: 'paid',
    productService: 'Utilities',
    customerId: null,
    supplierId: 'sup-001',
    customer: null,
    supplier: { id: 'sup-001', name: 'Rwanda Utilities' },
  },
  {
    id: 'txn-003',
    type: 'purchase',
    category: 'Inventory',
    amount: 256000,
    description: 'Stock refill from supplier',
    date: new Date(DEMO_NOW.getTime() - 3 * DEMO_DAY).toISOString(),
    paymentStatus: 'partial',
    productService: 'Inventory stock',
    customerId: null,
    supplierId: 'sup-002',
    customer: null,
    supplier: { id: 'sup-002', name: 'Kigali Distribution' },
  },
];

const demoCustomers = [
  {
    id: 'cust-001',
    name: 'Aline Traders',
    phone: '+250788100111',
    email: 'aline@traders.rw',
    address: 'Kimisagara, Kigali',
    totalPurchases: 520000,
    debtBalance: 120000,
    hasDebt: true,
  },
  {
    id: 'cust-002',
    name: 'Diane Boutique',
    phone: '+250788100222',
    email: 'diane@boutique.rw',
    address: 'Remera, Kigali',
    totalPurchases: 340000,
    debtBalance: 0,
    hasDebt: false,
  },
];

const demoSuppliers = [
  {
    id: 'sup-001',
    name: 'Rwanda Utilities',
    phone: '+250788200111',
    email: 'support@utilities.rw',
    address: 'Nyarugenge, Kigali',
    totalPayments: 240000,
    outstandingBalance: 0,
    hasOutstanding: false,
  },
  {
    id: 'sup-002',
    name: 'Kigali Distribution',
    phone: '+250788200222',
    email: 'sales@kigali-distribution.rw',
    address: 'Gisozi, Kigali',
    totalPayments: 860000,
    outstandingBalance: 180000,
    hasOutstanding: true,
  },
];

const demoDebts = [
  {
    id: 'debt-001',
    type: 'receivable',
    partyName: 'Aline Traders',
    amount: 120000,
    paidAmount: 20000,
    remainingAmount: 100000,
    dueDate: new Date(DEMO_NOW.getTime() + 6 * DEMO_DAY).toISOString(),
    status: 'partial',
    description: 'Outstanding payment for bulk order',
    customerId: 'cust-001',
    supplierId: null,
    customer: { id: 'cust-001', name: 'Aline Traders' },
    supplier: null,
    createdAt: new Date(DEMO_NOW.getTime() - 12 * DEMO_DAY).toISOString(),
  },
  {
    id: 'debt-002',
    type: 'payable',
    partyName: 'Kigali Distribution',
    amount: 180000,
    paidAmount: 0,
    remainingAmount: 180000,
    dueDate: new Date(DEMO_NOW.getTime() + 2 * DEMO_DAY).toISOString(),
    status: 'pending',
    description: 'Inventory supply balance',
    customerId: null,
    supplierId: 'sup-002',
    customer: null,
    supplier: { id: 'sup-002', name: 'Kigali Distribution' },
    createdAt: new Date(DEMO_NOW.getTime() - 10 * DEMO_DAY).toISOString(),
  },
];

const demoProducts = [
  {
    id: 'prd-001',
    name: 'Cooking Oil 5L',
    category: 'Groceries',
    price: 16000,
    cost: 13000,
    stockQuantity: 8,
    lowStockThreshold: 10,
    unit: 'bottle',
    isLowStock: true,
    createdAt: new Date(DEMO_NOW.getTime() - 20 * DEMO_DAY).toISOString(),
  },
  {
    id: 'prd-002',
    name: 'Sugar 1kg',
    category: 'Groceries',
    price: 1800,
    cost: 1400,
    stockQuantity: 42,
    lowStockThreshold: 20,
    unit: 'pack',
    isLowStock: false,
    createdAt: new Date(DEMO_NOW.getTime() - 18 * DEMO_DAY).toISOString(),
  },
];

const demoDocuments = [
  {
    id: 'doc-001',
    name: 'Stock Invoice June',
    category: 'invoice',
    fileUrl: '#',
    mimeType: 'application/pdf',
    fileSize: 248000,
    date: new Date(DEMO_NOW.getTime() - 5 * DEMO_DAY).toISOString(),
    amount: 256000,
    notes: 'Supplier invoice',
    createdAt: new Date(DEMO_NOW.getTime() - 5 * DEMO_DAY).toISOString(),
  },
];

function toPaginated<T>(rows: T[]) {
  return {
    data: rows,
    meta: {
      total: rows.length,
      page: 1,
      limit: Math.max(rows.length, 1),
      totalPages: 1,
    },
  };
}

function parseBody(body?: BodyInit | null): Record<string, unknown> {
  if (!body || typeof body !== 'string') return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function normalizePath(endpoint: string): string {
  if (endpoint.startsWith('http')) {
    try {
      const u = new URL(endpoint);
      return u.pathname.replace(/\/api\/v1$/, '').replace(/^\/api\/v1/, '');
    } catch {
      return endpoint.split('?')[0];
    }
  }
  return endpoint.split('?')[0];
}

function isGet(path: string, method: string, target: string) {
  return method === 'GET' && path === target;
}

export function isPresentationModeToken(token: string | null): boolean {
  return Boolean(token && token.startsWith('demo-'));
}

export function getPresentationMockResponse<T>(
  endpoint: string,
  options: RequestInit = {},
): T | null {
  const method = (options.method ?? 'GET').toUpperCase();
  const path = normalizePath(endpoint);
  const body = parseBody(options.body);

  if (isGet(path, method, '/dashboard/summary')) {
    return {
      financials: {
        totalRevenue: 1285000,
        totalExpenses: 462000,
        estimatedProfit: 823000,
        outstandingDebts: 190000,
        currency: 'RWF',
      },
      creditReadiness: {
        level: 'medium',
        label: 'Building Foundation',
        healthScore: 64,
        progressPercent: 64,
      },
      healthScoreBreakdown: {
        overall: 64,
        records: 72,
        consistency: 58,
        debtManagement: 61,
      },
      recentTransactions: demoTransactions,
      quickActions: ['record_sale', 'upload_receipt', 'view_passport', 'track_debt'],
    } as T;
  }

  if (isGet(path, method, '/transactions')) return toPaginated(demoTransactions) as T;
  if (isGet(path, method, '/customers')) return toPaginated(demoCustomers) as T;
  if (isGet(path, method, '/suppliers')) return toPaginated(demoSuppliers) as T;
  if (isGet(path, method, '/debts')) return toPaginated(demoDebts) as T;

  if (isGet(path, method, '/debts/summary')) {
    return {
      totalReceivable: 100000,
      totalPayable: 180000,
      overdueCount: 0,
      currency: 'RWF',
    } as T;
  }

  if (isGet(path, method, '/inventory/products')) return toPaginated(demoProducts) as T;
  if (isGet(path, method, '/inventory/products/low-stock')) {
    const lowStock = demoProducts.filter((p) => p.isLowStock);
    return { count: lowStock.length, data: lowStock } as T;
  }

  if (isGet(path, method, '/documents')) return toPaginated(demoDocuments) as T;
  if (path.startsWith('/documents/') && path.endsWith('/preview-url') && method === 'GET') {
    return {
      previewUrl: '#',
      mimeType: 'application/pdf',
      name: 'Demo Document',
      expiresIn: 600,
    } as T;
  }

  if (isGet(path, method, '/analytics/summary')) {
    return {
      period: 'month',
      summary: {
        totalRevenue: 1285000,
        totalExpenses: 462000,
        netProfit: 823000,
        currency: 'RWF',
      },
      revenueVsExpenses: [
        { month: 'Jan', revenue: 980000, expenses: 410000 },
        { month: 'Feb', revenue: 1100000, expenses: 430000 },
        { month: 'Mar', revenue: 1285000, expenses: 462000 },
      ],
      expenseBreakdown: [
        { category: 'Inventory', amount: 256000, percent: 55 },
        { category: 'Utilities', amount: 82000, percent: 18 },
        { category: 'Transport', amount: 54000, percent: 12 },
      ],
      profitTrend: [
        { month: 'Jan', profit: 570000 },
        { month: 'Feb', profit: 670000 },
        { month: 'Mar', profit: 823000 },
      ],
      insights: {
        revenueTrend: 'Revenue increased by 16% this quarter.',
        topExpenseCategory: 'Inventory remains your top cost center.',
        profitMargin: 'Net margin is stable around 64%.',
      },
    } as T;
  }

  if (isGet(path, method, '/history/five-year')) {
    return {
      summary: {
        totalRevenue: 12200000,
        totalExpenses: 5430000,
        averageAnnualProfit: 1354000,
        transactionCount: 1680,
        currency: 'RWF',
      },
      yearlyTrend: [
        { year: 2022, revenue: 1800000, expenses: 980000, profit: 820000 },
        { year: 2023, revenue: 2200000, expenses: 1100000, profit: 1100000 },
        { year: 2024, revenue: 2600000, expenses: 1240000, profit: 1360000 },
        { year: 2025, revenue: 3050000, expenses: 1360000, profit: 1690000 },
        { year: 2026, revenue: 2550000, expenses: 750000, profit: 1800000 },
      ],
      yearOverYearGrowth: { revenue: 14.2, profit: 19.4 },
      annualBreakdown: [
        { year: 2024, revenue: 2600000, expenses: 1240000, profit: 1360000, transactionCount: 330 },
        { year: 2025, revenue: 3050000, expenses: 1360000, profit: 1690000, transactionCount: 410 },
        { year: 2026, revenue: 2550000, expenses: 750000, profit: 1800000, transactionCount: 365 },
      ],
      milestones: {
        foundingYear: 2022,
        bestPerformingYear: 2026,
        totalTransactionVolume: 12200000,
        yearsOperating: 4,
      },
    } as T;
  }

  if (isGet(path, method, '/businesses/me')) return demoBusiness as T;
  if (isGet(path, method, '/settings/profile')) return demoUser as T;
  if (isGet(path, method, '/settings/health')) {
    return {
      healthScore: 64,
      creditReadiness: { level: 'medium', label: 'Building Foundation' },
      breakdown: { records: 72, consistency: 58, debtManagement: 61 },
    } as T;
  }

  if (isGet(path, method, '/notifications')) {
    return {
      data: [
        {
          id: 'ntf-001',
          title: 'Great revenue week',
          message: 'Your sales increased 16% versus last week.',
          type: 'insight',
          read: false,
          link: null,
          createdAt: new Date(DEMO_NOW.getTime() - DEMO_DAY).toISOString(),
        },
      ],
      unreadCount: 1,
    } as T;
  }

  if (isGet(path, method, '/passport') || path.startsWith('/passport/public/')) {
    return {
      passportId: demoBusiness.passportId,
      business: {
        name: demoBusiness.name,
        type: demoBusiness.type,
        industry: demoBusiness.industry,
        location: demoBusiness.location,
        yearsOperating: demoBusiness.yearsOperating,
        numEmployees: demoBusiness.numEmployees,
      },
      healthScore: 64,
      healthScoreBreakdown: {
        records: 72,
        consistency: 58,
        debtManagement: 61,
      },
      creditReadiness: {
        level: 'medium',
        label: 'Building Foundation',
      },
      activitySummary: {
        transactionsRecorded: 168,
        documentsUploaded: 32,
        customersRegistered: 18,
        debtsResolved: 11,
      },
      improvementChecklist: [
        { id: 'check_1', completed: true },
        { id: 'check_2', completed: true },
        { id: 'check_3', completed: false },
      ],
      generatedAt: DEMO_NOW.toISOString(),
    } as T;
  }

  if (isGet(path, method, '/ai-assistant/suggestions')) {
    return {
      language: 'en',
      suggestions: [
        'How can I improve my health score this month?',
        'What costs are reducing my profit margin most?',
        'Give me a 30-day debt reduction plan.',
      ],
    } as T;
  }

  if (isGet(path, method, '/ai-assistant/sessions')) {
    return {
      data: [
        {
          id: 'session-001',
          preview: 'How can I improve my health score?',
          createdAt: new Date(DEMO_NOW.getTime() - 3 * DEMO_DAY).toISOString(),
          updatedAt: new Date(DEMO_NOW.getTime() - DEMO_DAY).toISOString(),
        },
      ],
    } as T;
  }

  if (path.startsWith('/ai-assistant/sessions/') && path.endsWith('/messages') && method === 'GET') {
    return {
      data: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'How can I increase my credit readiness?',
          language: 'en',
          createdAt: new Date(DEMO_NOW.getTime() - 2 * DEMO_DAY).toISOString(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Record more transactions weekly and reduce outstanding payables.',
          language: 'en',
          createdAt: new Date(DEMO_NOW.getTime() - 2 * DEMO_DAY + 60000).toISOString(),
        },
      ],
    } as T;
  }

  if (isGet(path, method, '/admin/stats')) {
    return {
      userCount: 24,
      businessCount: 20,
      transactionCount: 1680,
      documentCount: 340,
    } as T;
  }

  if (isGet(path, method, '/admin/users')) {
    return toPaginated([
      {
        ...demoUser,
        createdAt: new Date(DEMO_NOW.getTime() - 90 * DEMO_DAY).toISOString(),
        businessName: demoBusiness.name,
      },
    ]) as T;
  }

  if (isGet(path, method, '/admin/businesses')) {
    return toPaginated([
      {
        ...demoBusiness,
        owner: { id: demoUser.id, email: demoUser.email, fullName: demoUser.fullName },
        createdAt: new Date(DEMO_NOW.getTime() - 90 * DEMO_DAY).toISOString(),
      },
    ]) as T;
  }

  if (isGet(path, method, '/auth/me')) return demoUser as T;

  if (path === '/documents/upload-url' && method === 'POST') {
    return {
      uploadUrl: 'https://example.com/demo-upload',
      fileKey: `demo-file-${Date.now()}`,
      expiresIn: 600,
    } as T;
  }

  if (path === '/ai-assistant/chat' && method === 'POST') {
    const message = String(body.message ?? 'business growth tips');
    return {
      sessionId: String(body.sessionId ?? `session-${Date.now()}`),
      reply: `Demo assistant: Based on "${message}", prioritize weekly transaction recording and debt follow-up.`,
      language: String(body.language ?? 'en'),
    } as T;
  }

  if (path === '/settings/language' && method === 'PATCH') {
    return {
      ...demoUser,
      language: body.language === 'rw' ? 'rw' : 'en',
    } as T;
  }

  if (path === '/settings/profile' && method === 'PATCH') {
    return {
      ...demoUser,
      fullName: String(body.fullName ?? demoUser.fullName),
    } as T;
  }

  if (path === '/businesses/onboarding' && method === 'POST') {
    return {
      ...demoBusiness,
      ...body,
      onboardingComplete: true,
    } as T;
  }

  if (path === '/businesses/me' && method === 'PATCH') {
    return {
      ...demoBusiness,
      ...body,
    } as T;
  }

  if (path === '/customers' && method === 'POST') {
    return {
      id: `cust-${Date.now()}`,
      name: String(body.name ?? 'Demo Customer'),
      phone: String(body.phone ?? '+250700000000'),
      email: body.email ? String(body.email) : null,
      address: body.address ? String(body.address) : null,
      totalPurchases: 0,
      debtBalance: 0,
      hasDebt: false,
    } as T;
  }

  if (path === '/suppliers' && method === 'POST') {
    return {
      id: `sup-${Date.now()}`,
      name: String(body.name ?? 'Demo Supplier'),
      phone: String(body.phone ?? '+250700000000'),
      email: body.email ? String(body.email) : null,
      address: body.address ? String(body.address) : null,
      totalPayments: 0,
      outstandingBalance: 0,
      hasOutstanding: false,
    } as T;
  }

  if (path === '/transactions' && method === 'POST') {
    return {
      id: `txn-${Date.now()}`,
      type: String(body.type ?? 'sale'),
      category: String(body.category ?? 'General'),
      amount: Number(body.amount ?? 0),
      description: String(body.description ?? 'Demo transaction'),
      date: String(body.date ?? DEMO_NOW.toISOString()),
      paymentStatus: String(body.paymentStatus ?? 'paid'),
      productService: String(body.productService ?? 'General'),
      customerId: body.customerId ? String(body.customerId) : null,
      supplierId: body.supplierId ? String(body.supplierId) : null,
      customer: null,
      supplier: null,
    } as T;
  }

  if (path === '/debts' && method === 'POST') {
    const amount = Number(body.amount ?? 0);
    return {
      id: `debt-${Date.now()}`,
      type: String(body.type ?? 'receivable'),
      partyName: String(body.partyName ?? 'Demo Party'),
      amount,
      paidAmount: 0,
      remainingAmount: amount,
      dueDate: String(body.dueDate ?? DEMO_NOW.toISOString()),
      status: 'pending',
      description: String(body.description ?? ''),
      customerId: body.customerId ? String(body.customerId) : null,
      supplierId: body.supplierId ? String(body.supplierId) : null,
      customer: null,
      supplier: null,
      createdAt: DEMO_NOW.toISOString(),
    } as T;
  }

  if (path.includes('/payments') && method === 'POST') {
    return demoDebts[0] as T;
  }

  if (path === '/inventory/products' && method === 'POST') {
    return {
      id: `prd-${Date.now()}`,
      name: String(body.name ?? 'Demo Product'),
      category: String(body.category ?? 'General'),
      price: Number(body.price ?? 0),
      cost: Number(body.cost ?? 0),
      stockQuantity: Number(body.stockQuantity ?? 0),
      lowStockThreshold: Number(body.lowStockThreshold ?? 10),
      unit: String(body.unit ?? 'item'),
      isLowStock: Number(body.stockQuantity ?? 0) <= Number(body.lowStockThreshold ?? 10),
      createdAt: DEMO_NOW.toISOString(),
    } as T;
  }

  if (path === '/documents' && method === 'POST') {
    return {
      id: `doc-${Date.now()}`,
      name: String(body.name ?? 'Demo Document'),
      category: String(body.category ?? 'other'),
      fileUrl: '#',
      mimeType: String(body.mimeType ?? 'application/pdf'),
      fileSize: Number(body.fileSize ?? 0),
      date: String(body.date ?? DEMO_NOW.toISOString()),
      amount: typeof body.amount === 'number' ? body.amount : null,
      notes: body.notes ? String(body.notes) : null,
      createdAt: DEMO_NOW.toISOString(),
    } as T;
  }

  if (path === '/passport/share-link' && method === 'POST') {
    return {
      shareUrl: 'https://fintrack-rw.vercel.app/passport/public/demo-token',
      token: 'demo-token',
      expiresAt: new Date(DEMO_NOW.getTime() + 7 * DEMO_DAY).toISOString(),
    } as T;
  }

  if (
    method === 'DELETE' ||
    method === 'PATCH' ||
    path === '/notifications/read-all' ||
    path.includes('/read') ||
    path === '/auth/logout'
  ) {
    return { message: 'Demo action completed successfully.' } as T;
  }

  return null;
}
