"use client";

/* eslint-disable tailwindcss/no-custom-classname */

import { CoinCard } from "@/components/coin-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coin } from "@/types/coin";
import { RowWithId } from "@/types/table";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type CoinCollectionGridProps = {
  coins: RowWithId<Coin>[];
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

export function CoinCollectionGrid({ coins }: CoinCollectionGridProps) {
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

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as typeof status)
          }
          className="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring h-9 rounded-4xl border px-3 text-sm transition-colors outline-none focus-visible:ring-[3px]"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(event) => setType(event.target.value as typeof type)}
          className="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring h-9 rounded-4xl border px-3 text-sm transition-colors outline-none focus-visible:ring-[3px]"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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
            <CoinCard key={coin.id} coin={coin} />
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
