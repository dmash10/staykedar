import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Clock,
    Phone,
    IndianRupee,
    Hotel,
    AlertCircle,
    ArrowRight,
    Filter
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Nav';
import Footer from '@/components/Footer';

interface Listing {
    id: string;
    hotel_name: string;
    location: string;
    room_type: string;
    original_price: number;
    discounted_price: number;
    available_rooms: number;
    valid_for_date: string;
    expires_at: string;
    contact_phone: string;
    is_verified: boolean;
}

export default function UrgentStaysPage() {
    const [locationFilter, setLocationFilter] = useState<string>('all');

    // Fetch listings
    const { data: listings, isLoading } = useQuery({
        queryKey: ['urgent-stays'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory_listings')
                .select('*')
                .eq('is_verified', true)
                .gt('expires_at', new Date().toISOString())
                .order('discounted_price', { ascending: true });

            if (error) throw error;
            return data as Listing[];
        },
        refetchInterval: 60000 // Refresh every minute
    });

    const locations = Array.from(new Set(listings?.map(l => l.location) || []));
    const filteredListings = locationFilter === 'all'
        ? listings
        : listings?.filter(l => l.location === locationFilter);

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-red-600 text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 animate-pulse">
                        <Clock className="w-3 h-3 mr-1" /> Live Updates
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Last Minute Hotel Deals
                    </h1>
                    <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                        Book unsold rooms at verified hotels for heavily discounted rates.
                        Direct contact with hotel owners. No hidden fees.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                        <Button
                            variant={locationFilter === 'all' ? 'secondary' : 'outline'}
                            className={`rounded-full ${locationFilter === 'all' ? 'bg-white text-red-600' : 'bg-red-700 border-red-500 text-white hover:bg-red-800'}`}
                            onClick={() => setLocationFilter('all')}
                        >
                            All Locations
                        </Button>
                        {locations.map(loc => (
                            <Button
                                key={loc}
                                variant={locationFilter === loc ? 'secondary' : 'outline'}
                                className={`rounded-full ${locationFilter === loc ? 'bg-white text-red-600' : 'bg-red-700 border-red-500 text-white hover:bg-red-800'}`}
                                onClick={() => setLocationFilter(loc)}
                            >
                                {loc}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 -mt-8">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Finding best deals...</p>
                    </div>
                ) : filteredListings?.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                        <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Urgent Deals Available</h3>
                        <p className="text-gray-500 mb-6">
                            All slashed-price inventory has been booked. Check back later or browse regular stays.
                        </p>
                        <Button className="bg-[#0071c2] hover:bg-[#005999]">
                            Browse All Hotels <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings?.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                {/* Header */}
                                <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                                            {item.hotel_name}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" />
                                            {item.location}
                                        </div>
                                    </div>
                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                        {Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100)}% OFF
                                    </Badge>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Price for Tonight</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-bold text-red-600">₹{item.discounted_price}</span>
                                                <span className="text-sm text-gray-400 line-through">₹{item.original_price}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md mb-1 inline-block">
                                                Only {item.available_rooms} Left
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-gray-50 p-2 rounded text-center">
                                            <p className="text-xs text-gray-500 mb-0.5">Room Type</p>
                                            <p className="font-medium text-sm text-gray-800">{item.room_type}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded text-center">
                                            <p className="text-xs text-gray-500 mb-0.5">Valid For</p>
                                            <p className="font-medium text-sm text-gray-800">
                                                {format(new Date(item.valid_for_date), 'MMM dd')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4 bg-gray-50 px-3 py-2 rounded-full">
                                        <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Expires {formatDistanceToNow(new Date(item.expires_at), { addSuffix: true })}
                                        </span>
                                        <span className="flex items-center text-green-600 font-medium">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Verified
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold shadow-red-200 shadow-lg"
                                        onClick={() => handleCall(item.contact_phone)}
                                    >
                                        <Phone className="w-5 h-5 mr-2 animate-pulse" />
                                        Call to Book
                                    </Button>
                                    <p className="text-center text-[10px] text-gray-400 mt-2">
                                        Direct call to property owner
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
