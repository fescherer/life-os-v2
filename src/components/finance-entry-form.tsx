"use client";

import { createFinanceEntry } from "@/app/finance/actions";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SelectOption } from "@/types/select-option";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useMemo, useState } from "react";

type FinanceEntryFormProps = {
  selectOptions: SelectOption[];
};

export function FinanceEntryForm({ selectOptions }: FinanceEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [bank, setBank] = useState<SelectOption | null>(null);
  const [type, setType] = useState<SelectOption | null>(null);

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
  const canCreate = banks.length > 0 && entryTypes.length > 0;

  async function submit(formData: FormData) {
    await createFinanceEntry(formData);
    setDate(undefined);
    setBank(null);
    setType(null);
    setIsOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canCreate}>
            <Plus className="size-4" />
            New finance entry
          </Button>
        </DialogTrigger>

        {canCreate ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New finance entry</DialogTitle>
              <DialogDescription>
                Add an income, expense, or transfer to your finance tracker.
              </DialogDescription>
            </DialogHeader>

            <form action={submit} className="grid gap-4">
              <div className="grid gap-3">
                <label className="block text-sm font-medium">
                  Date
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
                </label>

                <label className="block text-sm font-medium">
                  Description
                  <Input name="description" className="mt-1" required />
                </label>

                <label className="block text-sm font-medium">
                  Amount
                  <Input
                    name="amount"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    required
                  />
                </label>

                <label className="block text-sm font-medium">
                  Bank
                  <Combobox
                    name="bank"
                    items={banks}
                    value={bank}
                    onValueChange={setBank}
                    itemToStringLabel={(option) => option.value}
                    itemToStringValue={(option) => String(option.id)}
                    required
                  >
                    <ComboboxInput
                      className="mt-1 w-full"
                      placeholder="Select bank"
                      showClear
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No bank found.</ComboboxEmpty>
                      <ComboboxList>
                        {(option: SelectOption) => (
                          <ComboboxItem key={option.id} value={option}>
                            <span
                              className="border-border size-3 rounded-full border"
                              style={{ backgroundColor: option.color }}
                            />
                            {option.value}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </label>

                <label className="block text-sm font-medium">
                  Type
                  <Combobox
                    name="type"
                    items={entryTypes}
                    value={type}
                    onValueChange={setType}
                    itemToStringLabel={(option) => option.value}
                    itemToStringValue={(option) => String(option.id)}
                    required
                  >
                    <ComboboxInput
                      className="mt-1 w-full"
                      placeholder="Select type"
                      showClear
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No type found.</ComboboxEmpty>
                      <ComboboxList>
                        {(option: SelectOption) => (
                          <ComboboxItem key={option.id} value={option}>
                            <span
                              className="border-border size-3 rounded-full border"
                              style={{ backgroundColor: option.color }}
                            />
                            {option.value}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </label>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={!date || !bank || !type}
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>

      {!canCreate ? (
        <p className="text-muted-foreground text-sm">
          Add bank and entry type options in Configuration first.
        </p>
      ) : null}
    </>
  );
}
