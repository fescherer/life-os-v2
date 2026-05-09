"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { FinanceDatePicker } from "@/components/finance/finance-date-picker";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
import {
  CreateOptionSelect,
  type SelectOption,
} from "@/components/create-option-select";
import type { FinanceAssetOption } from "@/queries/finances/assets";
import type {
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
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { createPortal } from "react-dom";

type TransactionType = "expense" | "income" | "transfer";

const TRANSACTION_TYPES: Array<{
  label: string;
  value: TransactionType;
}> = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Transfer", value: "transfer" },
];

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

function findSemanticOption(
  options: FinanceSelectOption[],
  patterns: RegExp[]
) {
  return options.find((option) =>
    patterns.some((pattern) => pattern.test(`${option.value} ${option.label}`))
  );
}

function resolveEntryTypeId(
  options: FinanceSelectOption[],
  transactionType: TransactionType
) {
  const patternsByType: Record<TransactionType, RegExp[]> = {
    expense: [/(^|[\s_-])(expense|saida|despesa|gasto|debito)($|[\s_-])/i],
    income: [/(^|[\s_-])(income|entrada|receita|ganho|credito)($|[\s_-])/i],
    transfer: [/(^|[\s_-])(transfer|transferencia)($|[\s_-])/i],
  };

  const directValueMatch = options.find(
    (option) => option.value.toLowerCase() === transactionType
  );

  if (directValueMatch) {
    return directValueMatch.id;
  }

  const semanticMatch = findSemanticOption(options, patternsByType[transactionType]);

  if (semanticMatch) {
    return semanticMatch.id;
  }

  if (transactionType !== "transfer" && options.length === 1) {
    return options[0].id;
  }

  throw new Error(
    "Nao foi possivel inferir o tipo de lancamento. Configure os tipos de Entry para Expense, Income e Transfer."
  );
}

function getSignedAmount(
  amountInCents: number,
  transactionType: TransactionType
) {
  const absoluteAmount = Math.abs(amountInCents);

  if (transactionType === "expense") return -absoluteAmount;
  return absoluteAmount;
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

function getAmountIndicatorClassName(valueInCents: number) {
  const classNames = [
    "h-3",
    "w-3",
    "rounded-full",
    "border",
    "transition-colors",
  ];

  if (valueInCents > 0) {
    classNames.push("border-success/40", "bg-success/70");
  } else if (valueInCents < 0) {
    classNames.push("border-error/40", "bg-error/70");
  } else {
    classNames.push("border-base-300", "bg-base-100");
  }

  return classNames.join(" ");
}

const formSchema = z
  .object({
    date: z.string().min(1, "Informe a data"),
    amount: z.number().int().refine((value) => Number.isFinite(value) && value !== 0, {
      message: "Informe um valor diferente de zero",
    }),
    description: z.string().optional(),
    bank: z.string().min(1, "Selecione um banco"),
    category: z.string().optional(),
    destinationBank: z.string().optional(),
    transactionType: z.enum(["expense", "income", "transfer"]),
  })
  .superRefine((data, ctx) => {
    if (data.transactionType !== "transfer" && !data.category?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          data.transactionType === "income"
            ? "Selecione o tipo de renda"
            : "Selecione uma categoria",
        path: ["category"],
      });
    }

    if (data.transactionType === "transfer") {
      if (!data.destinationBank?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione o banco de destino",
          path: ["destinationBank"],
        });
      }

      if (data.destinationBank && data.destinationBank === data.bank) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Escolha um banco de destino diferente",
          path: ["destinationBank"],
        });
      }
    }
  });

export type FinanceFormData = z.infer<typeof formSchema>;
export type Option = SelectOption;

const EMPTY_FINANCE_FORM: FinanceFormData = {
  date: "",
  amount: 0,
  description: "",
  bank: "",
  category: "",
  destinationBank: "",
  transactionType: "expense",
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
    transactionType: FinanceFormData["transactionType"];
  }
  | {
    isOpen: false;
    transactionType: FinanceFormData["transactionType"] | null;
  };

async function fetchFinanceSelects(): Promise<FinanceSelectsData> {
  const response = await fetch("/api/finances/selects");

  if (!response.ok) {
    throw new Error("Erro ao carregar selects financeiros.");
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

async function createFinanceRecordRequest(input: {
  bankId: number;
  categoryId: number;
  date: string;
  description: string;
  table: "fin_entries";
  typeId: number;
  value: number;
}): Promise<FinanceEntry> {
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

async function updateFinanceRecordRequest(input: {
  bankId: number;
  categoryId: number;
  date: string;
  description: string;
  id: number;
  table: "fin_entries";
  typeId: number;
  value: number;
}): Promise<FinanceEntry> {
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
    transactionType: null,
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

  const transactionType = useWatch({
    control,
    name: "transactionType",
  });
  const amount = useWatch({
    control,
    name: "amount",
  });
  const amountIndicatorValue = getSignedAmount(amount ?? 0, transactionType);
  const isAppBusy =
    createFinanceRecordMutation.isPending ||
    createOptionMutation.isPending ||
    deleteOptionMutation.isPending ||
    updateFinanceRecordMutation.isPending;

  useEffect(() => {
    if (editingRecord) {
      return;
    }

    setValue("category", "");
    setValue("destinationBank", "");
  }, [editingRecord, setValue, transactionType]);

  useEffect(() => {
    if (!editingRecord) {
      return;
    }

    if (editingRecord.table !== "fin_entries") {
      setDeleteDialogState({
        mode: "error",
        title: "Edicao indisponivel",
        message:
          "Este modal agora salva lancamentos comuns. Movimentacoes de ativo antigas ainda aparecem na tabela, mas nao podem ser editadas por aqui.",
      });
      onEditingChange(null);
      return;
    }

    const bankOption = selectData.banks.find(
      (option) => option.id === editingRecord.bankId
    );
    const categoryOption = selectData.entryCategories.find(
      (option) => option.id === editingRecord.categoryId
    );

    reset({
      amount: Math.abs(editingRecord.value),
      bank: bankOption?.value ?? "",
      category: categoryOption?.value ?? "",
      date: editingRecord.date.slice(0, 10),
      description: editingRecord.description,
      destinationBank: "",
      transactionType: editingRecord.value > 0 ? "income" : "expense",
    });
    setIsAddItemOpen(true);
  }, [editingRecord, onEditingChange, reset, selectData]);

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
  }

  async function ensureSelectOption(
    selectName: FinanceSelectName,
    label: string
  ) {
    const key = getFinanceSelectKeyByName(selectName);
    const currentOptions = queryClient.getQueryData<FinanceSelectsData>([
      "finance-selects",
    ]) ?? selectData;
    const existingOption = findSemanticOption(currentOptions[key], [
      new RegExp(`(^|[\\s_-])${label}($|[\\s_-])`, "i"),
    ]);

    if (existingOption) {
      return existingOption;
    }

    return createOptionMutation.mutateAsync({
      selectName,
      label,
    });
  }

  async function onSubmit(data: FinanceFormData) {
    try {
      if (editingRecord && editingRecord.table !== "fin_entries") {
        throw new Error("Nao e possivel editar movimentacoes de ativo neste modal.");
      }

      if (editingRecord && data.transactionType === "transfer") {
        throw new Error("Transferencias criam dois lancamentos e nao podem ser usadas ao editar um lancamento simples.");
      }

      const bankOption = selectData.banks.find((option) => option.value === data.bank);

      if (!bankOption) {
        throw new Error("Selecione um banco valido.");
      }

      const value = getSignedAmount(data.amount, data.transactionType);
      const description = data.description?.trim() ?? "";
      let savedRecord: FinanceChangedRecord | null = null;

      if (data.transactionType === "transfer") {
        const destinationBankOption = selectData.banks.find(
          (option) => option.value === data.destinationBank
        );

        if (!destinationBankOption) {
          throw new Error("Selecione um banco de destino valido.");
        }

        const transferType = await ensureSelectOption(
          FINANCE_SELECT_NAMES.entryTypes,
          "Transfer"
        );
        const transferCategory = await ensureSelectOption(
          FINANCE_SELECT_NAMES.entryCategories,
          "Transfer"
        );
        const absoluteValue = Math.abs(data.amount);
        const transferDescription = description || "Transfer";

        const outgoingRecord = await createFinanceRecordMutation.mutateAsync({
          bankId: bankOption.id,
          categoryId: transferCategory.id,
          date: data.date,
          description: transferDescription,
          table: "fin_entries",
          typeId: transferType.id,
          value: -absoluteValue,
        });

        await createFinanceRecordMutation.mutateAsync({
          bankId: destinationBankOption.id,
          categoryId: transferCategory.id,
          date: data.date,
          description: transferDescription,
          table: "fin_entries",
          typeId: transferType.id,
          value: absoluteValue,
        });

        savedRecord = {
          id: outgoingRecord.id,
          table: "fin_entries",
        };
      } else {
        const categoryOption = selectData.entryCategories.find(
          (option) => option.value === data.category
        );

        if (!categoryOption) {
          throw new Error("Selecione uma categoria valida.");
        }

        const inferredTypeId = resolveEntryTypeId(
          selectData.entryTypes,
          data.transactionType
        );

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
      }

      if (savedRecord) {
        onRecordSaved(savedRecord);
      }

      reset({
        ...EMPTY_FINANCE_FORM,
        transactionType: data.transactionType,
      });
      setIsAddItemOpen(false);
      onEditingChange(null);

      if (!editingRecord) {
        setSuccessDialogState({
          isOpen: true,
          transactionType: data.transactionType,
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
          <div className="flex items-center gap-2">
            {editingRecord ? <span>Editar lancamento</span> : title}
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <fieldset disabled={isAppBusy} className="space-y-5">
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

              <Field
                label={
                  <span className="flex w-full items-center justify-between gap-3">
                    <span>Valor</span>
                    <span
                      className={getAmountIndicatorClassName(amountIndicatorValue)}
                      aria-hidden="true"
                    />
                  </span>
                }
                error={errors.amount?.message}
              >
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input input-bordered w-full"
                      placeholder="Ex: 129,90"
                      value={formatCentsInput(Math.abs(field.value ?? 0))}
                      onChange={(event) => {
                        field.onChange(
                          Math.abs(parseMaskedCurrencyToCents(event.target.value))
                        );
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

              <Field label="Tipo" error={errors.transactionType?.message}>
                <div className="grid gap-2 sm:grid-cols-3">
                  {TRANSACTION_TYPES.map((option) => (
                    <label
                      key={option.value}
                      className={[
                        "border-base-300 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        transactionType === option.value
                          ? "border-primary bg-primary/10"
                          : "bg-base-100",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        className="h-4 w-4"
                        value={option.value}
                        {...register("transactionType")}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {transactionType === "transfer" ? (
              <Controller
                control={control}
                name="destinationBank"
                render={({ field }) => (
                  <CreateOptionSelect
                    label="Banco de destino"
                    value={field.value || ""}
                    options={selectData.banks}
                    onChange={field.onChange}
                    onCreate={handleCreateSelectOption(FINANCE_SELECT_NAMES.banks)}
                    onDeleteOption={handleDeleteSelectOption(
                      FINANCE_SELECT_NAMES.banks
                    )}
                    placeholder="Selecionar banco de destino"
                  />
                )}
              />
            ) : (
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <CreateOptionSelect
                    label={
                      transactionType === "income"
                        ? "Tipo de renda"
                        : "Categoria"
                    }
                    value={field.value || ""}
                    options={selectData.entryCategories}
                    onChange={field.onChange}
                    onCreate={handleCreateSelectOption(
                      FINANCE_SELECT_NAMES.entryCategories
                    )}
                    onDeleteOption={handleDeleteSelectOption(
                      FINANCE_SELECT_NAMES.entryCategories
                    )}
                    placeholder={
                      transactionType === "income"
                        ? "Selecionar tipo de renda"
                        : "Selecionar categoria"
                    }
                  />
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
          isOpen={deleteDialogState?.mode === "confirm"}
          title="Excluir opcao"
          confirmLabel="Excluir"
          confirmDisabled={
            deleteDialogState?.mode === "confirm" &&
            deleteDialogState.preview.replacementRequired &&
            !deleteDialogState.replacementValue
          }
          confirmVariant="danger"
          isSubmitting={deleteOptionMutation.isPending}
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
            transactionType: null,
          })
        }
        onConfirm={() => {
          reset({
            ...EMPTY_FINANCE_FORM,
            transactionType: successDialogState.transactionType ?? "expense",
          });
          setSuccessDialogState({
            isOpen: false,
            transactionType: null,
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
            className="fixed inset-0 z-1300 flex items-center justify-center bg-black/35 backdrop-blur-[1px]"
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
