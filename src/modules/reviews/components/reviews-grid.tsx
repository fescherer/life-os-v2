"use client";

import { ReviewCard } from "@/modules/reviews/components/review-card";
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
import { REVIEW_STATUSES, Review, ReviewStatus } from "@/modules/reviews/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type ReviewsGridProps = {
  reviews: RowWithId<Review>[];
  selectOptions: SelectOption[];
};

function getSearchText(review: RowWithId<Review>) {
  return [
    review.title,
    review.cover_image,
    review.status ?? "Planning",
    review.type,
    review.review,
    review.review_date,
    review.finished_date,
    String(review.review_stars / 2),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ReviewsGrid({ reviews, selectOptions }: ReviewsGridProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState<"all" | ReviewStatus>("all");
  const reviewTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "review_type",
      ),
    [selectOptions],
  );

  const filteredReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !normalizedQuery || getSearchText(review).includes(normalizedQuery);
      const matchesType = type === "all" || review.type === type;
      const matchesStatus =
        status === "all" || (review.status ?? "Planning") === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reviews, query, status, type]);

  const hasFilters = query || type !== "all" || status !== "all";

  return (
    <section className="grid gap-4">
      <div className="border-border bg-card grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(16rem,1fr)_auto_auto_auto] sm:items-center">
        <label className="relative block">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, type, review, rating..."
            className="pl-9"
          />
        </label>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              <SelectItem value="all">All types</SelectItem>
              {reviewTypes.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as "all" | ReviewStatus)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All status</SelectItem>
              {REVIEW_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
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
            setType("all");
            setStatus("all");
          }}
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>

      {filteredReviews.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              selectOptions={selectOptions}
            />
          ))}
        </div>
      ) : (
        <div className="border-border grid min-h-48 place-items-center rounded-md border border-dashed p-8 text-center">
          <div>
            <h2 className="font-semibold">No reviews found</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Try another search or clear the filters.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
