import { CASH_BALANCE_ID } from "@/lib/const";
import { PrismaTransaction } from "@/types/prisma";
import { PrismaClient } from "../src/lib/prisma/generated";

const prisma = new PrismaClient();

async function main(prisma: PrismaTransaction) {
  const userId = "cmcyw54g90000fjq7k503ovv0";

  console.log("🏁 Starting dummy data creation...");

  // Step 0: Clean existing dummy data (optional - uncomment if you want to start fresh)
  console.log("🧹 Step 0: Cleaning existing dummy data...");

  // Delete in reverse order due to foreign key constraints
  await prisma.transactionItem.deleteMany({
    where: {
      transaction: {
        note: {
          contains: "Dummy",
        },
      },
    },
  });

  await prisma.transaction.deleteMany({
    where: {
      note: {
        contains: "Dummy",
      },
    },
  });

  await prisma.cashAuditLog.deleteMany({
    where: {
      note: {
        contains: "Dummy",
      },
    },
  });

  await prisma.stockMutation.deleteMany({
    where: {
      note: {
        contains: "Dummy",
      },
    },
  });

  await prisma.variant.deleteMany({
    where: {
      item: {
        uniqueName: {
          in: [
            "dummy-kain-katun",
            "dummy-benang-jahit",
            "dummy-kancing",
            "dummy-zipper",
            "dummy-elastic",
          ],
        },
      },
    },
  });

  await prisma.unitConversion.deleteMany({
    where: {
      item: {
        uniqueName: {
          in: [
            "dummy-kain-katun",
            "dummy-benang-jahit",
            "dummy-kancing",
            "dummy-zipper",
            "dummy-elastic",
          ],
        },
      },
    },
  });

  await prisma.item.deleteMany({
    where: {
      uniqueName: {
        in: [
          "dummy-kain-katun",
          "dummy-benang-jahit",
          "dummy-kancing",
          "dummy-zipper",
          "dummy-elastic",
        ],
      },
    },
  });

  console.log("✅ Existing dummy data cleaned");

  // Step 1: Create Cash Balance (independent)
  console.log("💰 Step 1: Creating cash balance...");
  const cashBalance = await prisma.cashBalance.upsert({
    where: { id: CASH_BALANCE_ID },
    update: { balance: 50000000.0 },
    create: {
      id: 1,
      balance: 50000000.0, // IDR 50 million starting balance
    },
  });
  console.log("✅ Cash balance created:", cashBalance);

  // Step 2: Create Items with UnitConversions
  console.log("📦 Step 2: Creating items and unit conversions...");

  const items = await Promise.all([
    // Fabric item
    prisma.item.create({
      data: {
        name: "Kain Katun (Dummy)",
        uniqueName: "dummy-kain-katun",
        defaultUnit: "meter",
        createdById: userId,
        conversions: {
          create: [
            {
              fromUnit: "roll",
              toUnit: "meter",
              multiplier: 40, // 1 roll = 40 meters
            },
            {
              fromUnit: "yard",
              toUnit: "meter",
              multiplier: 0.9144, // 1 yard = 0.9144 meters
            },
          ],
        },
      },
    }),

    // Thread item
    prisma.item.create({
      data: {
        name: "Benang Jahit (Dummy)",
        uniqueName: "dummy-benang-jahit",
        defaultUnit: "ball",
        createdById: userId,
        conversions: {
          create: [
            {
              fromUnit: "pack",
              toUnit: "ball",
              multiplier: 12, // 1 pack = 12 balls
            },
            {
              fromUnit: "box",
              toUnit: "ball",
              multiplier: 24, // 1 box = 24 balls
            },
          ],
        },
      },
    }),

    // Button item
    prisma.item.create({
      data: {
        name: "Kancing (Dummy)",
        uniqueName: "dummy-kancing",
        defaultUnit: "pcs",
        createdById: userId,
        conversions: {
          create: [
            {
              fromUnit: "gross",
              toUnit: "pcs",
              multiplier: 144, // 1 gross = 144 pieces
            },
            {
              fromUnit: "dozen",
              toUnit: "pcs",
              multiplier: 12, // 1 dozen = 12 pieces
            },
          ],
        },
      },
    }),

    // Zipper item
    prisma.item.create({
      data: {
        name: "Resleting (Dummy)",
        uniqueName: "dummy-zipper",
        defaultUnit: "pcs",
        createdById: userId,
        conversions: {
          create: [
            {
              fromUnit: "pack",
              toUnit: "pcs",
              multiplier: 10, // 1 pack = 10 pieces
            },
          ],
        },
      },
    }),

    // Elastic item
    prisma.item.create({
      data: {
        name: "Karet Elastis (Dummy)",
        uniqueName: "dummy-elastic",
        defaultUnit: "meter",
        createdById: userId,
        conversions: {
          create: [
            {
              fromUnit: "roll",
              toUnit: "meter",
              multiplier: 50, // 1 roll = 50 meters
            },
          ],
        },
      },
    }),
  ]);

  console.log("✅ Items created:", items.length);

  // Step 3: Create Variants for each Item
  console.log("🎨 Step 3: Creating variants...");

  const variants = await Promise.all([
    // Fabric variants
    prisma.variant.create({
      data: {
        itemId: items[0].id, // Kain Katun
        name: "Katun Putih",
        unit: "meter",
        currentStock: 125.5,
      },
    }),
    prisma.variant.create({
      data: {
        itemId: items[0].id, // Kain Katun
        name: "Katun Biru Navy",
        unit: "meter",
        currentStock: 180.25,
      },
    }),
    prisma.variant.create({
      data: {
        itemId: items[0].id, // Kain Katun
        name: "Katun Merah Maroon",
        unit: "meter",
        currentStock: 90.75,
      },
    }),

    // Thread variants
    prisma.variant.create({
      data: {
        itemId: items[1].id, // Benang Jahit
        name: "Benang Putih 40s",
        unit: "ball",
        currentStock: 45,
      },
    }),
    prisma.variant.create({
      data: {
        itemId: items[1].id, // Benang Jahit
        name: "Benang Hitam 40s",
        unit: "ball",
        currentStock: 32,
      },
    }),
    prisma.variant.create({
      data: {
        itemId: items[1].id, // Benang Jahit
        name: "Benang Navy 40s",
        unit: "ball",
        currentStock: 28,
      },
    }),

    // Button variants
    prisma.variant.create({
      data: {
        itemId: items[2].id, // Kancing
        name: "Kancing Putih 12mm",
        unit: "pcs",
        currentStock: 950,
      },
    }),
    prisma.variant.create({
      data: {
        itemId: items[2].id, // Kancing
        name: "Kancing Hitam 15mm",
        unit: "pcs",
        currentStock: 750,
      },
    }),

    // Zipper variants
    prisma.variant.create({
      data: {
        itemId: items[3].id, // Resleting
        name: "Resleting Hitam 20cm",
        unit: "pcs",
        currentStock: 200,
      },
    }),
    prisma.variant.create({
      data: {
        itemId: items[3].id, // Resleting
        name: "Resleting Navy 25cm",
        unit: "pcs",
        currentStock: 150,
      },
    }),

    // Elastic variants
    prisma.variant.create({
      data: {
        itemId: items[4].id, // Karet Elastis
        name: "Karet 1cm Putih",
        unit: "meter",
        currentStock: 80.5,
      },
    }),
    prisma.variant.create({
      data: {
        itemId: items[4].id, // Karet Elastis
        name: "Karet 2cm Hitam",
        unit: "meter",
        currentStock: 65.25,
      },
    }),
  ]);

  console.log("✅ Variants created:", variants.length);

  // Step 4: Create Stock Mutations (Incoming Stock)
  console.log("📈 Step 4: Creating stock mutations...");

  const stockMutations = await Promise.all([
    // Fabric stock ins
    prisma.stockMutation.create({
      data: {
        variantId: variants[0].id, // Katun Putih
        type: "IN",
        quantity: 100,
        unit: "meter",
        note: "Dummy - Pembelian awal stock",
        source: "Supplier Textile Jakarta",
        createdById: userId,
      },
    }),
    prisma.stockMutation.create({
      data: {
        variantId: variants[1].id, // Katun Biru Navy
        type: "IN",
        quantity: 150,
        unit: "meter",
        note: "Dummy - Pembelian stock rutin",
        source: "Supplier Textile Jakarta",
        createdById: userId,
      },
    }),
    prisma.stockMutation.create({
      data: {
        variantId: variants[2].id, // Katun Merah Maroon
        type: "IN",
        quantity: 80,
        unit: "meter",
        note: "Dummy - Stock kain warna khusus",
        source: "Supplier Textile Bandung",
        createdById: userId,
      },
    }),

    // Thread stock ins
    prisma.stockMutation.create({
      data: {
        variantId: variants[3].id, // Benang Putih
        type: "IN",
        quantity: 60,
        unit: "ball",
        note: "Dummy - Stock benang bulanan",
        source: "Distributor Benang Surabaya",
        createdById: userId,
      },
    }),
    prisma.stockMutation.create({
      data: {
        variantId: variants[4].id, // Benang Hitam
        type: "IN",
        quantity: 48,
        unit: "ball",
        note: "Dummy - Restock benang hitam",
        source: "Distributor Benang Surabaya",
        createdById: userId,
      },
    }),

    // Some stock outs for production
    prisma.stockMutation.create({
      data: {
        variantId: variants[0].id, // Katun Putih
        type: "OUT",
        quantity: 25.5,
        unit: "meter",
        note: "Dummy - Produksi baju seragam SD",
        source: "Production Order #001",
        createdById: userId,
      },
    }),
    prisma.stockMutation.create({
      data: {
        variantId: variants[1].id, // Katun Biru Navy
        type: "OUT",
        quantity: 45.25,
        unit: "meter",
        note: "Dummy - Produksi seragam SMP",
        source: "Production Order #002",
        createdById: userId,
      },
    }),

    // Button usage
    prisma.stockMutation.create({
      data: {
        variantId: variants[6].id, // Kancing Putih
        type: "OUT",
        quantity: 120,
        unit: "pcs",
        note: "Dummy - Kancing untuk seragam SD",
        source: "Production Order #001",
        createdById: userId,
      },
    }),

    // Stock adjustment
    prisma.stockMutation.create({
      data: {
        variantId: variants[6].id, // Kancing Putih
        type: "ADJUSTMENT",
        quantity: 70,
        unit: "pcs",
        note: "Dummy - Penyesuaian stock fisik",
        source: "Stock Opname Januari",
        createdById: userId,
      },
    }),

    // Zipper stock in
    prisma.stockMutation.create({
      data: {
        variantId: variants[8].id, // Resleting Hitam
        type: "IN",
        quantity: 240,
        unit: "pcs",
        note: "Dummy - Pembelian resleting",
        source: "Supplier Aksesoris Solo",
        createdById: userId,
      },
    }),
  ]);

  console.log("✅ Stock mutations created:", stockMutations.length);

  // Step 5: Create Cash Audit Logs and Transactions
  console.log("💳 Step 5: Creating transactions and cash audit logs...");

  // Create some cash audit logs first
  const auditLogs = await Promise.all([
    prisma.cashAuditLog.create({
      data: {
        amount: 18500000.0, // IDR 18.5 million expense
        previousBalance: 50000000.0,
        nextBalance: 31500000.0,
        type: "EXPENSE",
        note: "Dummy - Pembelian bahan baku bulan ini",
        createdById: userId,
      },
    }),
    prisma.cashAuditLog.create({
      data: {
        amount: 32000000.0, // IDR 32 million income
        previousBalance: 31500000.0,
        nextBalance: 63500000.0,
        type: "INCOME",
        note: "Dummy - Penjualan produk jadi seragam",
        createdById: userId,
      },
    }),
    prisma.cashAuditLog.create({
      data: {
        amount: 3200000.0, // IDR 3.2 million expense
        previousBalance: 63500000.0,
        nextBalance: 60300000.0,
        type: "EXPENSE",
        note: "Dummy - Pembelian aksesoris tambahan",
        createdById: userId,
      },
    }),
  ]);

  // Create transactions linked to audit logs
  const transactions = await Promise.all([
    // Expense transaction
    prisma.transaction.create({
      data: {
        type: "EXPENSE",
        totalAmount: 18500000.0,
        source: "Supplier Textile Jakarta",
        note: "Dummy - Pembelian kain katun dan benang januari",
        createdById: userId,
        auditLogId: auditLogs[0].id,
      },
    }),

    // Income transaction
    prisma.transaction.create({
      data: {
        type: "INCOME",
        totalAmount: 32000000.0,
        source: "SD Negeri 1 Yogyakarta",
        note: "Dummy - Penjualan seragam sekolah batch 1",
        createdById: userId,
        auditLogId: auditLogs[1].id,
      },
    }),

    // Transaction for accessories
    prisma.transaction.create({
      data: {
        type: "EXPENSE",
        totalAmount: 3200000.0,
        source: "Supplier Aksesoris Solo",
        note: "Dummy - Pembelian resleting dan aksesoris",
        createdById: userId,
        auditLogId: auditLogs[2].id,
      },
    }),

    // Income transaction without audit log
    prisma.transaction.create({
      data: {
        type: "INCOME",
        totalAmount: 15000000.0,
        source: "SMP Swasta Bina Bangsa",
        note: "Dummy - Penjualan seragam SMP (cash)",
        createdById: userId,
      },
    }),
  ]);

  console.log("✅ Transactions created:", transactions.length);

  // Step 6: Create Transaction Items (some linked to stock mutations)
  console.log("📋 Step 6: Creating transaction items...");

  const transactionItems = await Promise.all([
    // Items for first expense transaction (linked to stock mutations)
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[0].id,
        mutationId: stockMutations[0].id, // Katun Putih IN
        name: "Kain Katun Putih",
        quantity: 100,
        unit: "meter",
        supplier: "Supplier Textile Jakarta",
        totalPrice: 9500000.0, // IDR 9.5 million
      },
    }),
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[0].id,
        mutationId: stockMutations[1].id, // Katun Biru Navy IN
        name: "Kain Katun Biru Navy",
        quantity: 150,
        unit: "meter",
        supplier: "Supplier Textile Jakarta",
        totalPrice: 6000000.0, // IDR 6 million
      },
    }),
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[0].id,
        mutationId: stockMutations[3].id, // Benang Putih IN
        name: "Benang Jahit Putih 40s",
        quantity: 60,
        unit: "ball",
        supplier: "Distributor Benang Surabaya",
        totalPrice: 3000000.0, // IDR 3 million
      },
    }),

    // Items for first income transaction (no stock mutation - finished products)
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[1].id,
        name: "Seragam SD Putih Lengkap",
        quantity: 120,
        unit: "set",
        totalPrice: 18000000.0, // IDR 18 million
      },
    }),
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[1].id,
        name: "Seragam Olahraga SD",
        quantity: 80,
        unit: "set",
        totalPrice: 14000000.0, // IDR 14 million
      },
    }),

    // Items for accessories purchase
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[2].id,
        mutationId: stockMutations[9].id, // Resleting Hitam IN
        name: "Resleting Hitam 20cm",
        quantity: 240,
        unit: "pcs",
        supplier: "Supplier Aksesoris Solo",
        totalPrice: 2400000.0, // IDR 2.4 million
      },
    }),
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[2].id,
        name: "Label Nama Sekolah",
        quantity: 500,
        unit: "pcs",
        supplier: "Supplier Aksesoris Solo",
        totalPrice: 800000.0, // IDR 800k
      },
    }),

    // Items for second income (SMP uniforms)
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[3].id,
        name: "Seragam SMP Navy Lengkap",
        quantity: 60,
        unit: "set",
        totalPrice: 15000000.0, // IDR 15 million
      },
    }),
  ]);

  console.log("✅ Transaction items created:", transactionItems.length);

  // Update final cash balance
  await prisma.cashBalance.update({
    where: { id: CASH_BALANCE_ID },
    data: { balance: 60300000.0 }, // Final balance after all transactions
  });

  console.log("🎉 Dummy data creation completed successfully!");
  console.log("📊 Summary:");
  console.log("- Items:", items.length);
  console.log("- Variants:", variants.length);
  console.log("- Stock Mutations:", stockMutations.length);
  console.log("- Transactions:", transactions.length);
  console.log("- Transaction Items:", transactionItems.length);
  console.log("- Cash Audit Logs:", auditLogs.length);
  console.log(
    "💰 Final Cash Balance: IDR",
    (60300000.0).toLocaleString("id-ID")
  );
}

await prisma.$transaction(async (prisma) => {
  await main(prisma);
});
