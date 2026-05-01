import { Controller, Control } from "react-hook-form";

import { CreateOptionSelect } from "@/components/create-option-select";
import type { FinanceSelectOption } from "@/types/finance-selects";
import { FinanceFormData } from ".";

type Option = {
  label: string;
  value: string;
};

type Props = {
  control: Control<FinanceFormData>;
  categoryOptions: FinanceSelectOption[];
  onCreateCategory: (option: Option) => Promise<FinanceSelectOption>;
  onDeleteCategory: (option: FinanceSelectOption) => Promise<boolean>;
};

export function FinanceEntryFields({
  control,
  categoryOptions,
  onCreateCategory,
  onDeleteCategory,
}: Props) {
  return (
    <Controller
      control={control}
      name="category"
      render={({ field }) => (
        <CreateOptionSelect
          label="Categoria"
          value={field.value || ""}
          options={categoryOptions}
          onChange={field.onChange}
          onCreate={onCreateCategory}
          onDeleteOption={onDeleteCategory}
          placeholder="Selecionar categoria"
        />
      )}
    />
  );
}
