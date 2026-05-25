"use client";

import { createReview } from "@/app/reviews/actions";
import { ReviewFormFields } from "@/components/review-form-fields";
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

type ReviewCreateDialogProps = {
  selectOptions: SelectOption[];
};

export function ReviewCreateDialog({ selectOptions }: ReviewCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      try {
        await createReview(formData);
        setIsOpen(false);
        toast.success("Review added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add review.",
        );
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New review</DialogTitle>
          <DialogDescription>
            Add a review for a movie, anime, series, book, game, or any media.
          </DialogDescription>
        </DialogHeader>
        <form action={handleAction} className="grid gap-6">
          <ReviewFormFields selectOptions={selectOptions} />
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
