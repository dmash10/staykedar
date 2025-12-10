// Car Rental System Types

export interface CarDriver {
  id: string;
  name: string;
  // Compatibility with DB
  driver_name?: string;
  driver_phone?: string;
  car_model?: string | null;
  car_number?: string | null;
  photo_url?: string | null;
  status?: string;
  location?: string | null;

  slug: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  photo?: string;
  cover_image?: string;
  bio?: string;
  experience_years: number;
  languages: string[];
  service_areas: string[];
  rating: number;
  total_trips: number;
  total_reviews: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  available: boolean; // Added via migration
  price_per_km?: number;
  base_city: string;
  created_at: string;
  updated_at: string;
  // Joined data
  car_vehicles?: CarVehicle[]; // Correct relation name in DB is car_vehicles? table is car_vehicles.
  vehicles?: CarVehicle[]; // Aliased in fetch? usually car_vehicles
}

export interface CarVehicle {
  id: string;
  driver_id: string;
  vehicle_type: 'Sedan' | 'SUV' | 'Premium SUV' | 'Tempo Traveller';
  vehicle_name: string;
  vehicle_number?: string;
  capacity: number;
  luggage_capacity: number;
  features: string[];
  images: string[];
  price_per_km: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarRoute {
  id: string;
  from_city: string;
  to_city: string;
  distance_km: number;
  duration_hours: number;
  description?: string;
  highlights?: string[];
  image?: string;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  pricing?: CarRoutePricing[];
}

export interface CarRoutePricing {
  id: string;
  route_id: string;
  vehicle_type: string;
  one_way_price: number;
  round_trip_price: number;
  includes: string[];
  excludes: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarBooking {
  id: string;
  booking_id: string; // Booking Reference ID (e.g. BK-123)
  driver_id?: string;
  vehicle_id?: string;
  route_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time?: string;
  return_date?: string;
  trip_type: 'one_way' | 'round_trip';
  passengers: number;
  vehicle_type_requested?: string;
  special_requests?: string;
  estimated_price?: number;
  final_price?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_amount: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  driver?: CarDriver;
  vehicle?: CarVehicle;
  route?: CarRoute;

  // Frontend/Schema mismatch fix fields (optional)
  check_in?: string; // If bookings table is shared with hotels??
  check_out?: string;
  booking_date?: string;
  adults?: number;
}

export interface CarReview {
  id: string;
  driver_id: string;
  booking_id?: string;
  customer_name: string;
  rating: number;
  review_text?: string;
  is_verified: boolean;
  is_visible: boolean;
  created_at: string;
}

// Form types
export interface CarDriverFormData {
  name: string;
  slug: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  photo?: string;
  cover_image?: string;
  bio?: string;
  experience_years: number;
  languages: string[];
  service_areas: string[];
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  price_per_km?: number;
  base_city: string;
}

export interface CarVehicleFormData {
  driver_id: string;
  vehicle_type: string;
  vehicle_name: string;
  vehicle_number?: string;
  capacity: number;
  luggage_capacity: number;
  features: string[];
  images: string[];
  price_per_km: number;
  is_primary: boolean;
  is_active: boolean;
}

export interface CarBookingFormData {
  driver_id?: string;
  vehicle_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time?: string;
  return_date?: string;
  trip_type: 'one_way' | 'round_trip';
  passengers: number;
  vehicle_type_requested?: string;
  special_requests?: string;
}

// Vehicle type options
export const VEHICLE_TYPES = [
  { value: 'Sedan', label: 'Sedan', capacity: 4, icon: '🚗' },
  { value: 'SUV', label: 'SUV', capacity: 7, icon: '🚙' },
  { value: 'Premium SUV', label: 'Premium SUV', capacity: 6, icon: '✨' },
  { value: 'Tempo Traveller', label: 'Tempo Traveller', capacity: 17, icon: '🚐' },
] as const;

// Service areas
export const SERVICE_AREAS = [
  'Kedarnath',
  'Badrinath',
  'Gangotri',
  'Yamunotri',
  'Char Dham',
  'Rishikesh',
  'Haridwar',
  'Mussoorie',
  'Uttarakhand',
] as const;

// Languages
export const LANGUAGES = [
  'Hindi',
  'English',
  'Punjabi',
  'Bengali',
  'Gujarati',
  'Marathi',
  'Tamil',
] as const;
