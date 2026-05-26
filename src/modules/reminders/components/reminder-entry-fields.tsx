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
import {
  REMINDER_FREQUENCIES,
  ReminderEntry,
  ReminderFrequency,
} from "@/modules/reminders/types";
import { SelectOption } from "@/types/select-option";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

const FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  annual: "Annual",
  monthly: "Monthly",
  weekly: "Weekly",
  daily: "Daily",
};

type ReminderEntryFieldsProps = {
  defaultEntry?: ReminderEntry;
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

function ReminderTypeCombobox({
  options,
  portalContainerRef,
  value,
  onValueChange,
}: {
  options: SelectOption[];
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
      <span>Type</span>
      <Combobox
        name="reminder_type"
        items={items}
        value={value}
        onValueChange={onValueChange}
        itemToStringLabel={(itemValue) =>
          options.find((option) => String(option.id) === itemValue)?.value ?? ""
        }
        required
      >
        <ComboboxInput className="mt-1 w-full" placeholder="Select type" showClear />
        <ComboboxContent portalContainer={portalContainerRef}>
          <ComboboxEmpty>No type found.</ComboboxEmpty>
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

function FrequencyCombobox({
  portalContainerRef,
  value,
  onValueChange,
}: {
  portalContainerRef: RefObject<HTMLDivElement | null>;
  value: ReminderFrequency | null;
  onValueChange: (value: ReminderFrequency | null) => void;
}) {
  return (
    <div className="block text-sm font-medium">
      <span>Notification frequency</span>
      <Combobox
        name="notification_frequency"
        items={[...REMINDER_FREQUENCIES]}
        value={value}
        onValueChange={(nextValue) =>
          onValueChange(nextValue as ReminderFrequency | null)
        }
        itemToStringLabel={(itemValue) =>
          FREQUENCY_LABELS[itemValue as ReminderFrequency] ?? ""
        }
        required
      >
        <ComboboxInput
          className="mt-1 w-full"
          placeholder="Select frequency"
          showClear
        />
        <ComboboxContent portalContainer={portalContainerRef}>
          <ComboboxEmpty>No frequency found.</ComboboxEmpty>
          <ComboboxList>
            {(itemValue: ReminderFrequency) => (
              <ComboboxItem key={itemValue} value={itemValue}>
                {FREQUENCY_LABELS[itemValue]}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function ReminderEntryFields({
  defaultEntry,
  onReadyChange,
  selectOptions,
}: ReminderEntryFieldsProps) {
  const reminderTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "reminder_type",
      ),
    [selectOptions],
  );
  const [date, setDate] = useState<Date | undefined>(
    getDate(defaultEntry?.date),
  );
  const [reminderType, setReminderType] = useState<string | null>(
    defaultEntry?.reminder_type ? String(defaultEntry.reminder_type) : null,
  );
  const [frequency, setFrequency] = useState<ReminderFrequency | null>(
    defaultEntry?.notification_frequency ?? null,
  );
  const portalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onReadyChange?.(!!date && !!reminderType && !!frequency);
  }, [date, frequency, onReadyChange, reminderType]);

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

      <label className="block text-sm font-medium">
        Description
        <Input
          name="description"
          defaultValue={defaultEntry?.description}
          className="mt-1"
          required
        />
      </label>

      <ReminderTypeCombobox
        options={reminderTypes}
        portalContainerRef={portalContainerRef}
        value={reminderType}
        onValueChange={setReminderType}
      />

      <FrequencyCombobox
        portalContainerRef={portalContainerRef}
        value={frequency}
        onValueChange={setFrequency}
      />
    </div>
  );
}
