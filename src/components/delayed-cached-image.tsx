/* eslint-disable @next/next/no-img-element */

"use client";

import { ImgHTMLAttributes, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const IMAGE_RENDER_DELAY_MS = 220;

let nextImageRenderAt = 0;

function reserveImageRenderSlot() {
  const now = Date.now();
  const renderAt = Math.max(now, nextImageRenderAt);

  nextImageRenderAt = renderAt + IMAGE_RENDER_DELAY_MS;

  return renderAt - now;
}

function useDelayedImageUrl(src?: string) {
  const [delayedSrc, setDelayedSrc] = useState<string>();

  useEffect(() => {
    if (!src) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDelayedSrc(src);
    }, reserveImageRenderSlot());

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [src]);

  return delayedSrc === src ? delayedSrc : undefined;
}

type DelayedCachedImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src: string;
};

export function DelayedCachedImage({
  src,
  alt,
  className,
  ...props
}: DelayedCachedImageProps) {
  const delayedSrc = useDelayedImageUrl(src);

  return (
    <img
      {...props}
      src={delayedSrc}
      alt={alt}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
      className={cn(
        "transition-opacity duration-300",
        delayedSrc ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}

export { useDelayedImageUrl };
