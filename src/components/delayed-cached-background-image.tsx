"use client";

import { CSSProperties } from "react";

import { useDelayedImageUrl } from "@/components/delayed-cached-image";
import { cn } from "@/lib/utils";

type DelayedCachedBackgroundImageProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
};

export function DelayedCachedBackgroundImage({
  src,
  className,
  style,
}: DelayedCachedBackgroundImageProps) {
  const delayedSrc = useDelayedImageUrl(src);

  return (
    <div
      className={cn(
        "transition-opacity duration-300",
        delayedSrc ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        ...style,
        backgroundImage: delayedSrc
          ? `url(${JSON.stringify(delayedSrc)})`
          : undefined,
      }}
    />
  );
}
