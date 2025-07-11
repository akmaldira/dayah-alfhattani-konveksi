import { PrismaClient } from "@/lib/prisma/generated";

const prisma = new PrismaClient();

async function main() {
  const cash = await prisma.cashBalance.findUnique({ where: { id: 1 } });

  if (!cash) {
    await prisma.cashBalance.create({
      data: {
        id: 1,
        balance: 0,
      },
    });

    console.log("✅ CashBalance initialized.");
  } else {
    console.log("✅ CashBalance already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
