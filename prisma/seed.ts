import { PrismaClient } from "@/lib/prisma/generated";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    // Remove this in production
    prisma.user.upsert({
      where: { email: "akmaldiraa@gmail.com" },
      update: {},
      create: {
        name: "Akmal Dira",
        email: "akmaldiraa@gmail.com",
        password:
          "$2a$10$91R1JsuwXpw5LMP8XXUoJO59EpLyU75mkBRGgZTzol84LEMny2R.K",
        role: "ROOT",
      },
    }),
    prisma.cashBalance.upsert({
      where: { id: 1 },
      update: {},
      create: {},
    }),
  ]);

  console.log("✅ CashBalance initialized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
