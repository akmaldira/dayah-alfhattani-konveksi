import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import IncomeByIdClient from "./client";

type Params = Promise<{ id: string }>;

export default async function IncomeDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  if (!id) {
    redirect("/app/finance/income");
  }

  if (id === "create") {
    return <IncomeByIdClient />;
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      items: {
        include: {
          mutation: true,
        },
      },
    },
  });

  if (!transaction) {
    redirect("/app/finance/income");
  }

  return <IncomeByIdClient income={transaction} />;
}
