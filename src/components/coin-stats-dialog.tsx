/* eslint-disable react/no-multi-comp */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Coin } from "@/types/coin";
import { RowWithId } from "@/types/table";
import { BarChart3 } from "lucide-react";

type CoinStatsDialogProps = {
  coins: RowWithId<Coin>[];
};

type StatChartProps = {
  label: string;
  owned: number;
  total: number;
  tone: "green" | "blue" | "amber";
};

const chartTone = {
  green: {
    ring: "text-emerald-600",
    bg: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  blue: {
    ring: "text-sky-600",
    bg: "border-sky-200 bg-sky-50 text-sky-950",
  },
  amber: {
    ring: "text-amber-600",
    bg: "border-amber-200 bg-amber-50 text-amber-950",
  },
};

function getPercent(owned: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((owned / total) * 100);
}

function StatChart({ label, owned, total, tone }: StatChartProps) {
  const percentage = getPercent(owned, total);
  const dash = `${percentage} ${100 - percentage}`;

  return (
    <div className={cn("rounded-md border p-4", chartTone[tone].bg)}>
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0">
          <svg className="size-24 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeWidth="4"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeDasharray={dash}
              strokeLinecap="round"
              strokeWidth="4"
              className={chartTone[tone].ring}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-xl font-semibold">{percentage}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold">{label}</h3>
          <p className="mt-1 text-sm opacity-75">
            {owned} of {total} coins in collection
          </p>
        </div>
      </div>
    </div>
  );
}

export function CoinStatsDialog({ coins }: CoinStatsDialogProps) {
  const ordinaryCoins = coins.filter((coin) => !coin.isCommemorative);
  const commemorativeCoins = coins.filter((coin) => coin.isCommemorative);
  const ownedCoins = coins.filter((coin) => coin.isOwned);
  const ownedOrdinaryCoins = ordinaryCoins.filter((coin) => coin.isOwned);
  const ownedCommemorativeCoins = commemorativeCoins.filter(
    (coin) => coin.isOwned,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BarChart3 className="size-4" />
          Statistics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Coin statistics</DialogTitle>
          <DialogDescription>
            Collection progress by total, ordinary coins, and commemorative coins.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <StatChart
            label="Full collection"
            owned={ownedCoins.length}
            total={coins.length}
            tone="green"
          />
          <StatChart
            label="Ordinary coins"
            owned={ownedOrdinaryCoins.length}
            total={ordinaryCoins.length}
            tone="blue"
          />
          <StatChart
            label="Commemorative coins"
            owned={ownedCommemorativeCoins.length}
            total={commemorativeCoins.length}
            tone="amber"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
