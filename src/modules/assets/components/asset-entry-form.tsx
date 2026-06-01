"use client";

/* eslint-disable react/no-multi-comp */

import { createAssetEntry } from "@/modules/assets/actions";
import { Asset, AssetEntry } from "@/modules/assets/types";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type AssetEntryFormProps = {
  assets: RowWithId<Asset>[];
  selectOptions: SelectOption[];
};

function getDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AssetEntryForm({ assets, selectOptions }: AssetEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const entryTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "asset_entry_type",
      ),
    [selectOptions],
  );
  const assetTypes = useMemo(
    () =>
      selectOptions.filter((option) => option.select_identifier === "asset_type"),
    [selectOptions],
  );
  const canCreate =
    assets.length > 0 && entryTypes.length > 0 && assetTypes.length > 0;

  async function submit(formData: FormData) {
    await createAssetEntry(formData);
    setResetKey((current) => current + 1);
    setIsOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canCreate}>
            <Plus className="size-4" />
            Adicionar lancamento
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar lancamento</DialogTitle>
          </DialogHeader>

          <form action={submit} className="grid gap-4">
            <AssetEntryFields
              key={resetKey}
              assets={assets}
              selectOptions={selectOptions}
              onReadyChange={setIsReady}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!isReady}>
                <Plus className="size-4" />
                Adicionar lancamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {!canCreate ? (
        <p className="text-muted-foreground text-sm">
          Add at least one asset and asset entry type first.
        </p>
      ) : null}
    </>
  );
}

export function AssetEntryFields({
  assets,
  selectOptions,
  defaultEntry,
  onReadyChange,
}: {
  assets: RowWithId<Asset>[];
  selectOptions: SelectOption[];
  defaultEntry?: AssetEntry;
  onReadyChange?: (ready: boolean) => void;
}) {
  const entryTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "asset_entry_type",
      ),
    [selectOptions],
  );
  const assetTypes = useMemo(
    () =>
      selectOptions.filter((option) => option.select_identifier === "asset_type"),
    [selectOptions],
  );
  const assetTypesById = useMemo(
    () =>
      new Map(assetTypes.map((option) => [String(option.id), option.value])),
    [assetTypes],
  );
  const entryTypeItems = useMemo(
    () => entryTypes.map((option) => String(option.id)),
    [entryTypes],
  );
  const assetItems = useMemo(
    () => assets.map((asset) => String(asset.id)),
    [assets],
  );
  const [date, setDate] = useState<Date | undefined>(
    getDate(defaultEntry?.date),
  );
  const [type, setType] = useState<string | null>(
    defaultEntry?.type ? String(defaultEntry.type) : null,
  );
  const [assetId, setAssetId] = useState<string | null>(
    defaultEntry?.asset_id ? String(defaultEntry.asset_id) : null,
  );
  const [quantity, setQuantity] = useState(
    String(defaultEntry?.quantity ?? 1),
  );
  const [value, setValue] = useState(
    defaultEntry?.value === undefined ? "" : String(defaultEntry.value),
  );
  const [costs, setCosts] = useState(
    defaultEntry?.costs === undefined ? "" : String(defaultEntry.costs),
  );
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const numericQuantity = Number(quantity);
  const numericValue = Number(value);
  const numericCosts = costs ? Number(costs) : 0;
  const totalValue =
    Number.isFinite(numericQuantity) &&
    Number.isFinite(numericValue) &&
    Number.isFinite(numericCosts)
      ? numericQuantity * numericValue + numericCosts
      : 0;
  const selectedAsset = assets.find((asset) => String(asset.id) === assetId);
  const selectedAssetType = selectedAsset
    ? String(selectedAsset.asset_type)
    : null;
  const isReady =
    !!date &&
    !!type &&
    !!assetId &&
    value !== "" &&
    Number.isFinite(numericQuantity) &&
    numericQuantity > 0 &&
    Number.isFinite(numericValue) &&
    numericValue >= 0 &&
    Number.isFinite(numericCosts) &&
    numericCosts >= 0;

  useEffect(() => {
    onReadyChange?.(isReady);
  }, [isReady, onReadyChange]);

  return (
    <div ref={portalContainerRef} className="grid gap-4">
      <fieldset className="grid gap-2">
        <legend className="sr-only">Tipo de lancamento</legend>
        <div className="bg-input/30 grid rounded-4xl p-1 sm:grid-cols-2">
          {entryTypeItems.map((itemValue) => {
            const option = entryTypes.find(
              (entryType) => String(entryType.id) === itemValue,
            );

            if (!option) {
              return null;
            }

            return (
              <label
                key={option.id}
                className={cn(
                  "text-muted-foreground flex h-10 cursor-pointer items-center justify-center gap-2 rounded-4xl text-sm font-semibold transition-colors",
                  type === itemValue && "bg-background text-foreground shadow-xs",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={itemValue}
                  checked={type === itemValue}
                  onChange={() => setType(itemValue)}
                  className="sr-only"
                  required
                />
                <span
                  className="border-border size-2.5 rounded-full border"
                  style={{ backgroundColor: option.color }}
                />
                {option.value}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block text-sm font-medium">
          <span>Tipo de ativo</span>
          <Combobox
            items={assetTypes.map((option) => String(option.id))}
            value={selectedAssetType}
            onValueChange={(nextAssetType) => {
              const firstAsset = assets.find(
                (asset) => String(asset.asset_type) === nextAssetType,
              );
              setAssetId(firstAsset ? String(firstAsset.id) : null);
            }}
            itemToStringLabel={(itemValue) =>
              assetTypesById.get(itemValue) ?? ""
            }
          >
            <ComboboxInput
              className="mt-1 w-full"
              placeholder="Selecionar"
              showClear
            />
            <ComboboxContent portalContainer={portalContainerRef}>
              <ComboboxEmpty>No asset type found.</ComboboxEmpty>
              <ComboboxList>
                {(itemValue: string) => {
                  const option = assetTypes.find(
                    (assetType) => String(assetType.id) === itemValue,
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

        <div className="block text-sm font-medium">
          <span>Ativo</span>
          <Combobox
            name="asset_id"
            items={assetItems}
            value={assetId}
            onValueChange={setAssetId}
            itemToStringLabel={(itemValue) => {
              const asset = assets.find((item) => String(item.id) === itemValue);
              const assetType = asset
                ? assetTypesById.get(String(asset.asset_type))
                : "";

              return asset ? `${assetType} - ${asset.ticker}` : "";
            }}
            required
          >
            <ComboboxInput
              className="mt-1 w-full"
              placeholder="Selecionar"
              showClear
            />
            <ComboboxContent portalContainer={portalContainerRef}>
              <ComboboxEmpty>No asset found.</ComboboxEmpty>
              <ComboboxList>
                {(itemValue: string) => {
                  const asset = assets.find((item) => String(item.id) === itemValue);

                  if (!asset) {
                    return null;
                  }

                  const assetType = assetTypesById.get(String(asset.asset_type));

                  return (
                    <ComboboxItem key={asset.id} value={itemValue}>
                      <span className="font-medium">
                        {assetType} - {asset.ticker}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {asset.name}
                      </span>
                    </ComboboxItem>
                  );
                }}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block text-sm font-medium">
          <span>Data da transacao</span>
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
                {date ? format(date, "dd/MM/yyyy") : <span>Selecionar</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
        </div>

        <label className="block text-sm font-medium">
          Quantidade
          <Input
            name="quantity"
            type="number"
            step="0.000001"
            min="0.000001"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="mt-1 w-full"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Preco em R$
          <Input
            name="value"
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mt-1"
            required
          />
        </label>

        <label className="block text-sm font-medium">
          <span className="flex items-center justify-between gap-2">
            Outros custos
            <span className="text-muted-foreground text-xs font-normal">
              Opcional
            </span>
          </span>
          <Input
            name="costs"
            type="number"
            step="0.01"
            min="0"
            value={costs}
            onChange={(event) => setCosts(event.target.value)}
            className="mt-1"
            placeholder="0.00"
          />
        </label>
      </div>

      <div className="bg-muted/60 flex items-center justify-between rounded-4xl px-4 py-3 font-semibold">
        <span>Valor total</span>
        <span>{formatCurrency(totalValue)}</span>
      </div>
    </div>
  );
}
