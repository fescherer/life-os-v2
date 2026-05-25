"use client";

import { deleteReview, updateReview } from "@/app/reviews/actions";
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
import { cn } from "@/lib/utils";
import { Review } from "@/types/review";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { CalendarCheck2, CalendarDays, Pencil, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

type ReviewCardProps = {
  review: RowWithId<Review>;
  selectOptions: SelectOption[];
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRating(stars: number) {
  return (stars / 2).toFixed(1).replace(/\.0$/, "");
}

export function ReviewCard({ review, selectOptions }: ReviewCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const typeOption = selectOptions.find(
    (option) =>
      option.select_identifier === "review_type" && option.value === review.type,
  );

  function handleUpdate(formData: FormData) {
    formData.set("id", review.id);
    startTransition(async () => {
      try {
        await updateReview(formData);
        setIsEditOpen(false);
        toast.success("Review updated.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update review.",
        );
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteReview(review.id);
        setIsEditOpen(false);
        toast.success("Review deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete review.",
        );
      }
    });
  }

  return (
    <article className="group border-border bg-card text-card-foreground grid overflow-hidden rounded-md border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="border-border size-3 shrink-0 rounded-full border"
                style={{ backgroundColor: typeOption?.color ?? "#71717a" }}
              />
              <p className="text-muted-foreground truncate text-xs font-semibold tracking-normal uppercase">
                {review.type}
              </p>
            </div>
            <h2 className="mt-1 line-clamp-2 text-xl leading-tight font-semibold">
              {review.title}
            </h2>
          </div>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Pencil className="size-4" />
                <span className="sr-only">Edit review</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit review</DialogTitle>
                <DialogDescription>
                  Update this review or remove it from your collection.
                </DialogDescription>
              </DialogHeader>
              <form action={handleUpdate} className="grid gap-6">
                <ReviewFormFields
                  review={review}
                  selectOptions={selectOptions}
                />
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
        </div>

        <div className="flex items-center gap-1 text-amber-500">
          <Star className="size-4 fill-current" />
          <span className="text-foreground text-sm font-semibold">
            {formatRating(review.review_stars)}
          </span>
          <span className="text-muted-foreground text-sm">/ 10</span>
        </div>

        <p
          className={cn(
            "text-muted-foreground min-h-16 text-sm leading-6",
            review.review ? "line-clamp-3" : "italic",
          )}
        >
          {review.review || "No written review yet."}
        </p>
      </div>

      <div className="border-border bg-secondary/50 grid gap-2 border-t p-4 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="text-muted-foreground size-4" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Finished</p>
            <p className="truncate font-medium">
              {formatDate(review.finished_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="text-muted-foreground size-4" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Reviewed</p>
            <p className="truncate font-medium">
              {formatDate(review.review_date)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
