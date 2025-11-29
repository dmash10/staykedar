import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { format, addDays, differenceInDays } from 'date-fns';
import { Calendar, Users, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
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

  if (loading) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-gray-50 py-8">
          <Container>
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              {error || 'Room not found'}
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
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

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white pt-6 pb-4 shadow-sm">
          <Container>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">{room.name}</h1>
                <p className="text-gray-600 mb-2">at {property.name}</p>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-gray-600">{property.address || 'Location not specified'}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-bold text-[#0071c2]">
                  {formatPrice(room.price)}
                  <span className="text-sm font-normal text-gray-500"> / night</span>
                </div>
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-gray-200 h-64 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-gray-500">Room Images Coming Soon</span>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-gray-700">
                  {room.description || `This comfortable ${room.room_type} room offers a relaxing atmosphere for your stay. 
                    The room can accommodate up to ${room.capacity} guests and is equipped with 
                    all necessary amenities for a pleasant experience.`}
                </p>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Book Your Stay</h2>

                <form onSubmit={handleBookingSubmit}>
                  <div className="mb-4">
                    <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Calendar className="h-5 w-5 text-gray-400 ml-3" />
                      <input
                        type="date"
                        id="checkIn"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full p-2 border-0 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Calendar className="h-5 w-5 text-gray-400 ml-3" />
                      <input
                        type="date"
                        id="checkOut"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn}
                        className="w-full p-2 border-0 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDateChange}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded mb-4"
                  >
                    Check Availability
                  </button>

                  <div className="mb-4">
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Users className="h-5 w-5 text-gray-400 ml-3" />
                      <select
                        id="guests"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full p-2 border-0 focus:outline-none focus:ring-0"
                      >
                        {Array.from({ length: room.capacity }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests
                    </label>
                    <textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requests or preferences?"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    ></textarea>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">
                        {formatPrice(room.price)} x {totalNights} nights
                      </span>
                      <span className="font-medium">{formatPrice(room.price * totalNights)}</span>
                    </div>

                    <div className="border-t border-gray-200 my-2"></div>

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-[#0071c2]">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {isAvailable ? (
                    <div className="flex items-center text-green-600 mb-4">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Room is available for selected dates</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 mb-4">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span>Room is not available for selected dates</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!isAvailable || isBooking}
                    className="w-full bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      'Book Now'
                    )}
                  </button>

                  {!user && (
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/auth?redirect=' + encodeURIComponent(`/stays/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`))}
                        className="text-blue-600 hover:underline"
                      >
                        Login
                      </button> to book this room
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