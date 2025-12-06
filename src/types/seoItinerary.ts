export interface DayPlan {
    day: number;
    title: string;
    description: string;
    activity: string;
    stay_location: string;
    distance_km?: string;
    travel_time?: string;
}

export interface SEOItinerary {
    id: string;
    slug: string;
    destination_slug: string;
    title: string;
    duration_days: number;
    start_location: string;
    end_location: string;
    overview: string;
    day_wise_plan: DayPlan[];
    inclusions: string[];
    exclusions: string[];
    price_estimate: number;
    meta_title: string;
    meta_description: string;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export const defaultItinerary: Partial<SEOItinerary> = {
    slug: '',
    destination_slug: 'kedarnath',
    title: '',
    duration_days: 3,
    start_location: 'Haridwar',
    end_location: 'Kedarnath',
    overview: '',
    day_wise_plan: [],
    inclusions: ['Accommodation', 'Meals (Breakfast & Dinner)', 'Transport'],
    exclusions: ['Lunch', 'Personal Expenses', 'Pony/Palki Charges'],
    price_estimate: 0,
    is_active: true,
    is_featured: false,
};
