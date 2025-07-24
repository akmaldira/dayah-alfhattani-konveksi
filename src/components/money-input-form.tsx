"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useReducer } from "react";
import { UseFormReturn } from "react-hook-form";

type TextInputProps = {
  form: UseFormReturn<any>;
  name: string;
  label?: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

const moneyFormatter = Intl.NumberFormat("id-ID", {
  currency: "IDR",
  currencyDisplay: "symbol",
  currencySign: "standard",
  style: "currency",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function MoneyInputForm(props: TextInputProps) {
  const baseValue = props.form.getValues()[props.name];
  console.log("BASE VALUE", baseValue);
  const initialValue = baseValue
    ? moneyFormatter.format(baseValue)
    : moneyFormatter.format(props.form.watch(props.name));

  const [value, setValue] = useReducer((_: any, next: string) => {
    const digits = next.replace(/\D/g, "");
    return moneyFormatter.format(Number(digits));
  }, initialValue);

  function handleChange(
    realChangeFn: (value: number) => void,
    formattedValue: string
  ) {
    const digits = formattedValue.replace(/\D/g, "");
    const realValue = Number(digits);
    realChangeFn(realValue);
  }

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        field.value = value;
        const _change = field.onChange;

        return (
          <FormItem className={props.className}>
            {props.label && (
              <FormLabel required={props.required}>{props.label}</FormLabel>
            )}
            <FormControl>
              <Input
                placeholder={props.placeholder}
                type="text"
                {...field}
                onChange={(ev) => {
                  setValue(ev.target.value);
                  handleChange(_change, ev.target.value);
                }}
                value={value}
                disabled={props.disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
