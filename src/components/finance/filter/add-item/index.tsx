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

function resolveEntryTypeId(options: FinanceSelectOption[], valueInCents: number) {
  const isIncome = valueInCents > 0;
  const targetPattern = isIncome
    ? /(income|entrada|receita|ganho|credito)/i
    : /(expense|saida|despesa|gasto|debito)/i;

  const directValueMatch = options.find(
    (option) => option.value.toLowerCase() === (isIncome ? "income" : "expense")
  );

  if (directValueMatch) {
    return directValueMatch.id;
  }

  const semanticMatch = options.find((option) =>
    targetPattern.test(`${option.value} ${option.label}`)
  );

  if (semanticMatch) {
    return semanticMatch.id;
  }

  if (options.length === 1) {
    return options[0].id;
  }

  throw new Error(
    "Nao foi possivel inferir o tipo de lancamento. Configure os tipos de Entry para Income/Expense."
  );
}

function formatCentsInput(valueInCents: number) {
  const isNegative = valueInCents < 0;
  const absoluteCents = Math.abs(valueInCents);
  const integerPart = Math.floor(absoluteCents / 100);
  const decimalPart = String(absoluteCents % 100).padStart(2, "0");

  return `${isNegative ? "-" : ""}${integerPart},${decimalPart}`;
}

function parseMaskedCurrencyToCents(inputValue: string) {
  const isNegative = inputValue.includes("-");
  const digits = inputValue.replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  const cents = Number.parseInt(digits, 10);

  if (!Number.isFinite(cents)) {
    return 0;
  }

  return isNegative ? -cents : cents;
}

const formSchema = z
  .object({
    launchType: z.enum(["fin_entries", "fin_asset_entries"]),
    date: z.string().min(1, "Informe a data"),
    amount: z.number().int().refine((value) => Number.isFinite(value) && value !== 0, {
      message: "Informe um valor diferente de zero",
    }),
    description: z.string().optional(),
    bank: z.string().min(1, "Selecione um banco"),
    type: z.string().optional(),
    category: z.string().optional(),
    asset: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.launchType === "fin_asset_entries" && !data.type?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione um tipo",
        path: ["type"],
      });
    }
  });

export type FinanceFormData = z.infer<typeof formSchema>;
export type Option = SelectOption;

const EMPTY_FINANCE_FORM: FinanceFormData = {
  launchType: "fin_entries",
  date: "",
  amount: 0,
  description: "",
  bank: "",
  type: "",
  category: "",
  asset: "",
};

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
    replacementValue: string;
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
  replacementOptionId?: number;
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
    defaultValues: EMPTY_FINANCE_FORM,
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
    onSuccess: async (_, variables) => {
      const key = getFinanceSelectKeyByName(variables.selectName);
      let replacementOption: FinanceSelectOption | undefined;

      queryClient.setQueryData<FinanceSelectsData>(
        ["finance-selects"],
        (current) => {
          const base = current ?? initialSelects;
          replacementOption = base[key].find(
            (option) => option.id === variables.replacementOptionId
          );

          return {
            ...base,
            [key]: base[key].filter((option) => option.id !== variables.optionId),
          };
        }
      );

      if (replacementOption) {
        replaceDeletedFormValue({
          replacementValue: replacementOption.value,
          selectName: variables.selectName,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["finances"],
      });
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
  const assetEntryTypeOptions = selectData.assetEntryTypes;
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
      const categoryOption = selectData.entryCategories.find(
        (option) => option.id === editingRecord.categoryId
      );

      reset({
        amount: editingRecord.value,
        asset: "",
        bank: bankOption?.value ?? "",
        category: categoryOption?.value ?? "",
        date: editingRecord.date.slice(0, 10),
        description: editingRecord.description,
        launchType: "fin_entries",
        type: "",
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
        amount: editingRecord.value,
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
          replacementValue: "",
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
        const replacementOption = selectData[
          getFinanceSelectKeyByName(deleteDialogState.selectName)
        ].find(
          (option) => option.value === deleteDialogState.replacementValue
        );

        if (
          deleteDialogState.preview.replacementRequired &&
          !replacementOption
        ) {
          throw new Error("Escolha uma opcao para substituir antes de excluir.");
        }

        await deleteOptionMutation.mutateAsync({
          selectName: deleteDialogState.selectName,
          optionId: deleteDialogState.option.id,
          replacementOptionId: replacementOption?.id,
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

  function replaceDeletedFormValue(input: {
    replacementValue: string;
    selectName: FinanceSelectName;
  }) {
    if (input.selectName === FINANCE_SELECT_NAMES.banks) {
      setValue("bank", input.replacementValue);
      return;
    }

    if (input.selectName === FINANCE_SELECT_NAMES.entryCategories) {
      setValue("category", input.replacementValue);
      return;
    }

    if (
      input.selectName === FINANCE_SELECT_NAMES.assetEntryTypes
    ) {
      setValue("type", input.replacementValue);
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

      if (!bankOption) {
        throw new Error("Selecione um banco valido.");
      }

      const value = data.amount;
      const description = data.description?.trim() ?? "";
      let savedRecord: FinanceChangedRecord | null = null;

      if (data.launchType === "fin_entries") {
        const categoryOption = selectData.entryCategories.find(
          (option) => option.value === data.category
        );

        if (!categoryOption) {
          throw new Error("Selecione uma categoria valida.");
        }

        const inferredTypeId = resolveEntryTypeId(selectData.entryTypes, value);

        if (editingRecord?.table === "fin_entries") {
          const updatedRecord = await updateFinanceRecordMutation.mutateAsync({
            bankId: bankOption.id,
            categoryId: categoryOption.id,
            date: data.date,
            description,
            id: editingRecord.id,
            table: "fin_entries",
            typeId: inferredTypeId,
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
            typeId: inferredTypeId,
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

        const typeOption = assetEntryTypeOptions.find(
          (option) => option.value === data.type
        );

        if (!typeOption) {
          throw new Error("Selecione um tipo valido.");
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
        ...EMPTY_FINANCE_FORM,
        launchType: data.launchType,
        type: data.launchType === "fin_asset_entries" ? data.type ?? "" : "",
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

          if (!editingRecord) {
            reset(EMPTY_FINANCE_FORM);
          }

          if (!nextIsOpen) {
            onEditingChange(null);
          }
        }}
        isLocked={isAppBusy}
        triggerContent={<div className="btn btn-sm">{title}</div>}
        modalTitle={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {editingRecord ? <span>Editar lancamento</span> : title}
            </div>

            <div className="tabs tabs-boxed bg-base-200/40 p-1">
              <button
                type="button"
                className={`tab px-3 text-xs ${launchType === "fin_entries" ? "tab-active" : ""}`}
                onClick={() => setValue("launchType", "fin_entries")}
                disabled={isEditing || isAppBusy}
              >
                Entry
              </button>
              <button
                type="button"
                className={`tab px-3 text-xs ${launchType === "fin_asset_entries" ? "tab-active" : ""}`}
                onClick={() => setValue("launchType", "fin_asset_entries")}
                disabled={isEditing || isAppBusy}
              >
                Asset Entry
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <fieldset disabled={isAppBusy} className="space-y-5">
            <input type="hidden" {...register("launchType")} />

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
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input input-bordered w-full"
                      placeholder="Ex: 129,90 ou -129,90"
                      value={formatCentsInput(field.value ?? 0)}
                      onChange={(event) => {
                        field.onChange(parseMaskedCurrencyToCents(event.target.value));
                      }}
                      onFocus={(event) => event.target.select()}
                    />
                  )}
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

            <div
              className={
                launchType === "fin_asset_entries"
                  ? "grid gap-4 md:grid-cols-2"
                  : "grid gap-4"
              }
            >
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

              {launchType === "fin_asset_entries" && (
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <CreateOptionSelect
                      label="Tipo"
                      value={field.value || ""}
                      options={assetEntryTypeOptions}
                      onChange={field.onChange}
                      onCreate={handleCreateSelectOption(
                        FINANCE_SELECT_NAMES.assetEntryTypes
                      )}
                      onDeleteOption={handleDeleteSelectOption(
                        FINANCE_SELECT_NAMES.assetEntryTypes
                      )}
                      placeholder="Selecionar tipo"
                    />
                  )}
                />
              )}
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
          confirmDisabled={
            deleteDialogState?.mode === "confirm" &&
            deleteDialogState.preview.replacementRequired &&
            !deleteDialogState.replacementValue
          }
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
                  &quot;{deleteDialogState.preview.optionLabel}&quot;
                </span>
                ?
              </p>
              <p className="text-base-content/70 text-sm">
                Essa acao remove a opcao do select para novos lancamentos.
              </p>
              {deleteDialogState.preview.replacementRequired && (
                <Field label="Substituir por">
                  <select
                    className="select select-bordered w-full"
                    value={deleteDialogState.replacementValue}
                    onChange={(event) =>
                      setDeleteDialogState({
                        ...deleteDialogState,
                        replacementValue: event.target.value,
                      })
                    }
                  >
                    <option value="">Selecione uma opcao</option>
                    {selectData[
                      getFinanceSelectKeyByName(deleteDialogState.selectName)
                    ]
                      .filter((option) => option.id !== deleteDialogState.option.id)
                      .map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </Field>
              )}
              {deleteDialogState.preview.replacementRequired && (
                <p className="text-base-content/70 text-sm">
                  Ela esta sendo usada em {deleteDialogState.preview.usageCount}{" "}
                  registro(s). Os registros existentes serao atualizados para a
                  opcao escolhida.
                </p>
              )}
            </div>
          )}
          {deleteDialogState?.mode === "asset-confirm" && (
            <div className="space-y-3">
              <p>
                Tem certeza que deseja excluir o ativo{" "}
                <span className="font-semibold">
                  &quot;{deleteDialogState.preview.optionLabel}&quot;
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
            ...EMPTY_FINANCE_FORM,
            launchType: successDialogState.launchType ?? "fin_entries",
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
