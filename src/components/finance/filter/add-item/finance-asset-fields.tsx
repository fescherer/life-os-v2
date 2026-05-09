"use client";

import { useRef } from "react";
import { Controller, Control, useForm } from "react-hook-form";

import {
  CreateOptionSelect,
  type SelectOption,
} from "@/components/create-option-select";
import type { FinanceAssetOption } from "@/queries/finances/assets";
import type { FinanceSelectOption } from "@/types/finance-selects";
import { CreateAsset, type CreateAssetFormData } from "./create-asset";

type FinanceAssetFieldsFormData = {
  asset: string;
};

type Props = {
  assetOptions: FinanceAssetOption[];
  control: Control<FinanceAssetFieldsFormData>;
  assetTypeOptions: FinanceSelectOption[];
  onCreateAsset: (input: {
    assetName: string;
    assetType: string;
    ticker: string;
  }) => Promise<FinanceAssetOption>;
  onCreateAssetType: (option: SelectOption) => Promise<FinanceSelectOption | void>;
  onDeleteAsset: (option: FinanceAssetOption) => Promise<boolean>;
  onDeleteAssetType: (option: FinanceSelectOption) => Promise<boolean>;
};

export function FinanceAssetFields({
  assetOptions,
  control,
  assetTypeOptions,
  onCreateAsset,
  onCreateAssetType,
  onDeleteAsset,
  onDeleteAssetType,
}: Props) {
  const createAssetTriggerRef = useRef<HTMLButtonElement | null>(null);
  const assetForm = useForm<CreateAssetFormData>({
    defaultValues: {
      ticker: "",
      assetType: "",
      assetName: "",
    },
  });

  return (
    <Controller
      control={control}
      name="asset"
      render={({ field }) => {
        function handleOpenCreateAssetModal(search: string) {
          assetForm.reset({
            ticker: search.toUpperCase(),
            assetType: "",
            assetName: "",
          });
          createAssetTriggerRef.current?.click();
        }

        async function handleCreateAsset() {
          const { ticker, assetType, assetName } = assetForm.getValues();
          const trimmedTicker = ticker.trim().toUpperCase();
          const trimmedName = assetName.trim();

          if (!trimmedTicker || !trimmedName || !assetType) {
            return false;
          }

          const createdAsset = await onCreateAsset({
            assetName: trimmedName,
            assetType,
            ticker: trimmedTicker,
          });

          field.onChange(createdAsset.value);
          assetForm.reset({
            ticker: "",
            assetType: "",
            assetName: "",
          });
          return true;
        }

        return (
          <>
            <CreateOptionSelect
              label="Ativo"
              value={field.value || ""}
              options={assetOptions}
              onChange={field.onChange}
              onDeleteOption={onDeleteAsset}
              onCreateRequest={handleOpenCreateAssetModal}
              createActionLabel="Criar novo ativo"
              placeholder="Selecionar ativo"
            />

            <CreateAsset
              triggerRef={createAssetTriggerRef}
              assetTypeOptions={assetTypeOptions}
              register={assetForm.register}
              watch={assetForm.watch}
              setValue={assetForm.setValue}
              onCreateAssetType={onCreateAssetType}
              onDeleteAssetType={onDeleteAssetType}
              onSave={handleCreateAsset}
            />
          </>
        );
      }}
    />
  );
}
