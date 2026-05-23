"use client";

import {
  deleteCoin,
  updateCoin,
  updateCoinOwned,
} from "@/app/coin-collection/actions";
import { CoinFormFields } from "@/components/coin-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Coin } from "@/types/coin";
import { RowWithId } from "@/types/table";
import { ExternalLink, ImageIcon, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

type CoinCardProps = {
  coin: RowWithId<Coin>;
};

function getNumistaUrl(numistaId: string) {
  const normalizedId = numistaId.match(/\d+/)?.[0] ?? numistaId;

  return `https://en.numista.com/catalogue/pieces${encodeURIComponent(normalizedId)}.html`;
}

export function CoinCard({ coin }: CoinCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOwnedChange(isOwned: boolean) {
    startTransition(async () => {
      try {
        await updateCoinOwned(coin.id, isOwned);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update coin.",
        );
      }
    });
  }

  function handleUpdate(formData: FormData) {
    formData.set("id", coin.id);
    startTransition(async () => {
      try {
        await updateCoin(formData);
        setIsEditOpen(false);
        toast.success("Coin updated.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update coin.",
        );
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCoin(coin.id);
        toast.success("Coin deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete coin.",
        );
      }
    });
  }

  return (
    <article
      className={cn(
        "group grid overflow-hidden rounded-md border text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        coin.isOwned
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "relative flex aspect-[5/4] items-center justify-center overflow-hidden",
          coin.isOwned
            ? "bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.18),_rgba(236,253,245,0.78)_58%,_rgba(255,255,255,0.35))]"
            : "bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.22),_rgba(248,250,252,0.9)_60%,_rgba(255,255,255,0.6))]",
        )}
      >
        <div className="absolute inset-x-6 bottom-7 h-4 rounded-full bg-black/10 blur-md" />
        <div className="bg-background relative grid size-36 place-items-center overflow-hidden rounded-full border border-white/80 shadow-lg ring-8 ring-white/45">
          {coin.imageUrl ? (
            <img
              src={coin.imageUrl}
              alt={coin.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="text-muted-foreground size-10" />
          )}
        </div>
        <span
          className={cn(
            "absolute top-3 left-3 rounded-md px-2 py-1 text-xs font-medium",
            coin.isOwned
              ? "bg-emerald-600 text-white"
              : "bg-background/90 text-muted-foreground",
          )}
        >
          {coin.isOwned ? "Collected" : "Missing"}
        </span>
      </div>

      <div className="grid gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{coin.name}</h2>
            <p className="text-muted-foreground text-sm">
              {coin.year} - {coin.family}
            </p>
          </div>
          <label className="border-border bg-background/70 flex items-center gap-2 rounded-md border px-2 py-1 text-sm font-medium">
            <input
              type="checkbox"
              checked={coin.isOwned}
              disabled={isPending}
              onChange={(event) => handleOwnedChange(event.target.checked)}
              className="border-input size-4 rounded border"
            />
            Own
          </label>
        </div>

        <div className="grid gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Material</span>
            <p className="font-medium">{coin.material}</p>
          </div>
          {coin.description ? (
            <p className="text-muted-foreground bg-background/55 line-clamp-2 rounded-md p-2">
              {coin.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <span className="bg-background/80 text-foreground rounded-md px-2 py-1 text-xs font-medium">
              {coin.isCommemorative ? "Commemorative" : "Ordinary"}
            </span>
            <span className="bg-background/80 text-foreground rounded-md px-2 py-1 text-xs font-medium">
              {coin.family}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {coin.numistaId ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={getNumistaUrl(coin.numistaId)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-4" />
                Numista
              </Link>
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-1">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit coin</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit coin</DialogTitle>
                  <DialogDescription>
                    Update this coin without changing the rest of your catalogue.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-6">
                  <CoinFormFields coin={coin} />
                  <DialogFooter showCloseButton>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Saving..." : "Save changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete coin</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
