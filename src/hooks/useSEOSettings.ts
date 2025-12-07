import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SEOSettings {
    site_title: string;
    site_description: string;
    site_keywords: string;
    site_logo: string;
    site_favicon: string;
    og_image: string;
    og_site_name: string;
    og_locale: string;
    twitter_handle: string;
    twitter_card_type: string;
    google_analytics_id: string;
    google_search_console_verification: string;
    bing_verification: string;
    canonical_base_url: string;
    org_name: string;
    org_phone: string;
    org_email: string;
    org_address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    };
    sitemap_enabled: boolean;
    sitemap_include_blogs: boolean;
    sitemap_include_attractions: boolean;
    sitemap_include_packages: boolean;
}

const DEFAULT_SEO: SEOSettings = {
    site_title: 'StayKedarnath | Book Kedarnath Stays, Helicopter & Yatra Packages',
    site_description: 'Official Kedarnath booking partner. Book verified stays, helicopter services from ₹2,500, VIP darshan, and Char Dham Yatra packages. Best prices guaranteed with 24/7 support.',
    site_keywords: 'Kedarnath booking, Kedarnath hotel, Kedarnath helicopter, Char Dham Yatra, Kedarnath Temple',
    site_logo: 'https://staykedarnath.in/logo.png',
    site_favicon: '/favicon.ico',
    og_image: 'https://staykedarnath.in/og-image.png',
    og_site_name: 'StayKedarnath',
    og_locale: 'en_IN',
    twitter_handle: '@staykedarnath',
    twitter_card_type: 'summary_large_image',
    google_analytics_id: '',
    google_search_console_verification: '',
    bing_verification: '',
    canonical_base_url: 'https://staykedarnath.in',
    org_name: 'StayKedarnath',
    org_phone: '+91 9027475942',
    org_email: 'support@staykedarnath.in',
    org_address: {
        streetAddress: 'Kedarnath Road',
        addressLocality: 'Gaurikund',
        addressRegion: 'Uttarakhand',
        postalCode: '246471',
        addressCountry: 'IN'
    },
    sitemap_enabled: true,
    sitemap_include_blogs: true,
    sitemap_include_attractions: true,
    sitemap_include_packages: true
};

export function useSEOSettings() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['seo-settings-public'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('seo_settings')
                .select('*')
                .limit(1)
                .maybeSingle();

            // If table doesn't exist or no data, return defaults
            if (error || !data) {
                return DEFAULT_SEO;
            }

            return {
                ...DEFAULT_SEO,
                ...data,
                org_address: data.org_address || DEFAULT_SEO.org_address
            } as SEOSettings;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: false // Don't retry if table doesn't exist
    });

    return {
        seo: data || DEFAULT_SEO,
        isLoading,
        error
    };
}

// Helper function to generate JSON-LD for Organization
export function generateOrganizationSchema(seo: SEOSettings) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": seo.org_name,
        "alternateName": seo.og_site_name,
        "url": seo.canonical_base_url,
        "logo": seo.og_image,
        "description": seo.site_description,
        "email": seo.org_email,
        "telephone": seo.org_phone,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": seo.org_address.streetAddress,
            "addressLocality": seo.org_address.addressLocality,
            "addressRegion": seo.org_address.addressRegion,
            "postalCode": seo.org_address.postalCode,
            "addressCountry": seo.org_address.addressCountry
        }
    };
}

// Helper function to generate WebSite schema
export function generateWebsiteSchema(seo: SEOSettings) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": seo.og_site_name,
        "url": seo.canonical_base_url,
        "description": seo.site_description,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${seo.canonical_base_url}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };
}
