// Types for Smart Stay Concierge
export interface BlindProperty {
    id: string;
    internal_name: string;
    display_name: string;
    location_slug: string;
    category: 'budget' | 'standard' | 'premium';
    base_price: number;
    surge_price: number | null;
    amenities: {
        geyser?: 'gas' | 'solar' | 'electric';
        toilet?: 'western' | 'indian';
        parking?: boolean;
        wifi?: boolean;
        restaurant?: boolean;
        property_type?: 'hotel' | 'resort' | 'homestay' | 'tent';
        rating?: number;
        [key: string]: string | boolean | number | undefined;
    };
    audit_notes: string | null;
    owner_phone: string | null;
    images: string[];
    zone_description: string | null;
    pros: string[];
    cons: string[];
    verification_date: string;
    is_active: boolean;
    created_at: string;
}

export interface StayLead {
    id: string;
    customer_phone: string;
    customer_name: string | null;
    property_id: string | null;
    location_slug: string | null;
    check_in: string | null;
    check_out: string | null;
    guests: number;
    budget_category: string | null;
    is_urgent: boolean;
    status: 'new' | 'ai_calling' | 'contacted' | 'confirmed' | 'paid' | 'cancelled';
    notes: string | null;
    source: string;
    created_at: string;
}

export interface LocationGroup {
    label: string;
    options: { value: string; label: string; isHighDemand?: boolean }[];
}

export const LOCATION_GROUPS: LocationGroup[] = [
    {
        label: 'Base Camps',
        options: [
            { value: 'guptkashi', label: 'Guptkashi' },
            { value: 'phata', label: 'Phata' },
        ]
    },
    {
        label: 'Trek Start Points',
        options: [
            { value: 'sonprayag', label: 'Sonprayag', isHighDemand: true },
            { value: 'gaurikund', label: 'Gaurikund', isHighDemand: true },
        ]
    },
    {
        label: 'High Altitude',
        options: [
            { value: 'kedarnath', label: 'Kedarnath Top', isHighDemand: true },
        ]
    }
];

export const CATEGORY_LABELS: Record<string, string> = {
    budget: 'Budget',
    standard: 'Standard',
    premium: 'Premium'
};
