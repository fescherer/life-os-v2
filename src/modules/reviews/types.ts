export const REVIEW_STATUSES = [
  "Planning",
  "On Going",
  "Completed",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type Review = {
  review_date: string;
  finished_date: string;
  status: ReviewStatus;
  type: string;
  title: string;
  cover_image?: string;
  review: string;
  review_stars: number;
};
