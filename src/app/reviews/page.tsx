import { ExportCsvButton } from "@/components/export-csv-button";
import { ReviewCreateDialog } from "@/components/review-create-dialog";
import { ReviewsGrid } from "@/components/reviews-grid";
import { getTableRows } from "@/lib/db-fn/get";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import { Review } from "@/types/review";

export default async function ReviewsPage() {
  const [reviews, selectOptions] = await Promise.all([
    getTableRows<Review>("reviews"),
    getSelectOptions(),
  ]);

  return (
    <main className="grid gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <p className="text-muted-foreground text-sm">
            Review anime, movies, series, and other media.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportCsvButton data={reviews} filename="reviews" />
          <ReviewCreateDialog selectOptions={selectOptions} />
        </div>
      </div>

      {reviews.length > 0 ? (
        <ReviewsGrid reviews={reviews} selectOptions={selectOptions} />
      ) : (
        <section className="border-border grid min-h-64 place-items-center rounded-md border border-dashed p-8 text-center">
          <div>
            <h2 className="font-semibold">No reviews yet</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Add your first review with a title, type, dates, and rating.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
