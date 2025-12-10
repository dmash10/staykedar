import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Search,
    Star,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    Wifi,
    Utensils,
    ShieldCheck,
    Clock,
    Headphones,
    Car,
    ThermometerSun,
    Wind,
    ChevronDown,
    ChevronUp,
    Minus,
    Plus,
    X,
    DollarSign,
    XCircle,
    Heart,
    ClipboardCheck,
    CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvailabilityModal, EmergencyStaysCard, BookingToaster } from '@/components/stays';
import { BlindProperty, LOCATION_GROUPS } from '@/types/stays';
import { getPropertyImages, generateWhatsAppUrl } from '@/utils/stayUtils';
import { supabase } from '@/integrations/supabase/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SmartStaysPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Search & Filter State
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [sortBy, setSortBy] = useState<string>('recommended');
    const [isUrgentMode, setIsUrgentMode] = useState(false);

    // Detailed Filters
    const [filters, setFilters] = useState({
        // Reservation policy
        free_cancellation: false,
        no_credit_card: false,
        no_prepayment: false,

        // Review score (5 scale)
        score_45: false, // Excellent: 4.5+
        score_40: false, // Very Good: 4+
        score_35: false, // Good: 3.5+
        score_30: false, // Pleasant: 3+

        // Facilities
        parking: false,
        restaurant: false,
        wifi: false,
        room_service: false,
        front_desk: false,
        non_smoking: false,

        // Property Type (New Logical Types)
        hotel: false,
        resort: false,
        homestay: false,
        tent: false,

        // Rooms
        bedrooms: 0,
        // Removed Bathrooms as requested
    });

    const [showAllFacilities, setShowAllFacilities] = useState(false);

    // Data State
    const [properties, setProperties] = useState<BlindProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<BlindProperty | null>(null);

    // Fetch Properties
    useEffect(() => {
        fetchProperties();
    }, [location, sortBy]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('blind_properties')
                .select('*')
                .eq('is_active', true);

            if (location && location !== 'all') {
                query = query.eq('location_slug', location);
            }

            // Sort logic
            if (sortBy === 'price_low') {
                query = query.order('base_price', { ascending: true });
            } else if (sortBy === 'price_high') {
                query = query.order('base_price', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;
            setProperties((data as BlindProperty[]) || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Logic for Filtering
    const filteredProperties = properties.filter(p => {
        const am = p.amenities as any || {};
        const rating = am.rating || 4.5; // Use real rating or default logic

        // Reservation
        if (filters.free_cancellation && !am.free_cancellation) return false;
        if (filters.no_credit_card && !am.no_credit_card) return false;
        if (filters.no_prepayment && !am.no_prepayment) return false;

        // Review Score (Max 5 Logic)
        if (filters.score_45 && rating < 4.5) return false;
        if (filters.score_40 && rating < 4.0) return false;
        if (filters.score_35 && rating < 3.5) return false;
        if (filters.score_30 && rating < 3.0) return false;

        // Facilities
        if (filters.parking && !am.parking) return false;
        if (filters.restaurant && !am.restaurant) return false;
        if (filters.wifi && !am.wifi) return false;
        if (filters.room_service && !am.room_service) return false;
        if (filters.front_desk && !am.front_desk) return false;
        if (filters.non_smoking && !am.non_smoking) return false;

        // Property Type (Logical Checks)
        // Default to 'hotel' if not set, or check strictly
        const type = am.property_type || 'hotel';
        if (filters.hotel && type !== 'hotel') return false;
        if (filters.resort && type !== 'resort') return false;
        if (filters.homestay && type !== 'homestay') return false;
        if (filters.tent && type !== 'tent') return false;

        // Rooms
        if (filters.bedrooms > 0 && (am.bedrooms || 1) < filters.bedrooms) return false;

        return true;
    });

    // Count Helpers 
    const getCount = (predicate: (p: BlindProperty) => boolean) => {
        return properties.filter(predicate).length;
    };

    // Filter Handlers
    const toggleFilter = (key: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const setRoomCount = (key: 'bedrooms', val: number) => {
        setFilters(prev => ({ ...prev, [key]: Math.max(0, val) }));
    };

    // Emergency handlers
    const handleEmergencyCall = () => {
        window.location.href = 'tel:+919027475042';
    };

    const handleEmergencyWhatsApp = () => {
        const url = generateWhatsAppUrl('URGENT', 'Emergency Room', 0, undefined, true);
        window.open(url, '_blank');
    };

    // Facilities Logic
    const allFacilities = [
        { key: 'parking', label: 'Parking' },
        { key: 'restaurant', label: 'Restaurant' },
        { key: 'wifi', label: 'Free Wifi' },
        { key: 'room_service', label: 'Room service' },
        { key: 'front_desk', label: '24-hour front desk' },
        { key: 'non_smoking', label: 'Non-smoking rooms' },
    ];
    const initialVisible = 4;
    const remainingCount = allFacilities.length - initialVisible;


    return (
        <>
            <Helmet>
                <title>Available Stays in Kedarnath Region | StayKedarnath</title>
                <meta name="description" content="Find verified stays near Kedarnath. All properties personally inspected. Travel agent rates with honest reviews." />
            </Helmet>

            <Nav />

            {/* Main Content Area */}
            <main className="min-h-screen bg-gray-50">

                {/* Hero Section - Matching Home Page Design */}
                <section className="bg-[#003580] relative">
                    <Container className="relative z-10 pt-16 pb-12">
                        <div className="flex flex-col items-start text-left mb-6">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                Find Your Perfect Stay<br className="hidden md:block" /> in Kedarnath
                            </h1>
                            <p className="text-base md:text-xl text-white/90 max-w-2xl">
                                Book verified Hotels, Resorts, Camps, and Homestays at the best prices.
                            </p>
                        </div>
                    </Container>
                </section>
                {/* Why Choose StayKedarnath - Booking.com Style */}
                <section className="bg-white py-10 md:py-14 border-b border-gray-100">
                    <Container>
                        {/* Section Cards - 4 Feature Cards with Illustrations */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                            {/* Card 1: Book Now Pay Later */}
                            <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 md:p-6 transition-colors group">
                                <div className="mb-4">
                                    {/* Illustration - Calendar with checkmark */}
                                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="8" y="14" width="48" height="42" rx="4" fill="#FFE0B2" />
                                        <rect x="8" y="14" width="48" height="12" rx="4" fill="#FF9800" />
                                        <rect x="16" y="8" width="4" height="12" rx="2" fill="#795548" />
                                        <rect x="44" y="8" width="4" height="12" rx="2" fill="#795548" />
                                        <circle cx="44" cy="42" r="12" fill="#4CAF50" />
                                        <path d="M39 42L42 45L49 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <rect x="16" y="32" width="8" height="6" rx="1" fill="#FFCC80" />
                                        <rect x="28" y="32" width="8" height="6" rx="1" fill="#FFCC80" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">
                                    Book Now, Pay at Property
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="text-[#0071c2] font-medium">FREE cancellation</span> on most rooms
                                </p>
                            </div>

                            {/* Card 2: Verified Reviews */}
                            <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 md:p-6 transition-colors group">
                                <div className="mb-4">
                                    {/* Illustration - Thumbs up with checkmark */}
                                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 32V52C20 53.1046 20.8954 54 22 54H26C27.1046 54 28 53.1046 28 52V32C28 30.8954 27.1046 30 26 30H22C20.8954 30 20 30.8954 20 32Z" fill="#FF9800" />
                                        <path d="M28 34H40C43.3137 34 46 31.3137 46 28V26C46 24.8954 45.1046 24 44 24H36L38 14C38 11.7909 36.2091 10 34 10C32.8954 10 32 10.8954 32 12V20L28 30V34Z" fill="#FFCC80" />
                                        <circle cx="50" cy="18" r="12" fill="#4CAF50" />
                                        <path d="M45 18L48 21L55 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">
                                    Verified Guest Reviews
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Get trusted information from guests like you
                                </p>
                            </div>

                            {/* Card 3: 100+ Properties */}
                            <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 md:p-6 transition-colors group">
                                <div className="mb-4">
                                    {/* Illustration - Globe with buildings */}
                                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="32" r="24" fill="#FFE0B2" />
                                        <ellipse cx="32" cy="32" rx="10" ry="24" stroke="#FF9800" strokeWidth="2" />
                                        <line x1="8" y1="32" x2="56" y2="32" stroke="#FF9800" strokeWidth="2" />
                                        <path d="M14 20C20 20 26 18 32 18C38 18 44 20 50 20" stroke="#FF9800" strokeWidth="2" />
                                        <path d="M14 44C20 44 26 46 32 46C38 46 44 44 50 44" stroke="#FF9800" strokeWidth="2" />
                                        <circle cx="50" cy="14" r="10" fill="#2196F3" />
                                        <path d="M46 14H54M50 10V18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">
                                    100+ Verified Properties
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Hotels, guesthouses, homestays, and camps
                                </p>
                            </div>

                            {/* Card 4: 24/7 Support */}
                            <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 md:p-6 transition-colors group">
                                <div className="mb-4">
                                    {/* Illustration - Customer service agent */}
                                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="28" r="16" fill="#BBDEFB" />
                                        <circle cx="32" cy="24" r="10" fill="#FFE0B2" />
                                        <path d="M22 24C22 24 24 22 32 22C40 22 42 24 42 24" stroke="#795548" strokeWidth="2" />
                                        <ellipse cx="28" cy="24" rx="1.5" ry="2" fill="#795548" />
                                        <ellipse cx="36" cy="24" rx="1.5" ry="2" fill="#795548" />
                                        <path d="M30 28C30 28 31 29 32 29C33 29 34 28 34 28" stroke="#795548" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M18 22V28C18 28 18 32 22 32" stroke="#2196F3" strokeWidth="3" strokeLinecap="round" />
                                        <path d="M46 22V28C46 28 46 32 42 32" stroke="#2196F3" strokeWidth="3" strokeLinecap="round" />
                                        <rect x="16" y="20" width="6" height="4" rx="2" fill="#2196F3" />
                                        <rect x="42" y="20" width="6" height="4" rx="2" fill="#2196F3" />
                                        <path d="M24 44C24 40 28 38 32 38C36 38 40 40 40 44V54H24V44Z" fill="#2196F3" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">
                                    24/7 Customer Support
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    We're always here to help you
                                </p>
                            </div>

                        </div>

                        {/* Our Promise Banner */}
                        <div className="mt-8 bg-gradient-to-r from-[#003580] to-[#0071c2] rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                    <Heart className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-white text-lg md:text-xl mb-1">
                                    We Only List Properties We'd Stay At Ourselves
                                </h3>
                                <p className="text-white/85 text-sm md:text-base">
                                    Every property is personally visited, inspected, and verified by our team before going live.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                                <ClipboardCheck className="w-5 h-5 text-yellow-400" />
                                <span className="text-white text-sm font-medium whitespace-nowrap">100+ Audited</span>
                            </div>
                        </div>
                    </Container>
                </section>

                <Container className="py-6">
                    {/* Our Locations Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Explore our locations</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[
                                { name: 'Guptkashi', dist: '45 km to Kedarnath', count: 42, img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500&q=80' },
                                { name: 'Narayankoti', dist: '40 km to Kedarnath', count: 18, img: 'https://images.unsplash.com/photo-1598887142487-3c830902891d?w=500&q=80' },
                                { name: 'Phata', dist: '32 km to Kedarnath', count: 24, img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500&q=80' },
                                { name: 'Sersi', dist: '25 km to Kedarnath', count: 15, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80' },
                                { name: 'Sitapur', dist: '22 km to Kedarnath', count: 32, img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80' },
                                { name: 'Rampur', dist: '20 km to Kedarnath', count: 28, img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=500&q=80' },
                                { name: 'Sonprayag', dist: '18 km to Kedarnath', count: 12, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80' },
                                { name: 'Kedarnath', dist: '0 km (Temple)', count: 8, img: 'https://images.unsplash.com/photo-1563276632-482a15c32484?w=500&q=80' },
                            ].map((loc) => (
                                <div
                                    key={loc.name}
                                    onClick={() => setLocation(loc.name.toLowerCase())}
                                    className="bg-white border-2 text-[13px] border-transparent hover:border-[#0071c2] rounded-[6px] overflow-hidden cursor-pointer group hover:bg-blue-50/30 transition-colors"
                                >
                                    <div className="h-32 overflow-hidden relative border-b border-gray-200">
                                        <img src={loc.img} alt={loc.name} className="w-full h-full object-cover transition-none" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-2 left-3">
                                            <p className="text-white font-bold text-base leading-none tracking-wide shadow-black drop-shadow-md">{loc.name}</p>
                                            <p className="text-white/90 text-[10px] font-medium flex items-center gap-1 shadow-black drop-shadow-sm mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {loc.dist}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-400 text-[11px] font-medium">
                                                    {loc.count} properties
                                                </p>
                                            </div>
                                            <button className="text-[#0071c2] text-xs font-bold hover:text-[#005a9c] hover:bg-blue-50 px-2 py-1.5 rounded transition-colors group-hover:underline">
                                                Explore stays
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* SIDEBAR FILTERS */}
                        <aside className="w-full md:w-[260px] flex-shrink-0 hidden md:block">
                            <div className="bg-white border text-[13px] border-gray-300 rounded-[2px] overflow-hidden">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-2">Filter by:</h3>
                                </div>

                                <div className="divide-y divide-gray-200">

                                    {/* Property Type (New Logical) */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-3">Property Type</h3>
                                        <div className="space-y-2">
                                            <FilterOption label="Hotel" count={getCount(p => ((p.amenities as any).property_type || 'hotel') === 'hotel')} checked={filters.hotel} onChange={() => toggleFilter('hotel')} />
                                            <FilterOption label="Resort" count={getCount(p => (p.amenities as any).property_type === 'resort')} checked={filters.resort} onChange={() => toggleFilter('resort')} />
                                            <FilterOption label="Homestay" count={getCount(p => (p.amenities as any).property_type === 'homestay')} checked={filters.homestay} onChange={() => toggleFilter('homestay')} />
                                            <FilterOption label="Tent / Camp" count={getCount(p => (p.amenities as any).property_type === 'tent')} checked={filters.tent} onChange={() => toggleFilter('tent')} />
                                        </div>
                                    </div>

                                    {/* Bedrooms (Removed Bathrooms) */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-3">Bedrooms</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700">Bedrooms</span>
                                            <div className="flex items-center border border-gray-300 rounded">
                                                <button
                                                    onClick={() => setRoomCount('bedrooms', filters.bedrooms - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-r border-gray-300 disabled:opacity-50"
                                                    disabled={filters.bedrooms <= 0}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center">{filters.bedrooms}</span>
                                                <button
                                                    onClick={() => setRoomCount('bedrooms', filters.bedrooms + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-[#0071c2] hover:bg-gray-50 border-l border-gray-300"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reservation policy */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-3">Reservation policy</h3>
                                        <div className="space-y-2">
                                            <FilterOption label="Free cancellation" count={getCount(p => !!(p.amenities as any).free_cancellation)} checked={filters.free_cancellation} onChange={() => toggleFilter('free_cancellation')} />
                                            <FilterOption label="Book without credit card" count={getCount(p => !!(p.amenities as any).no_credit_card)} checked={filters.no_credit_card} onChange={() => toggleFilter('no_credit_card')} />
                                            <FilterOption label="No prepayment" count={getCount(p => !!(p.amenities as any).no_prepayment)} checked={filters.no_prepayment} onChange={() => toggleFilter('no_prepayment')} />
                                        </div>
                                    </div>

                                    {/* Review score - 5 scale logic */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-3">Review score</h3>
                                        <div className="space-y-2">
                                            <FilterOption label="Excellent: 4.5+" count={getCount(p => ((p.amenities as any).rating || 4.5) >= 4.5)} checked={filters.score_45} onChange={() => toggleFilter('score_45')} />
                                            <FilterOption label="Very Good: 4+" count={getCount(p => ((p.amenities as any).rating || 4.5) >= 4)} checked={filters.score_40} onChange={() => toggleFilter('score_40')} />
                                            <FilterOption label="Good: 3.5+" count={getCount(p => ((p.amenities as any).rating || 4.5) >= 3.5)} checked={filters.score_35} onChange={() => toggleFilter('score_35')} />
                                            <FilterOption label="Pleasant: 3+" count={getCount(p => ((p.amenities as any).rating || 4.5) >= 3)} checked={filters.score_30} onChange={() => toggleFilter('score_30')} />
                                        </div>
                                    </div>

                                    {/* Facilities - Logical Show More */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-3">Facilities</h3>
                                        <div className="space-y-2">
                                            {allFacilities.slice(0, showAllFacilities ? undefined : initialVisible).map(fac => (
                                                <FilterOption
                                                    key={fac.key}
                                                    label={fac.label}
                                                    count={getCount(p => !!(p.amenities as any)[fac.key])}
                                                    checked={!!(filters as any)[fac.key]}
                                                    onChange={() => toggleFilter(fac.key as any)}
                                                />
                                            ))}

                                            {remainingCount > 0 && (
                                                <button
                                                    onClick={() => setShowAllFacilities(!showAllFacilities)}
                                                    className="flex items-center gap-1 text-[13px] text-[#0071c2] hover:underline font-medium mt-1"
                                                >
                                                    {showAllFacilities ? 'Show less' : `Show all ${remainingCount + initialVisible}`}
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${showAllFacilities ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Top Filter Bar & Urgency */}
                            <div className="flex justify-between items-center mb-4">
                                <p className="font-bold text-2xl text-gray-900">{location ? `Stays in ${location}` : 'All Stays'} <span className="text-gray-500 font-normal text-sm ml-2">{filteredProperties.length} properties found</span></p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className={`h-8 text-xs ${isUrgentMode ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                                        onClick={() => setIsUrgentMode(!isUrgentMode)}
                                    >
                                        {isUrgentMode ? 'Exit Emergency Mode' : 'Emergency Mode'}
                                    </Button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {isUrgentMode ? (
                                    <motion.div
                                        key="emergency"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <EmergencyStaysCard
                                            onCallClick={handleEmergencyCall}
                                            onWhatsAppClick={handleEmergencyWhatsApp}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="listings"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        {loading ? (
                                            <div className="flex justify-center py-20 bg-white border border-gray-200 rounded-md">
                                                <Loader2 className="w-8 h-8 animate-spin text-[#003580]" />
                                            </div>
                                        ) : filteredProperties.length === 0 ? (
                                            <div className="bg-white border border-dashed border-gray-300 rounded-md p-12 text-center">
                                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
                                                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                                                <Button onClick={() => window.location.reload()}>Reset Filters</Button>
                                            </div>
                                        ) : (
                                            filteredProperties.map((property) => (
                                                <ExactDesignCard
                                                    key={property.id}
                                                    property={property}
                                                    onBook={() => setSelectedProperty(property)}
                                                />
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </Container >

                <BookingToaster interval={30000} />
            </main >

            <AvailabilityModal
                property={selectedProperty!}
                isOpen={!!selectedProperty}
                onClose={() => setSelectedProperty(null)}
            />

            <Footer />
        </>
    );
};

// Reusable Filter Option Component for Exact Styling
const FilterOption = ({
    label,
    subLabel,
    count,
    checked,
    onChange,
    hasArrow
}: {
    label: string,
    subLabel?: string,
    count: number,
    checked: boolean,
    onChange: () => void,
    hasArrow?: boolean
}) => (
    <div className="flex items-start justify-between group cursor-pointer" onClick={onChange}>
        <div className="flex items-start gap-3">
            <div className={`
                w-5 h-5 mt-0.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors
                ${checked ? 'bg-[#0071c2] border-[#0071c2]' : 'bg-white border-gray-300 group-hover:border-[#0071c2]'}
            `}>
                {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
            </div>
            <div>
                <div className="flex items-center gap-1">
                    <span className="text-[13px] text-gray-700 leading-tight">{label}</span>
                    {hasArrow && <ChevronUp className="w-4 h-4 text-[#0071c2]" />}
                </div>
                {subLabel && <p className="text-[11px] text-gray-500 mt-0.5">{subLabel}</p>}
            </div>
        </div>
        <span className="text-[12px] text-gray-500">{count}</span>
    </div>
);

const ExactDesignCard = ({ property, onBook }: { property: BlindProperty, onBook: () => void }) => {
    const images = getPropertyImages(property);
    const amenities = property.amenities as any || {};
    const rating = amenities.rating || 4.5;

    // Convert rating to word
    const getRatingWord = (r: number) => {
        if (r >= 4.5) return "Excellent";
        if (r >= 4) return "Very Good";
        if (r >= 3.5) return "Good";
        if (r >= 3) return "Pleasant";
        return "Review Score";
    };

    return (
        <div className="bg-white rounded-md border border-gray-300 hover:border-[#0071c2] overflow-hidden hover:shadow-lg transition-all duration-200 group">
            <div className="flex flex-col md:flex-row p-4 gap-4">
                {/* Image - Fixed width on desktop */}
                <div className="w-full md:w-[240px] h-[180px] flex-shrink-0 relative rounded-md overflow-hidden bg-gray-100">
                    <img
                        src={images[0]}
                        alt={property.display_name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            {/* Title & Verified Badge */}
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-[#0071c2] group-hover:underline">
                                    {property.display_name}
                                </h3>
                                <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-[3px] text-[11px] font-bold flex items-center gap-1 border border-green-200">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="capitalize text-gray-900 font-medium">{property.location_slug}</span>
                                <span className="text-gray-400">-</span>
                                <span>26 km to Kedarnath base</span>
                            </div>

                            {/* Rating Row (Like image) */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-[#003580] text-white px-2 py-1 rounded-[4px] text-sm font-bold flex items-center gap-1">
                                    {rating}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-gray-500 font-medium">(156 reviews)</span>
                                </div>
                            </div>

                            {/* Amenities Pills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {amenities.wifi && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                        <Wifi className="w-3.5 h-3.5" /> WiFi
                                    </div>
                                )}
                                {amenities.geyser !== 'none' && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                        <ThermometerSun className="w-3.5 h-3.5" /> Hot Water
                                    </div>
                                )}
                                {amenities.restaurant && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                        <Utensils className="w-3.5 h-3.5" /> Restaurant
                                    </div>
                                )}
                                {amenities.parking && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                        <Car className="w-3.5 h-3.5" /> Parking
                                    </div>
                                )}
                                {amenities.room_service && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                        <Clock className="w-3.5 h-3.5" /> Room Service
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* Footer / Price Action */}
                    <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#cc0000] text-white text-[10px] px-1.5 py-0.5 rounded-[2px] font-bold">Limited time deal</span>
                                <p className="text-xs text-red-600 line-through">₹{(property.surge_price || Math.floor(property.base_price * 1.35)).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-[#008009]">₹{property.base_price.toLocaleString()}</p>
                                <span className="text-sm text-gray-500 font-normal">per night</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                + ₹{Math.floor(property.base_price * 0.12)} taxes and charges
                            </p>
                        </div>
                        <Button
                            onClick={onBook}
                            className="bg-[#0071c2] hover:bg-[#005a9c] text-white px-6 py-2 h-auto text-sm font-bold rounded-[4px]"
                        >
                            See availability
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartStaysPage;
