export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            activity_logs: {
                Row: {
                    activity_type: string
                    created_at: string | null
                    description: string | null
                    id: string
                    ip_address: unknown
                    metadata: Json | null
                    page_url: string | null
                    referrer: string | null
                    user_agent: string | null
                    user_email: string | null
                    user_id: string | null
                    user_role: string | null
                }
                Insert: {
                    activity_type: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    ip_address?: unknown
                    metadata?: Json | null
                    page_url?: string | null
                    referrer?: string | null
                    user_agent?: string | null
                    user_email?: string | null
                    user_id?: string | null
                    user_role?: string | null
                }
                Update: {
                    activity_type?: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    ip_address?: unknown
                    metadata?: Json | null
                    page_url?: string | null
                    referrer?: string | null
                    user_agent?: string | null
                    user_email?: string | null
                    user_id?: string | null
                    user_role?: string | null
                }
                Relationships: []
            }
            admin_activity_logs: {
                Row: {
                    action: string
                    admin_id: string
                    created_at: string
                    details: Json | null
                    entity_type: string
                    id: string
                }
                Insert: {
                    action: string
                    admin_id: string
                    created_at?: string
                    details?: Json | null
                    entity_type: string
                    id?: string
                }
                Update: {
                    action?: string
                    admin_id?: string
                    created_at?: string
                    details?: Json | null
                    entity_type?: string
                    id?: string
                }
                Relationships: []
            }
            admin_users: {
                Row: {
                    created_at: string
                    email: string
                    id: string
                    is_active: boolean | null
                    name: string
                    password_hash: string
                    role: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    id?: string
                    is_active?: boolean | null
                    name: string
                    password_hash: string
                    role?: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    password_hash?: string
                    role?: string
                    updated_at?: string
                }
                Relationships: []
            }
            attractions: {
                Row: {
                    altitude: string | null
                    best_time_to_visit: string | null
                    city_slug: string | null
                    content: string | null
                    created_at: string | null
                    description: string | null
                    distance_from_kedarnath: string | null
                    featured: boolean | null
                    gallery: Json | null
                    id: string
                    image_url: string | null
                    location: string | null
                    meta_description: string | null
                    meta_keywords: string | null
                    meta_title: string | null
                    name: string
                    og_image: string | null
                    slug: string
                    title: string | null
                    updated_at: string | null
                }
                Insert: {
                    altitude?: string | null
                    best_time_to_visit?: string | null
                    city_slug?: string | null
                    content?: string | null
                    created_at?: string | null
                    description?: string | null
                    distance_from_kedarnath?: string | null
                    featured?: boolean | null
                    gallery?: Json | null
                    id?: string
                    image_url?: string | null
                    location?: string | null
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    name: string
                    og_image?: string | null
                    slug: string
                    title?: string | null
                    updated_at?: string | null
                }
                Update: {
                    altitude?: string | null
                    best_time_to_visit?: string | null
                    city_slug?: string | null
                    content?: string | null
                    created_at?: string | null
                    description?: string | null
                    distance_from_kedarnath?: string | null
                    featured?: boolean | null
                    gallery?: Json | null
                    id?: string
                    image_url?: string | null
                    location?: string | null
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    name?: string
                    og_image?: string | null
                    slug?: string
                    title?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            banners: {
                Row: {
                    active: boolean | null
                    alt_text: string | null
                    color: string | null
                    created_at: string
                    cta_text: string | null
                    cta_url: string | null
                    description: string | null
                    end_date: string | null
                    id: string
                    image_url: string | null
                    link: string | null
                    priority: number | null
                    start_date: string | null
                    title: string
                    type: string | null
                    updated_at: string
                }
                Insert: {
                    active?: boolean | null
                    alt_text?: string | null
                    color?: string | null
                    created_at?: string
                    cta_text?: string | null
                    cta_url?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    image_url?: string | null
                    link?: string | null
                    priority?: number | null
                    start_date?: string | null
                    title: string
                    type?: string | null
                    updated_at?: string
                }
                Update: {
                    active?: boolean | null
                    alt_text?: string | null
                    color?: string | null
                    created_at?: string
                    cta_text?: string | null
                    cta_url?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    image_url?: string | null
                    link?: string | null
                    priority?: number | null
                    start_date?: string | null
                    title?: string
                    type?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            blog_posts: {
                Row: {
                    author: string | null
                    category: string | null
                    content: string
                    created_at: string | null
                    excerpt: string | null
                    featured_image: string | null
                    id: string
                    is_featured: boolean | null
                    meta_description: string | null
                    meta_keywords: string | null
                    meta_title: string | null
                    published_at: string | null
                    reading_time: number | null
                    slug: string
                    status: string | null
                    tags: string[] | null
                    title: string
                    updated_at: string | null
                    views: number | null
                }
                Insert: {
                    author?: string | null
                    category?: string | null
                    content: string
                    created_at?: string | null
                    excerpt?: string | null
                    featured_image?: string | null
                    id?: string
                    is_featured?: boolean | null
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    published_at?: string | null
                    reading_time?: number | null
                    slug: string
                    status?: string | null
                    tags?: string[] | null
                    title: string
                    updated_at?: string | null
                    views?: number | null
                }
                Update: {
                    author?: string | null
                    category?: string | null
                    content?: string
                    created_at?: string | null
                    excerpt?: string | null
                    featured_image?: string | null
                    id?: string
                    is_featured?: boolean | null
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    published_at?: string | null
                    reading_time?: number | null
                    slug?: string
                    status?: string | null
                    tags?: string[] | null
                    title?: string
                    updated_at?: string | null
                    views?: number | null
                }
                Relationships: []
            }
            bookings: {
                Row: {
                    adults: number
                    advance_paid: number | null
                    booking_date: string
                    booking_source: string | null
                    check_in: string
                    check_out: string
                    children: number | null
                    created_at: string | null
                    customer_email: string | null
                    customer_id: string | null
                    customer_name: string | null
                    customer_phone: string | null
                    id: string
                    notes: string | null
                    package_id: string | null
                    payment_method: string | null
                    payment_status: string | null
                    property_id: string | null
                    room_id: string | null
                    special_requests: string | null
                    status: string | null
                    total_amount: number | null
                    updated_at: string | null
                }
                Insert: {
                    adults: number
                    advance_paid?: number | null
                    booking_date?: string
                    booking_source?: string | null
                    check_in: string
                    check_out: string
                    children?: number | null
                    created_at?: string | null
                    customer_email?: string | null
                    customer_id?: string | null
                    customer_name?: string | null
                    customer_phone?: string | null
                    id?: string
                    notes?: string | null
                    package_id?: string | null
                    payment_method?: string | null
                    payment_status?: string | null
                    property_id?: string | null
                    room_id?: string | null
                    special_requests?: string | null
                    status?: string | null
                    total_amount?: number | null
                    updated_at?: string | null
                }
                Update: {
                    adults?: number
                    advance_paid?: number | null
                    booking_date?: string
                    booking_source?: string | null
                    check_in?: string
                    check_out?: string
                    children?: number | null
                    created_at?: string | null
                    customer_email?: string | null
                    customer_id?: string | null
                    customer_name?: string | null
                    customer_phone?: string | null
                    id?: string
                    notes?: string | null
                    package_id?: string | null
                    payment_method?: string | null
                    payment_status?: string | null
                    property_id?: string | null
                    room_id?: string | null
                    special_requests?: string | null
                    status?: string | null
                    total_amount?: number | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customer_details"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_package_id_fkey"
                        columns: ["package_id"]
                        isOneToOne: false
                        referencedRelation: "packages"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_property_id_fkey"
                        columns: ["property_id"]
                        isOneToOne: false
                        referencedRelation: "properties"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_room_id_fkey"
                        columns: ["room_id"]
                        isOneToOne: false
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                ]
            }
            car_drivers: {
                Row: {
                    available: boolean | null
                    bio: string | null
                    car_model: string
                    car_number: string
                    car_type: string
                    created_at: string
                    driver_name: string
                    experience_years: number | null
                    id: string
                    languages: string[] | null
                    license_number: string | null
                    photo_url: string | null
                    price_per_km: number
                    rating: number | null
                    reviews_count: number | null
                    routes: string[] | null
                    slug: string
                    updated_at: string
                    whatsapp: string
                }
                Insert: {
                    available?: boolean | null
                    bio?: string | null
                    car_model: string
                    car_number: string
                    car_type: string
                    created_at?: string
                    driver_name: string
                    experience_years?: number | null
                    id?: string
                    languages?: string[] | null
                    license_number?: string | null
                    photo_url?: string | null
                    price_per_km: number
                    rating?: number | null
                    reviews_count?: number | null
                    routes?: string[] | null
                    slug: string
                    updated_at?: string
                    whatsapp: string
                }
                Update: {
                    available?: boolean | null
                    bio?: string | null
                    car_model?: string
                    car_number?: string
                    car_type?: string
                    created_at?: string
                    driver_name?: string
                    experience_years?: number | null
                    id?: string
                    languages?: string[] | null
                    license_number?: string | null
                    photo_url?: string | null
                    price_per_km?: number
                    rating?: number | null
                    reviews_count?: number | null
                    routes?: string[] | null
                    slug?: string
                    updated_at?: string
                    whatsapp?: string
                }
                Relationships: []
            }
            customer_details: {
                Row: {
                    avatar_url: string
                    created_at: string
                    email: string
                    firebase_uid: string
                    id: string
                    name: string
                    phone_number: string
                    role: string
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string
                    created_at?: string
                    email: string
                    firebase_uid: string
                    id?: string
                    name?: string
                    phone_number?: string
                    role?: string
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string
                    created_at?: string
                    email?: string
                    firebase_uid?: string
                    id?: string
                    name?: string
                    phone_number?: string
                    role?: string
                    updated_at?: string
                }
                Relationships: []
            }
            faq_items: {
                Row: {
                    answer: string
                    category: string
                    created_at: string
                    display_order: number
                    id: string
                    is_active: boolean
                    question: string
                    updated_at: string
                }
                Insert: {
                    answer: string
                    category: string
                    created_at?: string
                    display_order?: number
                    id?: string
                    is_active?: boolean
                    question: string
                    updated_at?: string
                }
                Update: {
                    answer?: string
                    category?: string
                    created_at?: string
                    display_order?: number
                    id?: string
                    is_active?: boolean
                    question?: string
                    updated_at?: string
                }
                Relationships: []
            }
            help_articles: {
                Row: {
                    category: string
                    content: string
                    created_at: string
                    helpful_count: number
                    id: string
                    is_published: boolean
                    meta_description: string | null
                    not_helpful_count: number
                    order_index: number
                    slug: string
                    title: string
                    updated_at: string
                    views: number
                }
                Insert: {
                    category: string
                    content: string
                    created_at?: string
                    helpful_count?: number
                    id?: string
                    is_published?: boolean
                    meta_description?: string | null
                    not_helpful_count?: number
                    order_index?: number
                    slug: string
                    title: string
                    updated_at?: string
                    views?: number
                }
                Update: {
                    category?: string
                    content?: string
                    created_at?: string
                    helpful_count?: number
                    id?: string
                    is_published?: boolean
                    meta_description?: string | null
                    not_helpful_count?: number
                    order_index?: number
                    slug?: string
                    title?: string
                    updated_at?: string
                    views?: number
                }
                Relationships: []
            }
            itineraries: {
                Row: {
                    created_at: string
                    days: Json
                    description: string | null
                    duration: string
                    featured: boolean | null
                    hero_image: string | null
                    highlights: string[] | null
                    id: string
                    meta_description: string | null
                    meta_keywords: string | null
                    meta_title: string | null
                    og_image: string | null
                    slug: string
                    title: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    days?: Json
                    description?: string | null
                    duration: string
                    featured?: boolean | null
                    hero_image?: string | null
                    highlights?: string[] | null
                    id?: string
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    og_image?: string | null
                    slug: string
                    title: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    days?: Json
                    description?: string | null
                    duration?: string
                    featured?: boolean | null
                    hero_image?: string | null
                    highlights?: string[] | null
                    id?: string
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    og_image?: string | null
                    slug?: string
                    title?: string
                    updated_at?: string
                }
                Relationships: []
            }
            live_status: {
                Row: {
                    category: string
                    created_at: string
                    description: string | null
                    id: string
                    is_active: boolean | null
                    label: string
                    sort_order: number | null
                    source: string | null
                    status: string
                    updated_at: string
                }
                Insert: {
                    category: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    label: string
                    sort_order?: number | null
                    source?: string | null
                    status: string
                    updated_at?: string
                }
                Update: {
                    category?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    label?: string
                    sort_order?: number | null
                    source?: string | null
                    status?: string
                    updated_at?: string
                }
                Relationships: []
            }
            marquee_banners: {
                Row: {
                    active: boolean
                    created_at: string
                    id: string
                    items: Json
                    speed: number
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    created_at?: string
                    id?: string
                    items?: Json
                    speed?: number
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    created_at?: string
                    id?: string
                    items?: Json
                    speed?: number
                    updated_at?: string
                }
                Relationships: []
            }
            packages: {
                Row: {
                    created_at: string | null
                    description: string | null
                    duration: string | null
                    highlights: string[] | null
                    id: string
                    image_url: string | null
                    inclusions: string[] | null
                    is_active: boolean | null
                    is_featured: boolean | null
                    itinerary: Json | null
                    location: string | null
                    name: string
                    price: number
                    slug: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    duration?: string | null
                    highlights?: string[] | null
                    id?: string
                    image_url?: string | null
                    inclusions?: string[] | null
                    is_active?: boolean | null
                    is_featured?: boolean | null
                    itinerary?: Json | null
                    location?: string | null
                    name: string
                    price: number
                    slug: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    duration?: string | null
                    highlights?: string[] | null
                    id?: string
                    image_url?: string | null
                    inclusions?: string[] | null
                    is_active?: boolean | null
                    is_featured?: boolean | null
                    itinerary?: Json | null
                    location?: string | null
                    name?: string
                    price?: number
                    slug?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            properties: {
                Row: {
                    address: string | null
                    amenities: string[] | null
                    check_in_time: string | null
                    check_out_time: string | null
                    city: string | null
                    contact_email: string | null
                    contact_phone: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    images: string[] | null
                    is_active: boolean | null
                    is_verified: boolean | null
                    latitude: number | null
                    location: string | null
                    longitude: number | null
                    name: string
                    owner_id: string | null
                    policies: Json | null
                    property_slug: string | null
                    property_type: string | null
                    rating: number | null
                    reviews_count: number | null
                    status: string | null
                    updated_at: string | null
                }
                Insert: {
                    address?: string | null
                    amenities?: string[] | null
                    check_in_time?: string | null
                    check_out_time?: string | null
                    city?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_active?: boolean | null
                    is_verified?: boolean | null
                    latitude?: number | null
                    location?: string | null
                    longitude?: number | null
                    name: string
                    owner_id?: string | null
                    policies?: Json | null
                    property_slug?: string | null
                    property_type?: string | null
                    rating?: number | null
                    reviews_count?: number | null
                    status?: string | null
                    updated_at?: string | null
                }
                Update: {
                    address?: string | null
                    amenities?: string[] | null
                    check_in_time?: string | null
                    check_out_time?: string | null
                    city?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_active?: boolean | null
                    is_verified?: boolean | null
                    latitude?: number | null
                    location?: string | null
                    longitude?: number | null
                    name?: string
                    owner_id?: string | null
                    policies?: Json | null
                    property_slug?: string | null
                    property_type?: string | null
                    rating?: number | null
                    reviews_count?: number | null
                    status?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "properties_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "customer_details"
                        referencedColumns: ["id"]
                    },
                ]
            }
            promo_codes: {
                Row: {
                    code: string
                    created_at: string
                    current_uses: number
                    discount_type: string
                    discount_value: number
                    id: string
                    is_active: boolean
                    max_uses: number | null
                    min_booking_amount: number | null
                    updated_at: string
                    valid_from: string
                    valid_until: string | null
                }
                Insert: {
                    code: string
                    created_at?: string
                    current_uses?: number
                    discount_type: string
                    discount_value: number
                    id?: string
                    is_active?: boolean
                    max_uses?: number | null
                    min_booking_amount?: number | null
                    updated_at?: string
                    valid_from?: string
                    valid_until?: string | null
                }
                Update: {
                    code?: string
                    created_at?: string
                    current_uses?: number
                    discount_type?: string
                    discount_value?: number
                    id?: string
                    is_active?: boolean
                    max_uses?: number | null
                    min_booking_amount?: number | null
                    updated_at?: string
                    valid_from?: string
                    valid_until?: string | null
                }
                Relationships: []
            }
            room_availability: {
                Row: {
                    available_rooms: number
                    created_at: string | null
                    date: string
                    id: string
                    price_override: number | null
                    room_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    available_rooms?: number
                    created_at?: string | null
                    date: string
                    id?: string
                    price_override?: number | null
                    room_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    available_rooms?: number
                    created_at?: string | null
                    date?: string
                    id?: string
                    price_override?: number | null
                    room_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "room_availability_room_id_fkey"
                        columns: ["room_id"]
                        isOneToOne: false
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                ]
            }
            rooms: {
                Row: {
                    amenities: string[] | null
                    base_price: number
                    bed_type: string | null
                    capacity: number
                    created_at: string | null
                    description: string | null
                    id: string
                    images: string[] | null
                    is_active: boolean | null
                    max_occupancy: number | null
                    name: string
                    property_id: string | null
                    room_count: number | null
                    room_size: number | null
                    updated_at: string | null
                }
                Insert: {
                    amenities?: string[] | null
                    base_price: number
                    bed_type?: string | null
                    capacity?: number
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_active?: boolean | null
                    max_occupancy?: number | null
                    name: string
                    property_id?: string | null
                    room_count?: number | null
                    room_size?: number | null
                    updated_at?: string | null
                }
                Update: {
                    amenities?: string[] | null
                    base_price?: number
                    bed_type?: string | null
                    capacity?: number
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_active?: boolean | null
                    max_occupancy?: number | null
                    name?: string
                    property_id?: string | null
                    room_count?: number | null
                    room_size?: number | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "rooms_property_id_fkey"
                        columns: ["property_id"]
                        isOneToOne: false
                        referencedRelation: "properties"
                        referencedColumns: ["id"]
                    },
                ]
            }
            seo_cities: {
                Row: {
                    attractions_content: string | null
                    content: string | null
                    created_at: string
                    faq: Json | null
                    geography_content: string | null
                    hero_image: string | null
                    id: string
                    language: string
                    latitude: number | null
                    longitude: number | null
                    meta_description: string | null
                    meta_keywords: string | null
                    meta_title: string | null
                    name: string
                    nearby_stations: Json | null
                    og_image: string | null
                    packages_content: string | null
                    quicklinks: Json | null
                    routes_content: string | null
                    schema_data: Json | null
                    short_description: string | null
                    slug: string
                    stays_content: string | null
                    structured_data: Json | null
                    taxi_content: string | null
                    transport_content: string | null
                    updated_at: string
                }
                Insert: {
                    attractions_content?: string | null
                    content?: string | null
                    created_at?: string
                    faq?: Json | null
                    geography_content?: string | null
                    hero_image?: string | null
                    id?: string
                    language?: string
                    latitude?: number | null
                    longitude?: number | null
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    name: string
                    nearby_stations?: Json | null
                    og_image?: string | null
                    packages_content?: string | null
                    quicklinks?: Json | null
                    routes_content?: string | null
                    schema_data?: Json | null
                    short_description?: string | null
                    slug: string
                    stays_content?: string | null
                    structured_data?: Json | null
                    taxi_content?: string | null
                    transport_content?: string | null
                    updated_at?: string
                }
                Update: {
                    attractions_content?: string | null
                    content?: string | null
                    created_at?: string
                    faq?: Json | null
                    geography_content?: string | null
                    hero_image?: string | null
                    id?: string
                    language?: string
                    latitude?: number | null
                    longitude?: number | null
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    name?: string
                    nearby_stations?: Json | null
                    og_image?: string | null
                    packages_content?: string | null
                    quicklinks?: Json | null
                    routes_content?: string | null
                    schema_data?: Json | null
                    short_description?: string | null
                    slug?: string
                    stays_content?: string | null
                    structured_data?: Json | null
                    taxi_content?: string | null
                    transport_content?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            seo_routes: {
                Row: {
                    best_seasons: Json | null
                    content: string | null
                    created_at: string
                    destination_city: string
                    distance_km: number | null
                    duration_hours: number | null
                    faq: Json | null
                    hero_image: string | null
                    highlights: Json | null
                    id: string
                    language: string
                    meta_description: string | null
                    meta_keywords: string | null
                    meta_title: string | null
                    og_image: string | null
                    route_type: string | null
                    schema_data: Json | null
                    short_description: string | null
                    slug: string
                    source_city: string
                    structured_data: Json | null
                    taxi_content: string | null
                    transport_options: Json | null
                    updated_at: string
                }
                Insert: {
                    best_seasons?: Json | null
                    content?: string | null
                    created_at?: string
                    destination_city: string
                    distance_km?: number | null
                    duration_hours?: number | null
                    faq?: Json | null
                    hero_image?: string | null
                    highlights?: Json | null
                    id?: string
                    language?: string
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    og_image?: string | null
                    route_type?: string | null
                    schema_data?: Json | null
                    short_description?: string | null
                    slug: string
                    source_city: string
                    structured_data?: Json | null
                    taxi_content?: string | null
                    transport_options?: Json | null
                    updated_at?: string
                }
                Update: {
                    best_seasons?: Json | null
                    content?: string | null
                    created_at?: string
                    destination_city?: string
                    distance_km?: number | null
                    duration_hours?: number | null
                    faq?: Json | null
                    hero_image?: string | null
                    highlights?: Json | null
                    id?: string
                    language?: string
                    meta_description?: string | null
                    meta_keywords?: string | null
                    meta_title?: string | null
                    og_image?: string | null
                    route_type?: string | null
                    schema_data?: Json | null
                    short_description?: string | null
                    slug?: string
                    source_city?: string
                    structured_data?: Json | null
                    taxi_content?: string | null
                    transport_options?: Json | null
                    updated_at?: string
                }
                Relationships: []
            }
            seo_settings: {
                Row: {
                    bing_verification: string | null
                    canonical_base_url: string | null
                    created_at: string | null
                    google_analytics_id: string | null
                    google_search_console_verification: string | null
                    id: string
                    og_image: string | null
                    og_locale: string | null
                    og_site_name: string | null
                    org_address: Json | null
                    org_email: string | null
                    org_name: string | null
                    org_phone: string | null
                    page_key: string
                    site_description: string | null
                    site_favicon: string | null
                    site_keywords: string | null
                    site_logo: string | null
                    site_title: string | null
                    sitemap_enabled: boolean | null
                    sitemap_include_attractions: boolean | null
                    sitemap_include_blogs: boolean | null
                    sitemap_include_packages: boolean | null
                    twitter_card_type: string | null
                    twitter_handle: string | null
                    updated_at: string | null
                }
                Insert: {
                    bing_verification?: string | null
                    canonical_base_url?: string | null
                    created_at?: string | null
                    google_analytics_id?: string | null
                    google_search_console_verification?: string | null
                    id?: string
                    og_image?: string | null
                    og_locale?: string | null
                    og_site_name?: string | null
                    org_address?: Json | null
                    org_email?: string | null
                    org_name?: string | null
                    org_phone?: string | null
                    page_key?: string
                    site_description?: string | null
                    site_favicon?: string | null
                    site_keywords?: string | null
                    site_logo?: string | null
                    site_title?: string | null
                    sitemap_enabled?: boolean | null
                    sitemap_include_attractions?: boolean | null
                    sitemap_include_blogs?: boolean | null
                    sitemap_include_packages?: boolean | null
                    twitter_card_type?: string | null
                    twitter_handle?: string | null
                    updated_at?: string | null
                }
                Update: {
                    bing_verification?: string | null
                    canonical_base_url?: string | null
                    created_at?: string | null
                    google_analytics_id?: string | null
                    google_search_console_verification?: string | null
                    id?: string
                    og_image?: string | null
                    og_locale?: string | null
                    og_site_name?: string | null
                    org_address?: Json | null
                    org_email?: string | null
                    org_name?: string | null
                    org_phone?: string | null
                    page_key?: string
                    site_description?: string | null
                    site_favicon?: string | null
                    site_keywords?: string | null
                    site_logo?: string | null
                    site_title?: string | null
                    sitemap_enabled?: boolean | null
                    sitemap_include_attractions?: boolean | null
                    sitemap_include_blogs?: boolean | null
                    sitemap_include_packages?: boolean | null
                    twitter_card_type?: string | null
                    twitter_handle?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            site_content: {
                Row: {
                    created_at: string | null
                    id: string
                    key: string
                    section: string
                    updated_at: string | null
                    value: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    key: string
                    section: string
                    updated_at?: string | null
                    value: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    key?: string
                    section?: string
                    updated_at?: string | null
                    value?: string
                }
                Relationships: []
            }
            status_logs: {
                Row: {
                    changed_by: string | null
                    created_at: string | null
                    entity_id: string
                    entity_type: string
                    id: string
                    new_status: string
                    notes: string | null
                    old_status: string | null
                }
                Insert: {
                    changed_by?: string | null
                    created_at?: string | null
                    entity_id: string
                    entity_type: string
                    id?: string
                    new_status: string
                    notes?: string | null
                    old_status?: string | null
                }
                Update: {
                    changed_by?: string | null
                    created_at?: string | null
                    entity_id?: string
                    entity_type?: string
                    id?: string
                    new_status?: string
                    notes?: string | null
                    old_status?: string | null
                }
                Relationships: []
            }
            stay_leads: {
                Row: {
                    adults: number
                    check_in: string
                    check_out: string
                    children: number | null
                    created_at: string
                    email: string | null
                    id: string
                    name: string
                    phone: string
                    property_id: string | null
                    property_name: string | null
                    status: string
                    updated_at: string
                }
                Insert: {
                    adults?: number
                    check_in: string
                    check_out: string
                    children?: number | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    name: string
                    phone: string
                    property_id?: string | null
                    property_name?: string | null
                    status?: string
                    updated_at?: string
                }
                Update: {
                    adults?: number
                    check_in?: string
                    check_out?: string
                    children?: number | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    name?: string
                    phone?: string
                    property_id?: string | null
                    property_name?: string | null
                    status?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "stay_leads_property_id_fkey"
                        columns: ["property_id"]
                        isOneToOne: false
                        referencedRelation: "properties"
                        referencedColumns: ["id"]
                    },
                ]
            }
            support_tickets: {
                Row: {
                    assigned_to: string | null
                    category: string | null
                    created_at: string | null
                    description: string
                    email: string
                    id: string
                    name: string
                    phone: string | null
                    priority: string | null
                    resolution: string | null
                    resolved_at: string | null
                    status: string | null
                    subject: string
                    ticket_number: string
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    assigned_to?: string | null
                    category?: string | null
                    created_at?: string | null
                    description: string
                    email: string
                    id?: string
                    name: string
                    phone?: string | null
                    priority?: string | null
                    resolution?: string | null
                    resolved_at?: string | null
                    status?: string | null
                    subject: string
                    ticket_number: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    assigned_to?: string | null
                    category?: string | null
                    created_at?: string | null
                    description?: string
                    email?: string
                    id?: string
                    name?: string
                    phone?: string | null
                    priority?: string | null
                    resolution?: string | null
                    resolved_at?: string | null
                    status?: string | null
                    subject?: string
                    ticket_number?: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            testimonials: {
                Row: {
                    avatar_url: string | null
                    content: string
                    created_at: string
                    id: string
                    is_featured: boolean
                    location: string | null
                    name: string
                    rating: number
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    content: string
                    created_at?: string
                    id?: string
                    is_featured?: boolean
                    location?: string | null
                    name: string
                    rating?: number
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    content?: string
                    created_at?: string
                    id?: string
                    is_featured?: boolean
                    location?: string | null
                    name?: string
                    rating?: number
                    updated_at?: string
                }
                Relationships: []
            }
            ticket_messages: {
                Row: {
                    attachments: string[] | null
                    created_at: string | null
                    id: string
                    is_internal: boolean | null
                    message: string
                    sender_email: string
                    sender_name: string
                    sender_type: string
                    ticket_id: string | null
                }
                Insert: {
                    attachments?: string[] | null
                    created_at?: string | null
                    id?: string
                    is_internal?: boolean | null
                    message: string
                    sender_email: string
                    sender_name: string
                    sender_type: string
                    ticket_id?: string | null
                }
                Update: {
                    attachments?: string[] | null
                    created_at?: string | null
                    id?: string
                    is_internal?: boolean | null
                    message?: string
                    sender_email?: string
                    sender_name?: string
                    sender_type?: string
                    ticket_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "ticket_messages_ticket_id_fkey"
                        columns: ["ticket_id"]
                        isOneToOne: false
                        referencedRelation: "support_tickets"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: "customer" | "property_owner" | "admin"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]
type DatabaseWithoutInternals<T extends keyof Database = "public"> = Omit<
    Database[T],
    "__InternalSupabase"
>

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            user_role: ["customer", "property_owner", "admin"],
        },
    },
} as const
