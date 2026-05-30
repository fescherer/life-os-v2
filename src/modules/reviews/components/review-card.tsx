"use client";

import { deleteReview, updateReview } from "@/modules/reviews/actions";
import { ReviewFormFields } from "@/modules/reviews/components/review-form-fields";
import { Button } from "@/components/ui/button";
import { DelayedCachedBackgroundImage } from "@/components/delayed-cached-background-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Review } from "@/modules/reviews/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import {
  CalendarCheck2,
  CalendarDays,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
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

function getReviewStatus(review: RowWithId<Review>) {
  return review.status ?? "Planning";
}

function getStarFill(stars: number, index: number) {
  const valueOutOfFive = stars / 4;

  return Math.min(Math.max(valueOutOfFive - index, 0), 1) * 100;
}

function renderRatingStars(stars: number) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => {
        const fill = getStarFill(stars, index);

        return (
          <span key={index} className="text-muted-foreground/55 relative size-4">
            <Star className="size-4" />
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fill}%` }}
            >
              <Star className="size-4 fill-current" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function ReviewCard({ review, selectOptions }: ReviewCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const typeOption = selectOptions.find(
    (option) =>
      option.select_identifier === "review_type" && option.value === review.type,
  );
  const status = getReviewStatus(review);

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
        setIsDetailsOpen(false);
        toast.success("Review deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete review.",
        );
      }
    });
  }

  return (
    <article className="group border-border bg-card text-card-foreground overflow-hidden rounded-md border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsDetailsOpen(true)}
        className="bg-muted relative block aspect-[2/3] w-full overflow-hidden text-left"
        aria-label={`Open details for ${review.title}`}
      >
        {review.cover_image ? (
          <DelayedCachedBackgroundImage
            src={review.cover_image}
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="bg-secondary absolute inset-0 grid place-items-center">
            <span className="text-muted-foreground px-6 text-center text-sm font-medium">
              No cover image
            </span>
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
        <span className="absolute inset-x-0 bottom-0 grid gap-3 p-4 text-white">
          <span className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-full border border-white/50"
              style={{ backgroundColor: typeOption?.color ?? "#71717a" }}
            />
            <span className="line-clamp-2 text-lg leading-tight font-semibold">
              {review.title}
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-semibold ring-1 ring-white/20">
              {status}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {formatRating(review.review_stars)}/10
              </span>
              {renderRatingStars(review.review_stars)}
            </span>
          </span>
        </span>
      </button>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-3xl">
          <div className="grid gap-5">
            <div className="bg-muted relative aspect-[16/9] overflow-hidden rounded-md">
              {review.cover_image ? (
                <DelayedCachedBackgroundImage
                  src={review.cover_image}
                  className="absolute inset-0 bg-cover bg-center"
                />
              ) : (
                <div className="text-muted-foreground grid h-full place-items-center">
                  No cover image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 grid gap-3 p-5 text-white">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full border border-white/50"
                    style={{ backgroundColor: typeOption?.color ?? "#71717a" }}
                  />
                  <span className="text-sm font-semibold uppercase">
                    {review.type}
                  </span>
                  <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-semibold">
                    {status}
                  </span>
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl leading-tight text-white">
                    {review.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Full review information for {review.title}.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {formatRating(review.review_stars)}/10
                </span>
                {renderRatingStars(review.review_stars)}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsEditOpen(true);
                }}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            </div>

            <p
              className={cn(
                "text-muted-foreground text-sm leading-6",
                review.review ? "" : "italic",
              )}
            >
              {review.review || "No written review yet."}
            </p>

            <div className="border-border bg-secondary/50 grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary grid size-8 place-items-center rounded-md text-xs font-semibold">
                  St
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="truncate font-medium">{status}</p>
                </div>
              </div>
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
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit review</DialogTitle>
            <DialogDescription>
              Update this review or remove it from your collection.
            </DialogDescription>
          </DialogHeader>
          <form action={handleUpdate} className="grid gap-6">
            <ReviewFormFields review={review} selectOptions={selectOptions} />
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
    </article>
  );
}
