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
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:max-w-3xl sm:p-6">
          <div className="grid gap-5 md:grid-cols-[minmax(180px,260px)_minmax(0,420px)]">
            <aside className="md:self-start">
              <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-md">
                {review.cover_image ? (
                  <DelayedCachedBackgroundImage
                    src={review.cover_image}
                    className="absolute inset-0 bg-cover bg-center"
                  />
                ) : (
                  <div className="text-muted-foreground grid h-full place-items-center px-6 text-center font-medium">
                    No cover image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/35" />
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-black/45 px-2.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full border border-white/40"
                    style={{ backgroundColor: typeOption?.color ?? "#71717a" }}
                  />
                  <span className="truncate">{review.type}</span>
                </div>
                <div className="absolute right-3 bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/45 px-2.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur-sm">
                  <CalendarDays className="size-3.5 shrink-0" />
                  <span className="text-white/70">Reviewed</span>
                  <span className="truncate font-semibold">
                    {formatDate(review.review_date)}
                  </span>
                </div>
              </div>
            </aside>

            <section className="flex min-w-0 flex-col gap-4">
              <DialogHeader className="gap-2 pr-10">
                <div className="flex">
                  <span className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-1 text-xs font-semibold">
                    {status}
                  </span>
                </div>
                <DialogTitle className="text-2xl leading-tight font-semibold">
                  {review.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Full review information for {review.title}.
                </DialogDescription>
              </DialogHeader>

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

              <div className="border-border bg-card/70 min-h-40 rounded-md border p-4">
                <p
                  className={cn(
                    "text-muted-foreground text-sm leading-6 whitespace-pre-wrap",
                    review.review ? "" : "italic",
                  )}
                >
                  {review.review || "No written review yet."}
                </p>
              </div>
            </section>
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
