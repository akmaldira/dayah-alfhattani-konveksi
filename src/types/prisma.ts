import { Prisma, PrismaClient } from "@/lib/prisma/generated";
import { DefaultArgs } from "@/lib/prisma/generated/runtime/library";

export type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type ItemWithRelations = Prisma.ItemGetPayload<{
  include: {
    variants: true;
    conversions: true;
  };
}>;

export type StockMutationWithRelations = Prisma.StockMutationGetPayload<{
  include: {
    variant: {
      include: {
        item: true;
      };
    };
  };
}>;

export type TransactionItemWithRelations = Prisma.TransactionItemGetPayload<{
  include: {
    mutation: {
      include: {
        variant: {
          include: {
            item: true;
          };
        };
      };
    };
  };
}>;

export type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    items: {
      include: {
        mutation: {
          include: {
            variant: {
              include: {
                item: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type CashAuditLogWithRelations = Prisma.CashAuditLogGetPayload<{
  include: {
    transaction: {
      include: {
        items: true;
      };
    };
  };
}>;
