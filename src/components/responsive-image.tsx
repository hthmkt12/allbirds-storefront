import React from 'react';
import { getImageSrcSet, CmsMedia } from '../utils/cms-client';

interface ResponsiveImageProps {
  image: CmsMedia | string | null | undefined;
  alt?: string;
  className?: string;
  sizes?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

export function ResponsiveImage({
  image,
  alt = "",
  className,
  sizes = "100vw",
  style,
  priority = false
}: ResponsiveImageProps) {
  if (!image) return null;

  const getStaticOptimizedSrcSet = (srcPath: string, format: 'webp' | 'avif') => {
    if (typeof srcPath !== 'string' || !srcPath.startsWith('/')) return '';
    const filename = srcPath.substring(srcPath.lastIndexOf('/') + 1);
    const dotIndex = filename.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? filename.substring(0, dotIndex) : filename;
    
    const widths = [480, 768, 1024, 1280, 1536, 1920];
    return widths.map(w => `/optimized/${baseName}-${w}w.${format} ${w}w`).join(', ');
  };

  const isStatic = typeof image === 'string';
  const defaultAlt = (typeof image === 'object' && image?.alt) ? image.alt : alt;
  const isAltEmpty = !defaultAlt || defaultAlt.trim().length === 0;

  if (isStatic) {
    const avifSrcSet = getStaticOptimizedSrcSet(image, 'avif');
    const webpSrcSet = getStaticOptimizedSrcSet(image, 'webp');
    const fallbackSrc = image;

    return (
      <picture className={className} style={style}>
        {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
        {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
        <img
          src={fallbackSrc}
          alt={defaultAlt}
          aria-hidden={isAltEmpty ? "true" : undefined}
          loading={priority ? "eager" : undefined}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
        />
      </picture>
    );
  } else {
    // Dynamic CMS media
    const { src: fallbackSrc, srcSet: cmsSrcSet } = getImageSrcSet(image);

    return (
      <picture className={className} style={style}>
        {cmsSrcSet && <source type="image/webp" srcSet={cmsSrcSet} sizes={sizes} />}
        <img
          src={fallbackSrc}
          alt={defaultAlt}
          aria-hidden={isAltEmpty ? "true" : undefined}
          loading={priority ? "eager" : undefined}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
        />
      </picture>
    );
  }
}
