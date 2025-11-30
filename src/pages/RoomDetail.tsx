import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { format, addDays, differenceInDays } from 'date-fns';
import { Calendar, Users, MapPin, CheckCircle, XCircle, Loader2, Star, Wifi, Car, Utensils, Coffee, Tv, Wind, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { Room, Property } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get search params
  const checkInParam = searchParams.get('checkIn') || format(new Date(), 'yyyy-MM-dd');
  const checkOutParam = searchParams.get('checkOut') || format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const guestsParam = Number(searchParams.get('guests')) || 2;

  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Booking form state
  const [checkIn, setCheckIn] = useState(checkInParam);
  const [checkOut, setCheckOut] = useState(checkOutParam);
  const [guests, setGuests] = useState(guestsParam);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Load room data
  useEffect(() => {
    if (!roomId) return;

    const loadRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        const roomData = await stayService.getRoom(roomId);
        if (!roomData) {
          throw new Error('Room not found');
        }
        setRoom(roomData);

        const propertyData = await stayService.getProperty(roomData.property_id);
        setProperty(propertyData);

        const availabilityCheck = await stayService.checkRoomAvailability(
          roomId,
          checkIn,
          checkOut
        );
        setIsAvailable(availabilityCheck);

      } catch (err) {
        console.error('Error loading room data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load room details');
        toast({
          title: "Error",
          description: "Failed to load room details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, checkIn, checkOut, toast]);

  const totalNights = differenceInDays(new Date(checkOut), new Date(checkIn));
  const totalPrice = room ? room.price * totalNights : 0;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book a room",
        variant: "default",
      });
      navigate('/auth?redirect=' + encodeURIComponent(`/stays/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`));
      return;
    }

    if (!room) return;

    try {
      setIsBooking(true);

      await stayService.createBooking({
        room_id: room.id,
        user_id: user.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        num_guests: guests,
        total_price: totalPrice,
        special_requests: specialRequests,
        status: 'confirmed',
      });

      toast({
        title: "Booking Successful",
        description: "Your room has been booked successfully!",
        variant: "default",
      });

      navigate('/dashboard/bookings');

    } catch (err) {
      console.error('Error creating booking:', err);
      toast({
        title: "Booking Failed",
        description: err instanceof Error ? err.message : 'Failed to create booking. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleDateChange = async () => {
    if (!roomId) return;

    try {
      const availabilityCheck = await stayService.checkRoomAvailability(
        roomId,
        checkIn,
        checkOut
      );
      setIsAvailable(availabilityCheck);

      const params = new URLSearchParams();
      params.set('checkIn', checkIn);
      params.set('checkOut', checkOut);
      params.set('guests', guests.toString());

      navigate(`/stays/${roomId}?${params.toString()}`, { replace: true });

    } catch (err) {
      console.error('Error checking availability:', err);
      toast({
        title: "Error",
        description: "Failed to check room availability.",
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

  // Helper to get icon for amenity
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('parking')) return <Car className="w-5 h-5" />;
    if (lower.includes('restaurant') || lower.includes('food')) return <Utensils className="w-5 h-5" />;
    if (lower.includes('coffee') || lower.includes('breakfast')) return <Coffee className="w-5 h-5" />;
    if (lower.includes('tv')) return <Tv className="w-5 h-5" />;
    if (lower.includes('ac') || lower.includes('air')) return <Wind className="w-5 h-5" />;
    if (lower.includes('security') || lower.includes('safe')) return <Shield className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-gray-50 py-8">
          <Container>
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#0071c2]" />
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !room || !property) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-gray-50 py-8">
          <Container>
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Room</h3>
              <p className="text-red-600 mb-4">{error || 'Room not found'}</p>
              <button
                onClick={() => navigate(-1)}
                className="bg-[#0071c2] hover:bg-[#005a9c] text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  // Parse amenities from JSON
  const roomAmenities = Array.isArray(room.amenities) ? room.amenities as string[] : [];
  const propertyAmenities = Array.isArray(property.amenities) ? property.amenities as string[] : [];

  // Combine unique amenities
  const allAmenities = Array.from(new Set([...roomAmenities, ...propertyAmenities]));

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <Container className="py-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className="font-medium text-[#0071c2]">{property.name}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address || 'Kedarnath, Uttarakhand'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-[#003580] text-white px-2 py-1 rounded text-sm font-bold">
                    4.5
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Excellent · 124 reviews</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-bold text-[#0071c2]">
                  {formatPrice(room.price)}
                </div>
                <span className="text-sm text-gray-500">per night</span>
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Images, Description, Amenities */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[400px] rounded-xl overflow-hidden">
                <div className="h-full bg-gray-200 relative">
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      No Image Available
                    </div>
                  )}
                </div>
                <div className="grid grid-rows-2 gap-2 h-full">
                  <div className="bg-gray-200 relative">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        Property Image
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-200 relative">
                    {property.images && property.images.length > 1 ? (
                      <img src={property.images[1]} alt={property.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        More Photos
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900">About this stay</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {room.description || `Experience comfort and tranquility in our ${room.room_type}. 
                  Perfect for pilgrims and travelers seeking a peaceful retreat in Kedarnath.`}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || `Located in a prime area, ${property.name} offers easy access to the temple and other attractions. 
                  Our dedicated staff ensures a comfortable and memorable stay for all guests.`}
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Amenities</h2>
                {allAmenities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                    {allAmenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-700">
                        <div className="text-[#0071c2]">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specific amenities listed.</p>
                )}
              </div>

              {/* House Rules / Policies */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900">House Rules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Check-in / Check-out</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex justify-between">
                        <span>Check-in:</span>
                        <span className="font-medium">12:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Check-out:</span>
                        <span className="font-medium">10:00 AM</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                    <p className="text-gray-600 text-sm">
                      Free cancellation up to 48 hours before check-in.
                      After that, one night's charge applies.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Book your stay</h2>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Date Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Check-in</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Check-out</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-transparent text-sm"
                    >
                      {Array.from({ length: room.capacity }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleDateChange}
                    className="w-full text-[#0071c2] text-sm font-medium hover:underline text-left"
                  >
                    Check availability for these dates
                  </button>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>{formatPrice(room.price)} x {totalNights} nights</span>
                      <span>{formatPrice(room.price * totalNights)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Service fee</span>
                      <span>₹0</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Availability Status */}
                  {isAvailable ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg text-sm font-medium">
                      <CheckCircle className="h-5 w-5" />
                      Available for your dates
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg text-sm font-medium">
                      <XCircle className="h-5 w-5" />
                      Not available
                    </div>
                  )}

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Early check-in, dietary needs..."
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-transparent text-sm"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isAvailable || isBooking}
                    className="w-full bg-[#0071c2] hover:bg-[#005a9c] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all"
                  >
                    {isBooking ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      'Reserve Now'
                    )}
                  </button>

                  {!user && (
                    <p className="text-xs text-center text-gray-500">
                      You won't be charged yet. Login required to book.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default RoomDetail;