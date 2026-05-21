"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FinanceEntry } from "@/types/finance";
import { SelectOption } from "@/types/select-option";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type FinanceEntryFieldsProps = {
  selectOptions: SelectOption[];
  defaultEntry?: FinanceEntry;
  onReadyChange?: (ready: boolean) => void;
};

function getDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

export function FinanceEntryFields({
  selectOptions,
  defaultEntry,
  onReadyChange,
}: FinanceEntryFieldsProps) {
  const banks = useMemo(
    () =>
      selectOptions.filter((option) => option.select_identifier === "bank"),
    [selectOptions],
  );
  const entryTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "entry_type",
      ),
    [selectOptions],
  );
  const defaultDate = getDate(defaultEntry?.date);
  const defaultBank = defaultEntry?.bank ? String(defaultEntry.bank) : null;
  const defaultType = defaultEntry?.type ? String(defaultEntry.type) : null;
  const bankItems = useMemo(
    () => banks.map((option) => String(option.id)),
    [banks],
  );
  const entryTypeItems = useMemo(
    () => entryTypes.map((option) => String(option.id)),
    [entryTypes],
  );
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [bank, setBank] = useState<string | null>(defaultBank);
  const [type, setType] = useState<string | null>(defaultType);
  const comboboxPortalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onReadyChange?.(!!date && !!bank && !!type);
  }, [bank, date, onReadyChange, type]);

  return (
    <div ref={comboboxPortalContainerRef} className="grid gap-3">
      <div className="block text-sm font-medium">
        <span>Date</span>
        <input
          name="date"
          type="hidden"
          value={date ? format(date, "yyyy-MM-dd") : ""}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              data-empty={!date}
              className={cn(
                "mt-1 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="block text-sm font-medium">
        <span>Description</span>
        <Input
          name="description"
          defaultValue={defaultEntry?.description}
          className="mt-1"
          required
        />
      </div>

      <div className="block text-sm font-medium">
        <span>Amount</span>
        <Input
          name="amount"
          type="number"
          step="0.01"
          defaultValue={defaultEntry?.amount}
          className="mt-1"
          required
        />
      </div>

      <div className="block text-sm font-medium">
        <span>Bank</span>
        <Combobox
          name="bank"
          items={bankItems}
          value={bank}
          onValueChange={setBank}
          itemToStringLabel={(value) =>
            banks.find((option) => String(option.id) === value)?.value ?? ""
          }
          required
        >
          <ComboboxInput
            className="mt-1 w-full"
            placeholder="Select bank"
            showClear
          />
          <ComboboxContent portalContainer={comboboxPortalContainerRef}>
            <ComboboxEmpty>No bank found.</ComboboxEmpty>
            <ComboboxList>
              {(value: string) => {
                const option = banks.find(
                  (bankOption) => String(bankOption.id) === value,
                );

                if (!option) {
                  return null;
                }

                return (
                  <ComboboxItem key={option.id} value={value}>
                    <span
                      className="border-border size-3 rounded-full border"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.value}
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="block text-sm font-medium">
        <span>Type</span>
        <Combobox
          name="type"
          items={entryTypeItems}
          value={type}
          onValueChange={setType}
          itemToStringLabel={(value) =>
            entryTypes.find((option) => String(option.id) === value)?.value ?? ""
          }
          required
        >
          <ComboboxInput
            className="mt-1 w-full"
            placeholder="Select type"
            showClear
          />
          <ComboboxContent portalContainer={comboboxPortalContainerRef}>
            <ComboboxEmpty>No type found.</ComboboxEmpty>
            <ComboboxList>
              {(value: string) => {
                const option = entryTypes.find(
                  (entryType) => String(entryType.id) === value,
                );

                if (!option) {
                  return null;
                }

                return (
                  <ComboboxItem key={option.id} value={value}>
                    <span
                      className="border-border size-3 rounded-full border"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.value}
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
