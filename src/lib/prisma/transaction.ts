import { prisma } from ".";
import { TransactionType } from "./generated";

type DailyTrend = {
  date: Date;
  with_stock: number;
  without_stock: number;
  total: number;
};

type TopTransaction = {
  id: string;
  totalAmount: number;
  note: string;
  source: string;
  createdAt: Date;
};

type TopSource = {
  source: string;
  total: number;
};

type Average = {
  average: number;
};

type Summary = {
  this_month_count: number;
  last_month_count: number;
  total_count: number;
  this_month_total: number;
  last_month_total: number;
  total_amount: number;
};

type MutationSummary = {
  this_month_with_stock: number;
  last_month_with_stock: number;
  total_with_stock: number;
  this_month_without_stock: number;
  last_month_without_stock: number;
  total_without_stock: number;
};

export async function getTransactionSummary(initialType: TransactionType) {
  const type = `'${initialType}'`;

  // 1. Summary pengeluaran count & amount
  const [summary] = await prisma.$queryRawUnsafe<Summary[]>(`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS this_month_count,
      COUNT(*) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
          AND created_at < date_trunc('month', CURRENT_DATE)
      ) AS last_month_count,
      COUNT(*) AS total_count,

      SUM(total_amount) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS this_month_total,
      SUM(total_amount) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
          AND created_at < date_trunc('month', CURRENT_DATE)
      ) AS last_month_total,
      SUM(total_amount) AS total_amount
    FROM "transaction"
    WHERE type = ${type};
  `);

  // 2. Barang vs Non-barang (Stock mutation)
  const [mutationSummary] = await prisma.$queryRawUnsafe<MutationSummary[]>(`
    SELECT
      SUM(CASE
            WHEN t.created_at >= date_trunc('month', CURRENT_DATE)
            AND ti.mutation_id IS NOT NULL
          THEN ti.total_price ELSE 0 END) AS this_month_with_stock,

      SUM(CASE
            WHEN t.created_at >= date_trunc('month', CURRENT_DATE)
            AND ti.mutation_id IS NULL
          THEN ti.total_price ELSE 0 END) AS this_month_without_stock,

      SUM(CASE
            WHEN t.created_at >= date_trunc('month', CURRENT_DATE)
          THEN ti.total_price ELSE 0 END) AS this_month_total,

      SUM(CASE
            WHEN t.created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
            AND t.created_at < date_trunc('month', CURRENT_DATE)
            AND ti.mutation_id IS NOT NULL
          THEN ti.total_price ELSE 0 END) AS last_month_with_stock,

      SUM(CASE
            WHEN t.created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
            AND t.created_at < date_trunc('month', CURRENT_DATE)
            AND ti.mutation_id IS NULL
          THEN ti.total_price ELSE 0 END) AS last_month_without_stock,

      SUM(CASE
            WHEN t.created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
            AND t.created_at < date_trunc('month', CURRENT_DATE)
          THEN ti.total_price ELSE 0 END) AS last_month_total,

      SUM(CASE WHEN ti.mutation_id IS NOT NULL THEN ti.total_price ELSE 0 END) AS total_with_stock,
      SUM(CASE WHEN ti.mutation_id IS NULL THEN ti.total_price ELSE 0 END) AS total_without_stock,
      SUM(ti.total_price) AS grand_total

    FROM transaction_item ti
    JOIN "transaction" t ON t.id = ti.transaction_id
    WHERE t.type = ${type};
  `);

  // 3. Trend harian bulan ini
  const dailyTrendCurrentMonth = await prisma.$queryRawUnsafe<DailyTrend[]>(`
    SELECT
      DATE(t.created_at) AS date,
      SUM(ti.total_price) FILTER (
        WHERE ti.mutation_id IS NOT NULL
      ) AS with_stock,
      SUM(ti.total_price) FILTER (
        WHERE ti.mutation_id IS NULL
      ) AS without_stock,
      SUM(ti.total_price) AS total
    FROM transaction_item ti
    JOIN "transaction" t ON t.id = ti.transaction_id
    WHERE t.type = ${type}
      AND t.created_at >= date_trunc('month', CURRENT_DATE)
    GROUP BY DATE(t.created_at)
    ORDER BY DATE(t.created_at);
  `);

  // 4. Trend bulanan tahun ini

  // 5. Top 5 pengeluaran terbesar bulan ini
  const topTransactions = await prisma.$queryRawUnsafe<TopTransaction[]>(`
    SELECT 
      id,
      total_amount,
      note,
      source,
      created_at
    FROM "transaction"
    WHERE type = ${type}
      AND created_at >= date_trunc('month', CURRENT_DATE)
    ORDER BY total_amount DESC
    LIMIT 5;
  `);

  // 6. Top 5 source/supplier
  const topSources = await prisma.$queryRawUnsafe<TopSource[]>(`
    SELECT 
      source,
      SUM(total_amount) AS total
    FROM "transaction"
    WHERE type = ${type}
    GROUP BY source
    ORDER BY total DESC
    LIMIT 5;
  `);

  // 7. Rata-rata pengeluaran
  const [average] = await prisma.$queryRawUnsafe<Average[]>(`
    SELECT AVG(total_amount) AS average
    FROM "transaction"
    WHERE type = ${type};
  `);

  return {
    countExpenses: {
      thisMonth: Number(summary.this_month_count ?? 0),
      lastMonth: Number(summary.last_month_count ?? 0),
      total: Number(summary.total_count ?? 0),
    },
    amountExpenses: {
      thisMonth: Number(summary.this_month_total ?? 0),
      lastMonth: Number(summary.last_month_total ?? 0),
      total: Number(summary.total_amount ?? 0),
    },
    amountExpensesWithStockMutation: {
      thisMonth: Number(mutationSummary.this_month_with_stock ?? 0),
      lastMonth: Number(mutationSummary.last_month_with_stock ?? 0),
      total: Number(mutationSummary.total_with_stock ?? 0),
    },
    amountExpensesWithoutStockMutation: {
      thisMonth: Number(mutationSummary.this_month_without_stock ?? 0),
      lastMonth: Number(mutationSummary.last_month_without_stock ?? 0),
      total: Number(mutationSummary.total_without_stock ?? 0),
    },
    trendDaily: dailyTrendCurrentMonth.map((item) => ({
      date: new Date(item.date),
      with_stock: Number(item.with_stock ?? 0),
      without_stock: Number(item.without_stock ?? 0),
      total: Number(item.total ?? 0),
    })),
    topTransactions,
    topSources,
    averageExpense: Number(average.average ?? 0),
  };
}
