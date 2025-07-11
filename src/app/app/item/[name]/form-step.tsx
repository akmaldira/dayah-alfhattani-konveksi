import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpsertItemSchema } from "@/schema/item-schema";
import { PlusIcon, TrashIcon } from "lucide-react";
import React from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

export function ItemFormStep({
  action,
  form,
  onNext,
  onPrevious,
}: {
  action: "create" | "update";
  form: UseFormReturn<UpsertItemSchema, any, UpsertItemSchema>;
  onNext: () => void;
  onPrevious?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  function triggerNext() {
    startTransition(async () => {
      const isNameValid = await form.trigger("name");
      const isDefaultUnitValid = await form.trigger("defaultUnit");
      if (isNameValid && isDefaultUnitValid) {
        onNext();
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start w-full gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel required>Nama Item</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Kain Katun" {...field} />
              </FormControl>
              <FormDescription>
                Nama item secara global. e.g. Kain Katun, Kancing, dll.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultUnit"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel required>Satuan Terkecil</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Meter"
                  {...field}
                  disabled={action === "update"}
                />
              </FormControl>
              <FormDescription>
                Satuan terkecil untuk menghitung penambahan dan pengurangan
                stok.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex justify-end gap-4">
        {onPrevious && (
          <Button type="button" variant="outline" onClick={onPrevious}>
            Kembali
          </Button>
        )}
        <Button type="button" onClick={triggerNext} loading={isPending}>
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}

export function VariantFormStep({
  action,
  form,
  state,
  onNext,
  onPrevious,
}: {
  action: "create" | "update";
  form: UseFormReturn<UpsertItemSchema, any, UpsertItemSchema>;
  state: UpsertItemSchema;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  function triggerNext() {
    startTransition(async () => {
      const isNameValid = await form.trigger("name");
      const isDefaultUnitValid = await form.trigger("defaultUnit");
      const isVariantsValid = await form.trigger("variants");
      console.log(form.formState.errors);
      if (isNameValid && isDefaultUnitValid && isVariantsValid) {
        onNext();
      }
    });
  }

  const variantForm = useFieldArray({
    name: "variants",
    control: form.control,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 items-end">
        <Button
          type="button"
          onClick={() =>
            variantForm.append({
              action: "create",
              name: "",
              currentStock: 0,
            })
          }
        >
          <PlusIcon className="w-4 h-4" />
          Tambah Varian
        </Button>
        <Table>
          <TableCaption>
            {form.formState.errors.variants?.message ? (
              <p className="text-red-500">
                {form.formState.errors.variants.message}
              </p>
            ) : (
              "List varian item. Contoh: item dengan nama Kain katun, memiliki varian hitam, putih, dll."
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Varian {state.name}</TableHead>
              <TableHead>
                {action === "create" ? "Stok Awal" : "Stok Saat Ini"}
              </TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variantForm.fields
              .filter((f) => ("isDeleted" in f ? f.isDeleted !== true : true))
              .map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="!align-top">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input placeholder="e.g., Hitam" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="!align-top">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.currentStock`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="e.g., 0"
                                {...field}
                                type="number"
                              />
                              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {state.defaultUnit}
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="!align-top">
                    <Button
                      size="icon"
                      variant="destructive"
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        if (field.action === "create") {
                          variantForm.remove(index);
                        } else {
                          variantForm.update(index, {
                            ...field,
                            // @ts-ignore
                            isDeleted: true,
                          });
                        }
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Kembali
        </Button>
        <Button type="button" onClick={triggerNext} loading={isPending}>
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}

export function UnitConversionFormStep({
  action: _action,
  form,
  state,
  onSubmit,
  onPrevious,
}: {
  action: "create" | "update";
  form: UseFormReturn<UpsertItemSchema, any, UpsertItemSchema>;
  state: UpsertItemSchema;
  onSubmit: (values: UpsertItemSchema) => Promise<void>;
  onPrevious: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  async function isFormValid() {
    const isNameValid = await form.trigger("name");
    const isDefaultUnitValid = await form.trigger("defaultUnit");
    const isVariantsValid = await form.trigger("variants");
    const isUnitConversionsValid = await form.trigger("unitConversions");
    return (
      isNameValid &&
      isDefaultUnitValid &&
      isVariantsValid &&
      isUnitConversionsValid
    );
  }

  function triggerNext() {
    startTransition(async () => {
      if (await isFormValid()) {
        await onSubmit(form.getValues());
        setConfirmDialogOpen(false);
      }
    });
  }
  const unitConversionForm = useFieldArray({
    name: "unitConversions",
    control: form.control,
  });
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 items-end">
        <Button
          type="button"
          onClick={() =>
            unitConversionForm.append({
              action: "create",
              fromUnit: "",
              multiplier: 1,
            })
          }
        >
          <PlusIcon className="w-4 h-4" />
          Tambah Konversi
        </Button>
        <Table>
          <TableCaption>
            List konversi item satuan, data ini digunakan untuk mengkalkulasi
            stok item.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Nilai</TableHead>
              <TableHead>Dari Satuan</TableHead>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="w-24">Perkalian</TableHead>
              <TableHead></TableHead>
              <TableHead className="w-20">Rasio</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unitConversionForm.fields
              .filter((f) => ("isDeleted" in f ? f.isDeleted !== true : true))
              .map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="w-24 !align-top">
                    <Input disabled value={1} />
                  </TableCell>
                  <TableCell className="!align-top">
                    <FormField
                      control={form.control}
                      name={`unitConversions.${index}.fromUnit`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input {...field} placeholder="e.g., Ball" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="w-10 !align-top">=</TableCell>
                  <TableCell className="w-24 !align-top">
                    <FormField
                      control={form.control}
                      name={`unitConversions.${index}.multiplier`}
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-24">
                          <FormControl>
                            <Input
                              placeholder="e.g., 12"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(
                                  e.target.value === "" ? "" : +e.target.value
                                );
                              }}
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="!align-top">
                    <FormField
                      control={form.control}
                      name={"defaultUnit"}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="w-24 !align-top">
                    <Input
                      disabled
                      value={`1:${state.unitConversions[index].multiplier}`}
                    />
                  </TableCell>
                  <TableCell className="w-20 !align-top">
                    <Button
                      size="icon"
                      variant="destructive"
                      type="button"
                      disabled={
                        field.action == "update" &&
                        field.fromUnit === state.defaultUnit
                      }
                      onClick={() => {
                        if (field.action === "create") {
                          unitConversionForm.remove(index);
                        } else {
                          unitConversionForm.update(index, {
                            ...field,
                            // @ts-ignore
                            isDeleted: true,
                          });
                        }
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Kembali
        </Button>
        <FormConfirmationDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          values={form.getValues()}
          onSubmit={triggerNext}
          isFormValid={isFormValid}
          loading={isPending}
          disabled={isPending}
        />
      </div>
    </div>
  );
}

export function FormConfirmationDialog({
  open,
  onOpenChange,
  isFormValid,
  values,
  onSubmit,
  loading,
  disabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFormValid: () => Promise<boolean>;
  values: UpsertItemSchema;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false);
          return;
        }
        isFormValid().then(onOpenChange);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">Selanjutnya</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi</DialogTitle>
          <DialogDescription>
            Pastikan data yang Anda masukkan sudah benar.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p>Nama Item</p>
              <Input disabled value={values.name} />
            </div>
            <div className="space-y-1">
              <p>Satuan Terkecil</p>
              <Input disabled value={values.defaultUnit} />
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <p className="font-bold">Varian {values.name}</p>
            <div>
              {values.variants.filter((v) => !("isDeleted" in v)).length ? (
                values.variants
                  .filter((v) => !("isDeleted" in v))
                  .map((variant, index) => (
                    <p key={index} className="pl-2 line-clamp-1">
                      - {variant.name} dengan stok {variant.currentStock}{" "}
                      {values.defaultUnit}
                    </p>
                  ))
              ) : (
                <p className="text-sm text-yellow-500">
                  Tidak ada varian item. Setiap mencatat belanja, stok tidak
                  akan bertambah, hanya akan mengurangi kas.
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <p className="font-bold">Konversi Satuan</p>
            <div>
              {values.unitConversions.filter((c) => !("isDeleted" in c))
                .length ? (
                values.unitConversions
                  .filter((c) => !("isDeleted" in c))
                  .map((conversion, index) => (
                    <p key={index} className="pl-2 line-clamp-1">
                      - <span className="font-bold">{conversion.fromUnit}</span>{" "}
                      ke <span className="font-bold">{values.defaultUnit}</span>{" "}
                      (1 {conversion.fromUnit} = {conversion.multiplier}{" "}
                      {values.defaultUnit})
                    </p>
                  ))
              ) : (
                <p className="text-sm text-yellow-500">
                  Tidak ada konversi satuan. Setiap mencatat belanja, stok tidak
                  akan bertambah, hanya akan mengurangi kas.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            loading={loading}
            disabled={disabled}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
