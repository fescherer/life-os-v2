"use client";

import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
import {
  CreateOptionSelect,
  type SelectOption,
} from "@/components/create-option-select";
import type { FinanceSelectOption } from "@/types/finance-selects";

export type CreateAssetFormData = {
  ticker: string;
  assetType: string;
  assetName: string;
};

type Props = {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  assetTypeOptions: FinanceSelectOption[];
  register: UseFormRegister<CreateAssetFormData>;
  watch: UseFormWatch<CreateAssetFormData>;
  setValue: UseFormSetValue<CreateAssetFormData>;
  onCreateAssetType: (option: SelectOption) => Promise<FinanceSelectOption | void>;
  onDeleteAssetType: (option: FinanceSelectOption) => Promise<boolean>;
  onSave: () => Promise<boolean> | boolean;
};

export function CreateAsset({
  triggerRef,
  assetTypeOptions,
  register,
  watch,
  setValue,
  onCreateAssetType,
  onDeleteAssetType,
  onSave,
}: Props) {
  const assetType = watch("assetType");

  return (
    <Modal
      triggerContent={
        <button
          ref={triggerRef}
          type="button"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      }
      modalTitle={<span>Criar novo ativo</span>}
      modalActionsTitle="Salvar ativo"
      modalActionOnSave={onSave}
    >
      <div className="space-y-4 py-4">
        <Field label="Ticker">
          <input
            className="input input-bordered w-full uppercase"
            placeholder="GARE11"
            {...register("ticker")}
          />
        </Field>

        <CreateOptionSelect
          label="Tipo do ativo"
          value={assetType}
          options={assetTypeOptions}
          onChange={(value) => setValue("assetType", value)}
          onCreate={onCreateAssetType}
          onDeleteOption={onDeleteAssetType}
          placeholder="FII, STOCKS, CRYPTO..."
        />

        <Field label="Nome completo">
          <input
            className="input input-bordered w-full"
            placeholder="Guardian Real Estate FII de RL Única"
            {...register("assetName")}
          />
        </Field>
      </div>
    </Modal>
  );
}
