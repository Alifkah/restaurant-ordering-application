"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface MenuImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export default function MenuImage({
  src,
  alt,
  fallbackSrc = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
  className,
  width,
  height,
  fill,
  sizes,
  priority,
  ...props
}: MenuImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    src ? getOptimizedImageUrl(src) : fallbackSrc
  );
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt || "Menu Item"}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      priority={priority}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
      className={className}
      {...props}
    />
  );
}
