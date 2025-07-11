"use client";

import { Form } from "@/components/ui/form";
import { upsertItemSchema, UpsertItemSchema } from "@/schema/item-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
// import {
//   ItemFormStep,
//   UnitConversionFormStep,
//   VariantFormStep,
// } from "./form-step";
import { upsertItemAction } from "@/action/item-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { handleActionResponse, itemToUpdateItem } from "@/lib/utils";
import { ItemWithRelations } from "@/types/prisma";
import { ArrowLeftIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const ItemFormStep = dynamic(
  () => import("./form-step").then((mod) => mod.ItemFormStep),
  { ssr: false }
);
const VariantFormStep = dynamic(
  () => import("./form-step").then((mod) => mod.VariantFormStep),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-96">
        Loading...
      </div>
    ),
  }
);
const UnitConversionFormStep = dynamic(
  () => import("./form-step").then((mod) => mod.UnitConversionFormStep),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-96">
        Loading...
      </div>
    ),
  }
);

export default function ItemByUniqueNameClient({
  item,
}: {
  item?: ItemWithRelations;
}) {
  const router = useRouter();
  const action = item ? "update" : "create";
  const [step, setStep] = React.useState(0);
  const form = useForm<UpsertItemSchema>({
    resolver: zodResolver(upsertItemSchema),
    defaultValues: item
      ? itemToUpdateItem(item)
      : {
          action: "create",
          name: "",
          defaultUnit: "",
          variants: [
            {
              action: "create",
              name: "",
              currentStock: 0,
            },
          ],
          unitConversions: [
            {
              action: "create",
              fromUnit: "",
              multiplier: 1,
            },
          ],
        },
  });

  async function onSubmit(values: UpsertItemSchema) {
    const response = await upsertItemAction(values);
    handleActionResponse(response);
  }

  const watch = form.watch();

  const formSteps = [
    {
      label: "Informasi Item",
      content: (
        <ItemFormStep action={action} form={form} onNext={() => setStep(1)} />
      ),
    },
    {
      label: "Item Varian",
      content: (
        <VariantFormStep
          action={action}
          form={form}
          state={watch}
          onNext={() => setStep(2)}
          onPrevious={() => setStep(0)}
        />
      ),
    },
    {
      label: "Konversi Satuan",
      content: (
        <UnitConversionFormStep
          action={action}
          form={form}
          state={watch}
          onSubmit={onSubmit}
          onPrevious={() => setStep(1)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {item ? `Ubah Barang ${item.name}` : "Tambah barang"}
          </CardTitle>
          <CardDescription>{formSteps[step].label}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">{formSteps[step].content}</form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
