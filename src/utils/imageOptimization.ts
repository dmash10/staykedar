
export const getOptimizedImageUrl = (
    url: string,
    options: {
        width?: number;
        height?: number;
        format?: 'webp' | 'avif' | 'jpg';
        quality?: number;
    }
) => {
    if (!url) return '';

    // For Unsplash images
    if (url.includes('unsplash.com')) {
        const params = new URLSearchParams();

        if (options.width) params.set('w', options.width.toString());
        if (options.height) params.set('h', options.height.toString());

        // Modern image optimization params
        params.set('auto', 'format');
        params.set('fm', options.format || 'webp');
        params.set('q', (options.quality || 80).toString());
        params.set('fit', 'crop');

        return `${url.split('?')[0]}?${params.toString()}`;
    }

    return url;
};

export const getImageSrcSet = (url: string, widths: number[], format: 'webp' | 'avif' | 'jpg' = 'webp') => {
    if (!url) return '';
    return widths
        .map(w => `${getOptimizedImageUrl(url, { width: w, format })} ${w}w`)
        .join(', ');
};
