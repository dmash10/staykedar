import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Loader2, MapPin, Star, Share2, Heart, Wifi, Car, Utensils, Zap, Shield, Check, Users, BedDouble } from 'lucide-react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { Property, RoomTypeAvailability } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const PropertyDetail: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || format(new Date(), 'yyyy-MM-dd'));
    const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);

    const [property, setProperty] = useState<Property | null>(null);
    const [roomTypes, setRoomTypes] = useState<RoomTypeAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (propertyId) {
            loadPropertyDetails();
        }
    }, [propertyId, checkIn, checkOut]);

    const loadPropertyDetails = async () => {
        if (!propertyId) return;
        setLoading(true);
        setError(null);

        try {
            const propertyData = await stayService.getProperty(propertyId);
            if (!propertyData) {
                setError('Property not found');
                return;
            }
            setProperty(propertyData);

            // Load available room types
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const rooms = await stayService.getPropertyRoomTypes(propertyId, checkInDate, checkOutDate);
            setRoomTypes(rooms);

        } catch (err) {
            console.error('Error loading property details:', err);
            setError('Failed to load property details');
        } finally {
            setLoading(false);
        }
    };

    const handleBookRoom = (roomType: RoomTypeAvailability) => {
        if (roomType.availableCount > 0 && roomType.roomIds.length > 0) {
            // Navigate to booking confirmation with the first available room ID of this type
            navigate(`/book/${roomType.roomIds[0]}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
        } else {
            toast({
                title: "Room Unavailable",
                description: "Sorry, this room type is currently unavailable for the selected dates.",
                variant: "destructive",
            });
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-[#0071c2]" />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-4">{error || 'Property not found'}</p>
                    <Button onClick={() => navigate('/stays')}>Back to Stays</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Nav />
            <main className="min-h-screen bg-gray-50 pb-12">
                {/* Image Gallery */}
                <div className="bg-white border-b border-gray-200">
                    <Container className="py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[400px] rounded-xl overflow-hidden mb-6">
                            <div className="h-full">
                                <img
                                    src={property.images?.[0] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"}
                                    alt={property.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 h-full">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="relative overflow-hidden">
                                        <img
                                            src={property.images?.[i] || `https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80&auto=format&fit=crop`}
                                            alt={`${property.name} view ${i}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Title and Info */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        Property
                                    </span>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-medium text-gray-900">4.5 (120 reviews)</span>
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {property.address || 'Kedarnath, Uttarakhand'}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Share2 className="w-4 h-4" /> Share
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Heart className="w-4 h-4" /> Save
                                </Button>
                            </div>
                        </div>
                    </Container>
                </div>

                <Container className="py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Description & Amenities */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-900">About this property</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {property.description || "Experience a peaceful stay at this beautiful property located in the heart of Kedarnath. Perfect for pilgrims and travelers seeking comfort and convenience."}
                                </p>
                            </div>

                            {/* Amenities */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-6 text-gray-900">Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Wifi className="w-5 h-5 text-[#0071c2]" />
                                        <span>Free Wi-Fi</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Car className="w-5 h-5 text-[#0071c2]" />
                                        <span>Free Parking</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Utensils className="w-5 h-5 text-[#0071c2]" />
                                        <span>Restaurant</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Zap className="w-5 h-5 text-[#0071c2]" />
                                        <span>Power Backup</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Shield className="w-5 h-5 text-[#0071c2]" />
                                        <span>24/7 Security</span>
                                    </div>
                                </div>
                            </div>

                            {/* Room Selection */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">Choose your room</h2>
                                {roomTypes.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No rooms available</h3>
                                        <p className="text-yellow-700">Try changing your dates or guest count to see available rooms.</p>
                                    </div>
                                ) : (
                                    roomTypes.map((room) => (
                                        <div key={room.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="md:w-1/3 h-48 md:h-auto bg-gray-100 relative">
                                                    <img
                                                        src={room.images?.[0] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"}
                                                        alt={room.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-6 flex-grow flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-bold text-[#0071c2]">{formatPrice(room.price)}</span>
                                                                <span className="text-gray-500 text-sm block">per night</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                Max {room.capacity} Guests
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <BedDouble className="w-4 h-4" />
                                                                {room.type}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                                <Check className="w-4 h-4" />
                                                                <span>Free Cancellation</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                                <Check className="w-4 h-4" />
                                                                <span>Breakfast Included</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                        <div className="text-sm text-gray-500">
                                                            {room.availableCount} rooms left
                                                        </div>
                                                        <Button
                                                            onClick={() => handleBookRoom(room)}
                                                            className="bg-[#0071c2] hover:bg-[#005a9c]"
                                                        >
                                                            Select Room
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column: Booking Summary / Map */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4">Location</h3>
                                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                                    Map View Placeholder
                                </div>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <p>
                                        <strong>Check-in:</strong> 12:00 PM
                                    </p>
                                    <p>
                                        <strong>Check-out:</strong> 11:00 AM
                                    </p>
                                    <hr />
                                    <p className="text-xs">
                                        * Distances are measured in straight lines. Actual travel distances may vary.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
};

export default PropertyDetail;
