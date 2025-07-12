import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExpenseByIdClient from "./client";

type Params = Promise<{ id: string }>;

export default async function ExpenseDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  if (!id) {
    redirect("/app/finance/expense");
  }

  const items = await prisma.item.findMany({
    include: {
      variants: true,
      conversions: true,
    },
  });

  if (id === "create") {
    return <ExpenseByIdClient items={items} />;
  }

  const expense = await prisma.transaction.findUnique({
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

  if (!expense) {
    redirect("/app/finance/expense");
  }

  return <ExpenseByIdClient expense={expense} items={items} />;
}
