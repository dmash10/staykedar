import React from 'react';
import { getOptimizedImageUrl, getImageSrcSet } from '@/utils/imageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    sizes?: string;
    className?: string;
}

export const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    priority = false,
    sizes = '100vw',
    className,
    ...props
}: OptimizedImageProps) => {
    if (!src) return null;

    const srcSet = getImageSrcSet(src, [320, 640, 960, 1280, 1920]);
    const optimizedSrc = getOptimizedImageUrl(src, { width, height });

    return (
        <img
            src={optimizedSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            // @ts-ignore - fetchPriority is not yet in React types
            fetchpriority={priority ? 'high' : 'auto'}
            className={className}
            {...props}
        />
    );
};
