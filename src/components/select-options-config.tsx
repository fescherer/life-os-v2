"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSelectOption,
  deleteSelectOption,
} from "@/app/settings/actions";
import { SELECTS } from "@/lib/selects";
import { SelectOption } from "@/types/select-option";
import { Plus, Trash2, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

type SelectIdentifier = (typeof SELECTS)[number]["identifier"];

type SelectOptionsConfigProps = {
  options: SelectOption[];
};

export function SelectOptionsConfig({ options }: SelectOptionsConfigProps) {
  const [selectedIdentifier, setSelectedIdentifier] = useState<SelectIdentifier>(
    SELECTS[0].identifier,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const selectedSelect = SELECTS.find(
    (select) => select.identifier === selectedIdentifier,
  ) ?? SELECTS[0];

  const visibleOptions = useMemo(
    () =>
      options.filter(
        (option) => option.select_identifier === selectedSelect.identifier,
      ),
    [options, selectedSelect.identifier],
  );

  async function addOption(formData: FormData) {
    await createSelectOption(formData);
    setIsOpen(false);
  }

  function removeOption(id: number) {
    const formData = new FormData();

    formData.set("id", String(id));
    startDeleteTransition(async () => {
      await deleteSelectOption(formData);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="border-border border-r pr-4">
        <div className="flex flex-col gap-1">
          {SELECTS.map((select) => (
            <button
              key={select.identifier}
              onClick={() => setSelectedIdentifier(select.identifier)}
              className={`rounded-md px-3 py-2 text-left text-sm ${
                selectedIdentifier === select.identifier
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {select.label}
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{selectedSelect.label}</h2>
            <p className="text-muted-foreground text-sm">
              Options for {selectedSelect.identifier}
            </p>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="size-4" />
            Add option
          </Button>
        </div>

        <div className="border-border mt-4 overflow-hidden rounded-md border">
          {visibleOptions.length ? (
            visibleOptions.map((option) => (
              <div
                key={`${option.select_identifier}-${option.id}`}
                className="border-border flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="border-border size-4 rounded-full border"
                    style={{ backgroundColor: option.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {option.value}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {option.color}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isDeleting}
                  onClick={() => removeOption(option.id)}
                >
                  <span className="sr-only">Remove option</span>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">
              No options yet.
            </div>
          )}
        </div>

        {isOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <form
              action={addOption}
              className="border-border bg-background w-full max-w-sm rounded-md border p-4 shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold">Add option</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="hidden"
                  name="select_identifier"
                  value={selectedSelect.identifier}
                />
                <label className="block text-sm font-medium">
                  Name
                  <Input name="value" className="mt-1" autoFocus />
                </label>
                <label className="block text-sm font-medium">
                  Color
                  <Input
                    name="color"
                    type="color"
                    defaultValue="#71717a"
                    className="mt-1"
                  />
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </div>
        ) : null}
      </section>
    </div>
  );
}
