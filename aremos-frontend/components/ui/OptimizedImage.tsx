"use client"

import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  onClick?: () => void;
  sizes?: string;
}

/**
 * Optimierte Image-Komponente mit Lazy Loading und Fallback
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 80,
  onClick,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false);
  
  // Fallback-Bild bei Ladefehlern
  const fallbackSrc = "/images/placeholder.png";
  
  return (
    <Image
      src={isError ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${isError ? "opacity-60" : ""}`}
      priority={priority}
      quality={quality}
      loading={priority ? "eager" : "lazy"}
      onError={() => setIsError(true)}
      onClick={onClick}
      sizes={sizes}
    />
  );
}