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
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { CheckCircle2, ImageIcon, Info, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

type CoinCardProps = {
  coin: RowWithId<Coin>;
  selectOptions: SelectOption[];
};

function getNumistaUrl(numistaId: string) {
  const normalizedId = numistaId.match(/\d+/)?.[0] ?? numistaId;

  return `https://en.numista.com/catalogue/pieces${encodeURIComponent(normalizedId)}.html`;
}

export function CoinCard({ coin, selectOptions }: CoinCardProps) {
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
        setIsEditOpen(false);
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
        "group grid overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        coin.isOwned ? "border-primary/45" : "border-border",
      )}
    >
      <div className="bg-secondary flex min-h-24 items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm font-medium">
            {coin.year}
          </p>
          <h2 className="truncate text-xl leading-tight font-semibold">
            {coin.name}
          </h2>
          <p className="text-muted-foreground line-clamp-1 text-sm font-medium">
            {coin.description || coin.family}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
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
                  Update this coin or remove it from your catalogue.
                </DialogDescription>
              </DialogHeader>
              <form action={handleUpdate} className="grid gap-6">
                <CoinFormFields coin={coin} selectOptions={selectOptions} />
                <DialogFooter className="gap-2 sm:justify-between" showCloseButton>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4" />
                    {isPending ? "Deleting..." : "Delete"}
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {coin.numistaId ? (
            <Button asChild variant="ghost" size="icon-sm">
              <Link
                href={getNumistaUrl(coin.numistaId)}
                target="_blank"
                rel="noreferrer"
              >
                <Info className="size-4" />
                <span className="sr-only">Open coin on Numista</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 p-3">
        <div
          className={cn(
            "relative grid aspect-[16/9] place-items-center overflow-hidden rounded-sm border bg-muted/35",
            coin.isOwned ? "border-primary/35" : "border-border",
          )}
        >
          {coin.isOwned ? (
            <span className="bg-primary text-primary-foreground absolute top-2 left-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium shadow-sm">
              <CheckCircle2 className="size-3.5" />
              Collected
            </span>
          ) : null}
          {coin.imageUrl ? (
            <img
              src={coin.imageUrl}
              alt={coin.name}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <ImageIcon className="text-muted-foreground size-9" />
          )}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleOwnedChange(!coin.isOwned)}
          className={cn(
            "h-10 rounded-md border px-3 text-sm font-semibold uppercase tracking-normal transition-colors disabled:pointer-events-none disabled:opacity-50",
            coin.isOwned
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/85"
              : "border-border bg-secondary text-secondary-foreground hover:bg-accent",
          )}
        >
          {coin.isOwned ? "Collected" : "Missing"}
        </button>
      </div>
    </article>
  );
}
