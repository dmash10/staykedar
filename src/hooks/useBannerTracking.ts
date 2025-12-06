import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Professional Banner Tracking Hook
 * 
 * Handles impression and click tracking for banners with:
 * - Intersection Observer for accurate impression tracking
 * - Session-based deduplication to prevent duplicate impressions
 * - Debouncing for performance
 * - Device detection
 * - Error handling
 * 
 * @returns Object with trackImpression and trackClick functions
 */

interface BannerTrackingOptions {
    bannerId: string;
    bannerTitle?: string;
    position?: string;
}

interface TrackingMetadata {
    pageUrl: string;
    referrer: string;
    userAgent: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    sessionId: string;
    timestamp: string;
}

// Generate or retrieve session ID
function getSessionId(): string {
    let sessionId = sessionStorage.getItem('banner_session_id');

    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('banner_session_id', sessionId);
    }

    return sessionId;
}

// Detect device type based on screen width and user agent
function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();

    if (width < 768 || /mobile|android|iphone/.test(userAgent)) {
        return 'mobile';
    } else if (width < 1024 || /tablet|ipad/.test(userAgent)) {
        return 'tablet';
    }

    return 'desktop';
}

// Get tracking metadata
function getTrackingMetadata(): TrackingMetadata {
    return {
        pageUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        deviceType: getDeviceType(),
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
    };
}

// Check if impression was already tracked for this session
function wasImpressionTracked(bannerId: string): boolean {
    const key = `banner_impression_${bannerId}`;
    return sessionStorage.getItem(key) === 'true';
}

// Mark impression as tracked for this session
function markImpressionTracked(bannerId: string): void {
    const key = `banner_impression_${bannerId}`;
    sessionStorage.setItem(key, 'true');
}

export function useBannerTracking({ bannerId, bannerTitle, position }: BannerTrackingOptions) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const elementRef = useRef<HTMLElement | null>(null);
    const impressionTrackedRef = useRef(false);
    const trackingTimeoutRef = useRef<NodeJS.Timeout>();

    /**
     * Track banner impression
     * Uses session storage to prevent duplicate tracking
     */
    const trackImpression = useCallback(async () => {
        // Prevent duplicate impressions
        if (impressionTrackedRef.current || wasImpressionTracked(bannerId)) {
            return;
        }

        impressionTrackedRef.current = true;
        markImpressionTracked(bannerId);

        try {
            const metadata = getTrackingMetadata();

            // Call Supabase function to record impression
            // @ts-ignore - function may not be in generated types
            const { error } = await supabase.rpc('record_banner_event' as any, {
                p_banner_id: bannerId,
                p_event_type: 'impression',
                p_page_url: metadata.pageUrl,
                p_session_id: metadata.sessionId,
                p_user_agent: metadata.userAgent,
                p_device_type: metadata.deviceType,
                p_metadata: {
                    bannerTitle,
                    position,
                    referrer: metadata.referrer,
                    timestamp: metadata.timestamp,
                },
            });

            if (error) {
                // Silently fail - tracking is non-critical
                // RLS policies may block anonymous inserts
            }
        } catch (error) {
            // Silently fail - tracking is non-critical
        }
    }, [bannerId, bannerTitle, position]);

    /**
     * Track banner click
     */
    const trackClick = useCallback(async (additionalMetadata?: Record<string, any>) => {
        try {
            const metadata = getTrackingMetadata();

            // @ts-ignore - function may not be in generated types
            const { error } = await supabase.rpc('record_banner_event' as any, {
                p_banner_id: bannerId,
                p_event_type: 'click',
                p_page_url: metadata.pageUrl,
                p_session_id: metadata.sessionId,
                p_user_agent: metadata.userAgent,
                p_device_type: metadata.deviceType,
                p_metadata: {
                    bannerTitle,
                    position,
                    referrer: metadata.referrer,
                    timestamp: metadata.timestamp,
                    ...additionalMetadata,
                },
            });

            if (error) {
                // Silently fail - tracking is non-critical
            }
        } catch (error) {
            // Silently fail - tracking is non-critical
        }
    }, [bannerId, bannerTitle, position]);

    /**
     * Set up Intersection Observer for impression tracking
     * Tracks when banner is 50% visible for at least 1 second
     */
    const setupObserver = useCallback((element: HTMLElement) => {
        if (!element || impressionTrackedRef.current || wasImpressionTracked(bannerId)) {
            return;
        }

        // Clean up existing observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        elementRef.current = element;

        // Create Intersection Observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        // Banner is at least 50% visible, start countdown
                        trackingTimeoutRef.current = setTimeout(() => {
                            trackImpression();
                        }, 1000); // Track after 1 second of visibility
                    } else {
                        // Banner is no longer sufficiently visible, cancel countdown
                        if (trackingTimeoutRef.current) {
                            clearTimeout(trackingTimeoutRef.current);
                        }
                    }
                });
            },
            {
                threshold: [0, 0.5, 1], // Track visibility at 0%, 50%, and 100%
                rootMargin: '0px',
            }
        );

        observerRef.current.observe(element);
    }, [bannerId, trackImpression]);

    /**
     * Clean up observer on unmount
     */
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (trackingTimeoutRef.current) {
                clearTimeout(trackingTimeoutRef.current);
            }
        };
    }, []);

    return {
        /**
         * Ref to attach to the banner element for automatic impression tracking
         */
        ref: setupObserver,

        /**
         * Manually track impression (use if not using ref)
         */
        trackImpression,

        /**
         * Track click event
         */
        trackClick,
    };
}
