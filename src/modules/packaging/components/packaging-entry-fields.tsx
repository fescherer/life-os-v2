"use client";

/* eslint-disable react/no-multi-comp */

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
import { PackagingEntry } from "@/modules/packaging/types";
import { SelectOption } from "@/types/select-option";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

type PackagingEntryFieldsProps = {
  defaultEntry?: PackagingEntry;
  onReadyChange?: (ready: boolean) => void;
  selectOptions: SelectOption[];
};

function getDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00`);
}

function OptionCombobox({
  label,
  name,
  options,
  placeholder,
  portalContainerRef,
  value,
  onValueChange,
}: {
  label: string;
  name: string;
  options: SelectOption[];
  placeholder: string;
  portalContainerRef: RefObject<HTMLDivElement | null>;
  value: string | null;
  onValueChange: (value: string | null) => void;
}) {
  const items = useMemo(
    () => options.map((option) => String(option.id)),
    [options],
  );

  return (
    <div className="block text-sm font-medium">
      <span>{label}</span>
      <Combobox
        name={name}
        items={items}
        value={value}
        onValueChange={onValueChange}
        itemToStringLabel={(itemValue) =>
          options.find((option) => String(option.id) === itemValue)?.value ?? ""
        }
        required
      >
        <ComboboxInput className="mt-1 w-full" placeholder={placeholder} showClear />
        <ComboboxContent portalContainer={portalContainerRef}>
          <ComboboxEmpty>No option found.</ComboboxEmpty>
          <ComboboxList>
            {(itemValue: string) => {
              const option = options.find(
                (selectOption) => String(selectOption.id) === itemValue,
              );

              if (!option) {
                return null;
              }

              return (
                <ComboboxItem key={option.id} value={itemValue}>
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
  );
}

export function PackagingEntryFields({
  defaultEntry,
  onReadyChange,
  selectOptions,
}: PackagingEntryFieldsProps) {
  const stores = useMemo(
    () =>
      selectOptions.filter((option) => option.select_identifier === "store"),
    [selectOptions],
  );
  const deliveryCompanies = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "delivery_company",
      ),
    [selectOptions],
  );
  const [date, setDate] = useState<Date | undefined>(
    getDate(defaultEntry?.date),
  );
  const [store, setStore] = useState<string | null>(
    defaultEntry?.store ? String(defaultEntry.store) : null,
  );
  const [deliveryCompany, setDeliveryCompany] = useState<string | null>(
    defaultEntry?.delivery_company
      ? String(defaultEntry.delivery_company)
      : null,
  );
  const portalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onReadyChange?.(!!date && !!store && !!deliveryCompany);
  }, [date, deliveryCompany, onReadyChange, store]);

  return (
    <div ref={portalContainerRef} className="grid gap-3">
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
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </div>

      <OptionCombobox
        label="Store"
        name="store"
        options={stores}
        placeholder="Select store"
        portalContainerRef={portalContainerRef}
        value={store}
        onValueChange={setStore}
      />

      <label className="block text-sm font-medium">
        Description
        <Input
          name="description"
          defaultValue={defaultEntry?.description}
          className="mt-1"
          required
        />
      </label>

      <OptionCombobox
        label="Delivery company"
        name="delivery_company"
        options={deliveryCompanies}
        placeholder="Select company"
        portalContainerRef={portalContainerRef}
        value={deliveryCompany}
        onValueChange={setDeliveryCompany}
      />

      <label className="block text-sm font-medium">
        Tracking
        <Input
          name="tracking"
          defaultValue={defaultEntry?.tracking}
          className="mt-1"
          placeholder="Code or tracking link"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="has_arrived"
          type="checkbox"
          defaultChecked={defaultEntry?.has_arrived}
          className="border-input size-4 rounded border"
        />
        Has arrived
      </label>
    </div>
  );
}
