"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_STATUSES, Review, ReviewStatus } from "@/modules/reviews/types";
import { SelectOption } from "@/types/select-option";
import { useMemo, useRef, useState } from "react";

type ReviewFormFieldsProps = {
  review?: Review;
  selectOptions: SelectOption[];
};

function toDateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function ReviewFormFields({
  review,
  selectOptions,
}: ReviewFormFieldsProps) {
  const defaultType = review?.type;
  const types = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "review_type",
      ),
    [selectOptions],
  );
  const typeItems = useMemo(() => {
    const configuredTypes = types.map((option) => option.value);

    if (defaultType && !configuredTypes.includes(defaultType)) {
      return [defaultType, ...configuredTypes];
    }

    return configuredTypes;
  }, [defaultType, types]);
  const [type, setType] = useState<string | null>(defaultType ?? null);
  const [status, setStatus] = useState<ReviewStatus>(
    review?.status ?? "Planning",
  );
  const [stars, setStars] = useState(review?.review_stars ?? 0);
  const comboboxPortalContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={comboboxPortalContainerRef} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="title">
          Title
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Perfect Blue"
          defaultValue={review?.title}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="cover_image">
          Cover image
        </label>
        <Input
          id="cover_image"
          name="cover_image"
          type="url"
          placeholder="https://..."
          defaultValue={review?.cover_image}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <span className="text-sm font-medium">Status</span>
          <Select
            name="status"
            value={status}
            onValueChange={(value) => setStatus(value as ReviewStatus)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Type</span>
          <Combobox
            name="type"
            items={typeItems}
            value={type}
            onValueChange={setType}
            itemToStringLabel={(value) =>
              types.find((option) => option.value === value)?.value ?? value
            }
            required
          >
            <ComboboxInput
              className="w-full"
              placeholder="Select type"
              showClear
            />
            <ComboboxContent portalContainer={comboboxPortalContainerRef}>
              <ComboboxEmpty>No type found.</ComboboxEmpty>
              <ComboboxList>
                {(value: string) => {
                  const option = types.find(
                    (typeOption) => typeOption.value === value,
                  );

                  return (
                    <ComboboxItem key={value} value={value}>
                      {option ? (
                        <span
                          className="border-border size-3 rounded-full border"
                          style={{ backgroundColor: option.color }}
                        />
                      ) : null}
                      {option?.value ?? value}
                    </ComboboxItem>
                  );
                }}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="review_stars">
            Rating ({(stars / 2).toFixed(1)})
          </label>
          <Input
            id="review_stars"
            name="review_stars"
            type="number"
            min={0}
            max={20}
            step={1}
            value={stars}
            onChange={(event) => setStars(Number(event.target.value))}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="finished_date">
            Finished date
          </label>
          <Input
            id="finished_date"
            name="finished_date"
            type="date"
            defaultValue={toDateInputValue(review?.finished_date)}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="review_date">
            Review date
          </label>
          <Input
            id="review_date"
            name="review_date"
            type="date"
            defaultValue={toDateInputValue(review?.review_date)}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="review">
          Review
        </label>
        <Textarea
          id="review"
          name="review"
          placeholder="Write your thoughts..."
          defaultValue={review?.review}
          className="min-h-32"
        />
      </div>
    </div>
  );
}
