/* eslint-disable react/no-multi-comp, tailwindcss/no-custom-classname */
"use client";

import {
  deleteFinanceEntry,
  duplicateFinanceEntry,
  updateFinanceEntry,
} from "@/modules/finance/actions";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { FinanceEntryFields } from "@/modules/finance/components/finance-entry-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FinanceEntry } from "@/modules/finance/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type FinanceRowActionsProps = {
  entry: RowWithId<FinanceEntry>;
  selectOptions: SelectOption[];
};

type ConfirmationAction = "save" | "duplicate" | "delete";

const FINANCE_ROW_EDIT_EVENT = "finance-row-edit";

export function openFinanceRowEdit(entryId: string) {
  window.dispatchEvent(
    new CustomEvent<{ entryId: string }>(FINANCE_ROW_EDIT_EVENT, {
      detail: { entryId },
    }),
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const diffInSeconds = Math.round(
    (new Date(value).getTime() - Date.now()) / 1000,
  );

  const formatter = new Intl.RelativeTimeFormat("pt-BR", {
    numeric: "auto",
    style: "short",
  });

  const units = [
    { limit: 60, seconds: 1, unit: "second" },
    { limit: 60 * 60, seconds: 60, unit: "minute" },
    { limit: 60 * 60 * 24, seconds: 60 * 60, unit: "hour" },
    { limit: 60 * 60 * 24 * 30, seconds: 60 * 60 * 24, unit: "day" },
    { limit: 60 * 60 * 24 * 365, seconds: 60 * 60 * 24 * 30, unit: "month" },
    { limit: Infinity, seconds: 60 * 60 * 24 * 365, unit: "year" },
  ] as const;
  const unit =
    units.find(({ limit }) => Math.abs(diffInSeconds) < limit) ?? units[0];
  const valueInUnit = Math.round(diffInSeconds / unit.seconds);

  return formatter.format(valueInUnit, unit.unit);
}

function TimestampLabel({ label, value }: { label: string; value: string }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const fullDate = formatDateTime(value);

  return (
    <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="focus-visible:ring-ring/50 w-full rounded-md text-left outline-none focus-visible:ring-[3px]"
          onClick={() => setIsTooltipOpen((current) => !current)}
        >
          {label}: {formatRelativeTime(value)}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">
        {fullDate}
      </TooltipContent>
    </Tooltip>
  );
}

function TimestampLabels({ entry }: { entry: RowWithId<FinanceEntry> }) {
  return (
    <TooltipProvider>
      <DropdownMenuLabel
        className="space-y-1 opacity-70"
        onClick={(event) => event.preventDefault()}
        onKeyDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <TimestampLabel label="Atualizado" value={entry.updated_at} />
        <TimestampLabel label="Criado" value={entry.created_at} />
      </DropdownMenuLabel>
    </TooltipProvider>
  );
}

function FinanceRowActionsContent({
  entry,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  entry: RowWithId<FinanceEntry>;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Ações</DropdownMenuLabel>
      <DropdownMenuItem onSelect={onEdit}>
        <Pencil />
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onDuplicate}>
        <Copy />
        Duplicar
      </DropdownMenuItem>
      <DropdownMenuItem
        variant="destructive"
        onSelect={onDelete}
      >
        <Trash2 />
        Excluir
      </DropdownMenuItem>
      <TimestampLabels entry={entry} />
    </DropdownMenuContent>
  );
}

function FinanceRowActionsMenu({
  entry,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  entry: RowWithId<FinanceEntry>;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="ml-auto flex">
          <span className="sr-only">Open row actions</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <FinanceRowActionsContent
        entry={entry}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </DropdownMenu>
  );
}

export function FinanceRowActions({
  entry,
  selectOptions,
}: FinanceRowActionsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditReady, setIsEditReady] = useState(true);
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction | null>(null);

  useEffect(() => {
    function handleEditEvent(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      if (event.detail?.entryId === entry.id) {
        setIsEditOpen(true);
      }
    }

    window.addEventListener(FINANCE_ROW_EDIT_EVENT, handleEditEvent);

    return () => {
      window.removeEventListener(FINANCE_ROW_EDIT_EVENT, handleEditEvent);
    };
  }, [entry.id]);

  async function submit(formData: FormData) {
    await updateFinanceEntry(formData);
    setIsEditOpen(false);
  }

  function confirmSave() {
    if (!formRef.current?.reportValidity()) {
      return;
    }

    setConfirmationAction("save");
  }

  async function confirmAction() {
    if (confirmationAction === "save") {
      formRef.current?.requestSubmit();
      return;
    }

    if (confirmationAction === "duplicate") {
      await duplicateFinanceEntry(entry.id);
      return;
    }

    if (confirmationAction === "delete") {
      await deleteFinanceEntry(entry.id);
    }
  }

  const confirmation =
    confirmationAction === "save"
      ? {
        title: "Salvar alterações?",
        description: "Confirme que deseja atualizar este lançamento financeiro.",
        confirmText: "Salvar",
        variant: "default" as const,
      }
      : confirmationAction === "duplicate"
        ? {
          title: "Duplicar lançamento?",
          description: "Confirme que deseja criar uma cópia desta linha.",
          confirmText: "Duplicar",
          variant: "default" as const,
        }
        : {
          title: "Excluir lançamento?",
          description: "Esta ação excluirá este lançamento financeiro permanentemente.",
          confirmText: "Excluir",
          variant: "destructive" as const,
        };

  return (
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <FinanceRowActionsMenu
        entry={entry}
        onEdit={() => setIsEditOpen(true)}
        onDuplicate={() => setConfirmationAction("duplicate")}
        onDelete={() => setConfirmationAction("delete")}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar lançamento financeiro</DialogTitle>
          <DialogDescription>
            Atualize os detalhes salvos desta linha.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={submit} className="grid gap-4">
          <input type="hidden" name="id" value={entry.id} />

          <FinanceEntryFields
            selectOptions={selectOptions}
            defaultEntry={entry}
            onReadyChange={setIsEditReady}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={confirmSave} disabled={!isEditReady}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ConfirmationDialog
        open={confirmationAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmationAction(null);
          }
        }}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText="Cancelar"
        variant={confirmation.variant}
        onConfirm={confirmAction}
      />
    </Dialog>
  );
}
