"use client";

import { CoinCard } from "@/components/coin-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coin } from "@/types/coin";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type CoinCollectionGridProps = {
  coins: RowWithId<Coin>[];
  selectOptions: SelectOption[];
};

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Collected", value: "collected" },
  { label: "Missing", value: "missing" },
] as const;

const typeOptions = [
  { label: "All types", value: "all" },
  { label: "Ordinary", value: "ordinary" },
  { label: "Commemorative", value: "commemorative" },
] as const;

function getSearchText(coin: RowWithId<Coin>) {
  return [
    coin.name,
    coin.family,
    coin.year,
    coin.description,
    coin.material,
    coin.numistaId,
    coin.isCommemorative ? "commemorative" : "ordinary",
    coin.isOwned ? "collected owned" : "missing",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function CoinCollectionGrid({
  coins,
  selectOptions,
}: CoinCollectionGridProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState<(typeof statusOptions)[number]["value"]>("all");
  const [type, setType] =
    useState<(typeof typeOptions)[number]["value"]>("all");

  const filteredCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return coins.filter((coin) => {
      const matchesSearch =
        !normalizedQuery || getSearchText(coin).includes(normalizedQuery);
      const matchesStatus =
        status === "all" ||
        (status === "collected" && coin.isOwned) ||
        (status === "missing" && !coin.isOwned);
      const matchesType =
        type === "all" ||
        (type === "commemorative" && coin.isCommemorative) ||
        (type === "ordinary" && !coin.isCommemorative);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coins, query, status, type]);

  const hasFilters = query || status !== "all" || type !== "all";

  return (
    <section className="grid gap-4">
      <div className="border-border bg-card grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(16rem,1fr)_auto_auto_auto] sm:items-center">
        <label className="relative block">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, family, value, date..."
            className="pl-9"
          />
        </label>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as typeof status)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(value) => setType(value as typeof type)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasFilters}
          onClick={() => {
            setQuery("");
            setStatus("all");
            setType("all");
          }}
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>

      {filteredCoins.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredCoins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              selectOptions={selectOptions}
            />
          ))}
        </div>
      ) : (
        <div className="border-border grid min-h-48 place-items-center rounded-md border border-dashed p-8 text-center">
          <div>
            <h2 className="font-semibold">No coins found</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Try another search or clear the filters.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
