"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { FinanceDatePicker } from "@/components/finance/finance-date-picker";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
import {
  CreateOptionSelect,
  type SelectOption,
} from "@/components/create-option-select";
import {
  type FinanceAssetDeletePreview,
  type FinanceAssetOption,
} from "@/queries/finances/assets";
import type {
  FinanceAssetEntry,
  FinanceChangedRecord,
  FinanceEditRecord,
  FinanceEntry,
} from "@/queries/finances/entries";
import {
  type FinanceSelectDeletePreview,
  FINANCE_SELECT_NAMES,
  type FinanceSelectName,
  type FinanceSelectOption,
  type FinanceSelectsData,
  getFinanceSelectKeyByName,
} from "@/types/finance-selects";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DiamondPlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { createPortal } from "react-dom";
import { FinanceAssetFields } from "./finance-asset-fields";
import { FinanceEntryFields } from "./finance-entry-fields";

function mergeFinanceOptions(
  currentOptions: FinanceSelectOption[],
  nextOption: FinanceSelectOption
) {
  const optionsByValue = new Map(
    currentOptions.map((option) => [option.value, option] as const)
  );

  optionsByValue.set(nextOption.value, nextOption);

  return Array.from(optionsByValue.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

const formSchema = z.object({
  launchType: z.enum(["fin_entries", "fin_asset_entries"]),
  date: z.string().min(1, "Informe a data"),
  amount: z.number().positive("Informe um valor valido"),
  description: z.string().optional(),
  bank: z.string().min(1, "Selecione um banco"),
  type: z.string().min(1, "Selecione um tipo"),
  category: z.string().optional(),
  asset: z.string().optional(),
});

export type FinanceFormData = z.infer<typeof formSchema>;
export type Option = SelectOption;

type Props = {
  editingRecord: FinanceEditRecord | null;
  initialAssets: FinanceAssetOption[];
  initialSelects: FinanceSelectsData;
  onEditingChange: (record: FinanceEditRecord | null) => void;
  onRecordSaved: (record: FinanceChangedRecord) => void;
};

type DeleteDialogState =
  | {
    asset: FinanceAssetOption;
    mode: "asset-confirm";
    preview: FinanceAssetDeletePreview;
  }
  | {
    mode: "confirm";
    option: FinanceSelectOption;
    preview: FinanceSelectDeletePreview;
    selectName: FinanceSelectName;
  }
  | {
    message: string;
    mode: "error";
    title: string;
  }
  | null;

type SuccessDialogState =
  | {
    isOpen: true;
    launchType: FinanceFormData["launchType"];
  }
  | {
    isOpen: false;
    launchType: FinanceFormData["launchType"] | null;
  };

async function fetchFinanceSelects(): Promise<FinanceSelectsData> {
  const response = await fetch("/api/finances/selects");

  if (!response.ok) {
    throw new Error("Erro ao carregar selects financeiros.");
  }

  return response.json();
}

async function fetchFinanceAssets(): Promise<FinanceAssetOption[]> {
  const response = await fetch("/api/finances/assets");

  if (!response.ok) {
    throw new Error("Erro ao carregar ativos financeiros.");
  }

  return response.json();
}

async function createFinanceSelectOptionRequest(input: {
  selectName: FinanceSelectName;
  label: string;
}): Promise<FinanceSelectOption> {
  const response = await fetch("/api/finances/selects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || "Erro ao criar opcao.");
  }

  return response.json();
}

async function previewFinanceSelectOptionDeletionRequest(input: {
  optionId: number;
  selectName: FinanceSelectName;
}): Promise<FinanceSelectDeletePreview> {
  const response = await fetch("/api/finances/selects", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw Object.assign(
      new Error(payload?.error || "Erro ao verificar exclusao da opcao."),
      { payload, status: response.status }
    );
  }

  return payload;
}

async function deleteFinanceSelectOptionRequest(input: {
  optionId: number;
  selectName: FinanceSelectName;
}): Promise<FinanceSelectDeletePreview> {
  const response = await fetch("/api/finances/selects", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      confirm: true,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Erro ao excluir opcao.");
  }

  return payload;
}

async function createFinanceAssetRequest(input: {
  name: string;
  ticker: string;
  typeId: number;
}): Promise<FinanceAssetOption> {
  const response = await fetch("/api/finances/assets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Erro ao criar ativo.");
  }

  return payload;
}

async function previewFinanceAssetDeletionRequest(input: {
  assetId: number;
}): Promise<FinanceAssetDeletePreview> {
  const response = await fetch("/api/finances/assets", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw Object.assign(
      new Error(payload?.error || "Erro ao verificar exclusao do ativo."),
      { payload, status: response.status }
    );
  }

  return payload;
}

async function deleteFinanceAssetRequest(input: {
  assetId: number;
}): Promise<FinanceAssetDeletePreview> {
  const response = await fetch("/api/finances/assets", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      confirm: true,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Erro ao excluir ativo.");
  }

  return payload;
}

async function createFinanceRecordRequest(input:
  | {
    bankId: number;
    categoryId: number;
    date: string;
    description: string;
    table: "fin_entries";
    typeId: number;
    value: number;
  }
  | {
    assetId: number;
    bankId: number;
    date: string;
    description: string;
    table: "fin_assets_entries";
    typeId: number;
    value: number;
  }
): Promise<FinanceEntry | FinanceAssetEntry> {
  const response = await fetch("/api/finances", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Erro ao salvar lancamento.");
  }

  return payload;
}

async function updateFinanceRecordRequest(input:
  | {
    bankId: number;
    categoryId: number;
    date: string;
    description: string;
    id: number;
    table: "fin_entries";
    typeId: number;
    value: number;
  }
  | {
    assetId: number;
    bankId: number;
    date: string;
    description: string;
    id: number;
    table: "fin_assets_entries";
    typeId: number;
    value: number;
  }
): Promise<FinanceEntry | FinanceAssetEntry> {
  const response = await fetch("/api/finances", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Erro ao atualizar lancamento.");
  }

  return payload;
}

export function FinanceAddItem({
  editingRecord,
  initialAssets,
  initialSelects,
  onEditingChange,
  onRecordSaved,
}: Props) {
  const queryClient = useQueryClient();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] =
    useState<DeleteDialogState>(null);
  const [successDialogState, setSuccessDialogState] = useState<SuccessDialogState>({
    isOpen: false,
    launchType: null,
  });
  const title = (
    <>
      <DiamondPlus size={20} />
      <span>Adicionar Lancamento</span>
    </>
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FinanceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      launchType: "fin_entries",
      date: "",
      amount: 0,
      description: "",
      bank: "",
      type: "",
      category: "",
      asset: "",
    },
  });

  const { data: selectData } = useQuery({
    queryKey: ["finance-selects"],
    queryFn: fetchFinanceSelects,
    initialData: initialSelects,
  });

  const { data: assetData } = useQuery({
    queryKey: ["finance-assets"],
    queryFn: fetchFinanceAssets,
    initialData: initialAssets,
  });

  const createOptionMutation = useMutation({
    mutationFn: createFinanceSelectOptionRequest,
    onSuccess: (createdOption, variables) => {
      const key = getFinanceSelectKeyByName(variables.selectName);

      queryClient.setQueryData<FinanceSelectsData>(
        ["finance-selects"],
        (current) => {
          const base = current ?? initialSelects;

          return {
            ...base,
            [key]: mergeFinanceOptions(base[key], createdOption),
          };
        }
      );
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: deleteFinanceSelectOptionRequest,
    onSuccess: (_, variables) => {
      const key = getFinanceSelectKeyByName(variables.selectName);

      queryClient.setQueryData<FinanceSelectsData>(
        ["finance-selects"],
        (current) => {
          const base = current ?? initialSelects;

          return {
            ...base,
            [key]: base[key].filter((option) => option.id !== variables.optionId),
          };
        }
      );
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: createFinanceAssetRequest,
    onSuccess: (createdAsset) => {
      queryClient.setQueryData<FinanceAssetOption[]>(
        ["finance-assets"],
        (current) => {
          const base = current ?? initialAssets;
          const assetsByTicker = new Map(
            base.map((asset) => [asset.value, asset] as const)
          );

          assetsByTicker.set(createdAsset.value, createdAsset);

          return Array.from(assetsByTicker.values()).sort((a, b) =>
            a.label.localeCompare(b.label)
          );
        }
      );
    },
  });

  const createFinanceRecordMutation = useMutation({
    mutationFn: createFinanceRecordRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["finances"],
      });
    },
  });

  const updateFinanceRecordMutation = useMutation({
    mutationFn: updateFinanceRecordRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["finances"],
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteFinanceAssetRequest,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<FinanceAssetOption[]>(
        ["finance-assets"],
        (current) => {
          const base = current ?? initialAssets;

          return base.filter((asset) => asset.id !== variables.assetId);
        }
      );
    },
  });

  const launchType = useWatch({
    control,
    name: "launchType",
  });
  const isEditing = Boolean(editingRecord);
  const isEditingRef = useRef(isEditing);

  isEditingRef.current = isEditing;

  const editingLaunchTypeLabel =
    editingRecord?.table === "fin_assets_entries" ? "Asset Entry" : "Entry";

  const typeSelectName =
    launchType === "fin_entries"
      ? FINANCE_SELECT_NAMES.entryTypes
      : FINANCE_SELECT_NAMES.assetEntryTypes;

  const typeOptions =
    launchType === "fin_entries"
      ? selectData.entryTypes
      : selectData.assetEntryTypes;
  const isAppBusy =
    createFinanceRecordMutation.isPending ||
    createAssetMutation.isPending ||
    createOptionMutation.isPending ||
    deleteOptionMutation.isPending ||
    deleteAssetMutation.isPending ||
    updateFinanceRecordMutation.isPending;

  useEffect(() => {
    if (isEditingRef.current) {
      return;
    }

    setValue("type", "");
  }, [launchType, setValue]);

  useEffect(() => {
    if (!editingRecord) {
      return;
    }

    if (editingRecord.table === "fin_entries") {
      const bankOption = selectData.banks.find(
        (option) => option.id === editingRecord.bankId
      );
      const typeOption = selectData.entryTypes.find(
        (option) => option.id === editingRecord.typeId
      );
      const categoryOption = selectData.entryCategories.find(
        (option) => option.id === editingRecord.categoryId
      );

      reset({
        amount: editingRecord.value / 100,
        asset: "",
        bank: bankOption?.value ?? "",
        category: categoryOption?.value ?? "",
        date: editingRecord.date.slice(0, 10),
        description: editingRecord.description,
        launchType: "fin_entries",
        type: typeOption?.value ?? "",
      });
    } else {
      const bankOption = selectData.banks.find(
        (option) => option.id === editingRecord.bankId
      );
      const typeOption = selectData.assetEntryTypes.find(
        (option) => option.id === editingRecord.typeId
      );
      const assetOption = assetData.find(
        (asset) => asset.id === editingRecord.assetId
      );

      reset({
        amount: editingRecord.value / 100,
        asset: assetOption?.value ?? "",
        bank: bankOption?.value ?? "",
        category: "",
        date: editingRecord.date.slice(0, 10),
        description: editingRecord.description,
        launchType: "fin_asset_entries",
        type: typeOption?.value ?? "",
      });
    }

    setIsAddItemOpen(true);
  }, [assetData, editingRecord, reset, selectData]);

  function handleCreateSelectOption(selectName: FinanceSelectName) {
    return async (option: SelectOption) => {
      const createdOption = await createOptionMutation.mutateAsync({
        selectName,
        label: option.label,
      });

      return createdOption;
    };
  }

  function handleDeleteSelectOption(selectName: FinanceSelectName) {
    return async (option: FinanceSelectOption) => {
      try {
        const preview = await previewFinanceSelectOptionDeletionRequest({
          selectName,
          optionId: option.id,
        });

        setDeleteDialogState({
          mode: "confirm",
          option,
          preview,
          selectName,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nao foi possivel excluir a opcao.";

        setDeleteDialogState({
          mode: "error",
          title: "Nao foi possivel excluir",
          message,
        });
      }

      return false;
    };
  }

  async function handleConfirmDeleteOption() {
    try {
      if (deleteDialogState?.mode === "confirm") {
        await deleteOptionMutation.mutateAsync({
          selectName: deleteDialogState.selectName,
          optionId: deleteDialogState.option.id,
        });
      }

      if (deleteDialogState?.mode === "asset-confirm") {
        await deleteAssetMutation.mutateAsync({
          assetId: deleteDialogState.asset.id,
        });
      }

      setDeleteDialogState(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel excluir a opcao.";

      setDeleteDialogState({
        mode: "error",
        title: "Nao foi possivel excluir",
        message,
      });
    }
  }

  async function handleCreateAsset(input: {
    assetName: string;
    assetType: string;
    ticker: string;
  }) {
    const selectedType = selectData.assetTypes.find(
      (option) => option.value === input.assetType
    );

    if (!selectedType) {
      throw new Error("Selecione um tipo de ativo.");
    }

    return createAssetMutation.mutateAsync({
      name: input.assetName,
      ticker: input.ticker,
      typeId: selectedType.id,
    });
  }

  function handleDeleteAsset() {
    return async (asset: FinanceAssetOption) => {
      try {
        const preview = await previewFinanceAssetDeletionRequest({
          assetId: asset.id,
        });

        setDeleteDialogState({
          asset,
          mode: "asset-confirm",
          preview,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nao foi possivel excluir o ativo.";

        setDeleteDialogState({
          mode: "error",
          title: "Nao foi possivel excluir",
          message,
        });
      }

      return false;
    };
  }

  async function onSubmit(data: FinanceFormData) {
    try {
      if (
        editingRecord &&
        data.launchType !==
          (editingRecord.table === "fin_entries"
            ? "fin_entries"
            : "fin_asset_entries")
      ) {
        throw new Error("Nao e possivel alterar o tipo de lancamento ao editar.");
      }

      const bankOption = selectData.banks.find((option) => option.value === data.bank);
      const typeOption = typeOptions.find((option) => option.value === data.type);

      if (!bankOption) {
        throw new Error("Selecione um banco valido.");
      }

      if (!typeOption) {
        throw new Error("Selecione um tipo valido.");
      }

      const value = Math.round(data.amount * 100);
      const description = data.description?.trim() ?? "";
      let savedRecord: FinanceChangedRecord | null = null;

      if (data.launchType === "fin_entries") {
        const categoryOption = selectData.entryCategories.find(
          (option) => option.value === data.category
        );

        if (!categoryOption) {
          throw new Error("Selecione uma categoria valida.");
        }

        if (editingRecord?.table === "fin_entries") {
          const updatedRecord = await updateFinanceRecordMutation.mutateAsync({
            bankId: bankOption.id,
            categoryId: categoryOption.id,
            date: data.date,
            description,
            id: editingRecord.id,
            table: "fin_entries",
            typeId: typeOption.id,
            value,
          });
          savedRecord = {
            id: updatedRecord.id,
            table: "fin_entries",
          };
        } else {
          const createdRecord = await createFinanceRecordMutation.mutateAsync({
            bankId: bankOption.id,
            categoryId: categoryOption.id,
            date: data.date,
            description,
            table: "fin_entries",
            typeId: typeOption.id,
            value,
          });
          savedRecord = {
            id: createdRecord.id,
            table: "fin_entries",
          };
        }
      } else {
        const assetOption = assetData.find((asset) => asset.value === data.asset);

        if (!assetOption) {
          throw new Error("Selecione um ativo valido.");
        }

        if (editingRecord?.table === "fin_assets_entries") {
          const updatedRecord = await updateFinanceRecordMutation.mutateAsync({
            assetId: assetOption.id,
            bankId: bankOption.id,
            date: data.date,
            description,
            id: editingRecord.id,
            table: "fin_assets_entries",
            typeId: typeOption.id,
            value,
          });
          savedRecord = {
            id: updatedRecord.id,
            table: "fin_assets_entries",
          };
        } else {
          const createdRecord = await createFinanceRecordMutation.mutateAsync({
            assetId: assetOption.id,
            bankId: bankOption.id,
            date: data.date,
            description,
            table: "fin_assets_entries",
            typeId: typeOption.id,
            value,
          });
          savedRecord = {
            id: createdRecord.id,
            table: "fin_assets_entries",
          };
        }
      }

      if (savedRecord) {
        onRecordSaved(savedRecord);
      }

      reset({
        launchType: data.launchType,
        date: "",
        amount: 0,
        description: "",
        bank: "",
        type: "",
        category: "",
        asset: "",
      });
      setIsAddItemOpen(false);
      onEditingChange(null);

      if (!editingRecord) {
        setSuccessDialogState({
          isOpen: true,
          launchType: data.launchType,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel salvar o lancamento.";

      setDeleteDialogState({
        mode: "error",
        title: "Nao foi possivel salvar",
        message,
      });
    }
  }

  return (
    <>
      <Modal
        open={isAddItemOpen}
        onOpenChange={(nextIsOpen) => {
          setIsAddItemOpen(nextIsOpen);

          if (!nextIsOpen) {
            onEditingChange(null);
          }
        }}
        isLocked={isAppBusy}
        triggerContent={<div className="btn btn-sm">{title}</div>}
        modalTitle={
          <div className="flex items-center gap-2">
            {editingRecord ? <span>Editar lancamento</span> : title}
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <fieldset disabled={isAppBusy} className="space-y-5">
            <Field label="Tipo de lancamento">
              {isEditing ? (
                <>
                  <input type="hidden" {...register("launchType")} />
                  <input
                    className="input input-bordered w-full"
                    readOnly
                    value={editingLaunchTypeLabel}
                  />
                </>
              ) : (
                <select
                  className="select select-bordered w-full"
                  {...register("launchType")}
                >
                  <option value="fin_entries">Entry</option>
                  <option value="fin_asset_entries">Asset Entry</option>
                </select>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Data" error={errors.date?.message}>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <FinanceDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>

              <Field label="Valor" error={errors.amount?.message}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full"
                  placeholder="Ex: 129.90"
                  {...register("amount", {
                    valueAsNumber: true,
                  })}
                />
              </Field>
            </div>

            <Field label="Descricao">
              <textarea
                className="textarea textarea-bordered min-h-16 w-full"
                placeholder="Descreva o lancamento..."
                {...register("description")}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="bank"
                render={({ field }) => (
                  <CreateOptionSelect
                    label="Banco"
                    value={field.value}
                    options={selectData.banks}
                    onChange={field.onChange}
                    onCreate={handleCreateSelectOption(FINANCE_SELECT_NAMES.banks)}
                    onDeleteOption={handleDeleteSelectOption(
                      FINANCE_SELECT_NAMES.banks
                    )}
                    placeholder="Selecionar banco"
                  />
                )}
              />

              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <CreateOptionSelect
                    label="Tipo"
                    value={field.value}
                    options={typeOptions}
                    onChange={field.onChange}
                    onCreate={handleCreateSelectOption(typeSelectName)}
                    onDeleteOption={handleDeleteSelectOption(typeSelectName)}
                    placeholder="Selecionar tipo"
                  />
                )}
              />
            </div>

            {launchType === "fin_entries" ? (
              <FinanceEntryFields
                control={control}
                categoryOptions={selectData.entryCategories}
                onCreateCategory={handleCreateSelectOption(
                  FINANCE_SELECT_NAMES.entryCategories
                )}
                onDeleteCategory={handleDeleteSelectOption(
                  FINANCE_SELECT_NAMES.entryCategories
                )}
              />
            ) : (
              <FinanceAssetFields
                control={control}
                assetOptions={assetData}
                assetTypeOptions={selectData.assetTypes}
                onCreateAsset={handleCreateAsset}
                onCreateAssetType={handleCreateSelectOption(
                  FINANCE_SELECT_NAMES.assetTypes
                )}
                onDeleteAsset={handleDeleteAsset()}
                onDeleteAssetType={handleDeleteSelectOption(
                  FINANCE_SELECT_NAMES.assetTypes
                )}
              />
            )}

            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={isAppBusy}>
                {createFinanceRecordMutation.isPending || updateFinanceRecordMutation.isPending
                  ? "Salvando..."
                  : editingRecord
                    ? "Salvar alteracoes"
                    : "Salvar lancamento"}
              </button>
            </div>
          </fieldset>
        </form>

        <ConfirmDialog
          isOpen={
            deleteDialogState?.mode === "confirm" ||
          deleteDialogState?.mode === "asset-confirm"
          }
          title={
            deleteDialogState?.mode === "asset-confirm"
              ? "Excluir ativo"
              : "Excluir opcao"
          }
          confirmLabel="Excluir"
          confirmVariant="danger"
          isSubmitting={deleteOptionMutation.isPending || deleteAssetMutation.isPending}
          onClose={() => setDeleteDialogState(null)}
          onConfirm={() => void handleConfirmDeleteOption()}
        >
          {deleteDialogState?.mode === "confirm" && (
            <div className="space-y-3">
              <p>
                Tem certeza que deseja excluir{" "}
                <span className="font-semibold">
                  "{deleteDialogState.preview.optionLabel}"
                </span>
                ?
              </p>
              <p className="text-base-content/70 text-sm">
                Essa acao remove a opcao do select para novos lancamentos.
              </p>
            </div>
          )}
          {deleteDialogState?.mode === "asset-confirm" && (
            <div className="space-y-3">
              <p>
                Tem certeza que deseja excluir o ativo{" "}
                <span className="font-semibold">
                  "{deleteDialogState.preview.optionLabel}"
                </span>
                ?
              </p>
              <p className="text-base-content/70 text-sm">
                Essa acao remove o ativo da sua lista para novos lancamentos.
              </p>
            </div>
          )}
        </ConfirmDialog>

        <ConfirmDialog
          isOpen={deleteDialogState?.mode === "error"}
          title={deleteDialogState?.mode === "error" ? deleteDialogState.title : ""}
          confirmLabel="Fechar"
          cancelLabel={null}
          onClose={() => setDeleteDialogState(null)}
          onConfirm={() => setDeleteDialogState(null)}
        >
          {deleteDialogState?.mode === "error" && (
            <p className="text-base-content/80">{deleteDialogState.message}</p>
          )}
        </ConfirmDialog>
      </Modal>

      <ConfirmDialog
        isOpen={successDialogState.isOpen}
        title="Lancamento salvo"
        confirmLabel="Sim"
        cancelLabel="Nao"
        onClose={() =>
          setSuccessDialogState({
            isOpen: false,
            launchType: null,
          })
        }
        onConfirm={() => {
          reset({
            launchType: successDialogState.launchType ?? "fin_entries",
            date: "",
            amount: 0,
            description: "",
            bank: "",
            type: "",
            category: "",
            asset: "",
          });
          setSuccessDialogState({
            isOpen: false,
            launchType: null,
          });
          setIsAddItemOpen(true);
        }}
      >
        <div className="space-y-3">
          <p className="font-medium">Parabens, seu lancamento foi salvo.</p>
          <p className="text-base-content/70 text-sm">
            Deseja fazer outro lancamento?
          </p>
        </div>
      </ConfirmDialog>

      {isAppBusy &&
        createPortal(
          <div
            className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/35 backdrop-blur-[1px]"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="bg-base-100 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl">
              <Loader2 size={18} className="animate-spin" />
              <span className="font-medium">Salvando, aguarde...</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
