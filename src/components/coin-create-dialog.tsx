"use client";

import { createCoin } from "@/app/coin-collection/actions";
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
import { SelectOption } from "@/types/select-option";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

type CoinCreateDialogProps = {
  selectOptions: SelectOption[];
};

export function CoinCreateDialog({ selectOptions }: CoinCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      try {
        await createCoin(formData);
        setIsOpen(false);
        toast.success("Coin added.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not add coin.");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New coin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New coin</DialogTitle>
          <DialogDescription>
            Add a coin with the small set of details you want to track locally.
          </DialogDescription>
        </DialogHeader>
        <form action={handleAction} className="grid gap-6">
          <CoinFormFields selectOptions={selectOptions} />
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save coin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
