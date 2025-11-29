import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isAfter } from 'date-fns';
import { Calendar, CheckCircle, Loader2, XCircle, AlertTriangle, Copy, Info, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { Booking, Room, Property, BOOKING_STATUSES } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';

type BookingWithDetails = Booking & {
  room?: Room;
  property?: Property;
};

const UserBookings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'canceled'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user bookings
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/dashboard/bookings');
      return;
    }

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const userBookings = await stayService.getBookings(user.id);

        const bookingsWithDetails = await Promise.all(
          userBookings.map(async (booking) => {
            try {
              const room = await stayService.getRoom(booking.room_id);
              let property = null;

              if (room) {
                property = await stayService.getProperty(room.property_id);
              }

              return {
                ...booking,
                room,
                property
              };
            } catch (err) {
              console.error('Error fetching details for booking:', booking.id, err);
              return booking;
            }
          })
        );

        setBookings(bookingsWithDetails);

      } catch (err) {
        console.error('Error loading bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your bookings');
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, navigate, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await stayService.updateBookingStatus(bookingId, BOOKING_STATUSES.CANCELLED);

      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: BOOKING_STATUSES.CANCELLED }
            : booking
        )
      );

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast({
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : 'Failed to cancel booking. Please try again.',
        variant: "destructive",
      });
    }
  };

  const copyBookingDetails = (booking: BookingWithDetails) => {
    if (!booking.room || !booking.property) return;

    const detailsText = `
Booking Reference: ${booking.id}
Property: ${booking.property.name}
Room: ${booking.room.name}
Check-in: ${format(parseISO(booking.check_in_date), 'dd MMM yyyy')}
Check-out: ${format(parseISO(booking.check_out_date), 'dd MMM yyyy')}
Total Price: ${formatPrice(booking.total_price)}
Status: ${booking.status}
    `.trim();

    navigator.clipboard.writeText(detailsText);

    toast({
      title: "Copied to Clipboard",
      description: "Booking details have been copied to your clipboard",
    });
  };

  const getFilteredBookings = () => {
    const today = new Date();

    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(booking =>
          (booking.status === BOOKING_STATUSES.CONFIRMED || booking.status === BOOKING_STATUSES.PENDING) &&
          isAfter(parseISO(booking.check_in_date), today)
        );
      case 'past':
        return bookings.filter(booking =>
          booking.status !== BOOKING_STATUSES.CANCELLED &&
          !isAfter(parseISO(booking.check_out_date), today)
        );
      case 'canceled':
        return bookings.filter(booking =>
          booking.status === BOOKING_STATUSES.CANCELLED
        );
      default:
        return bookings;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BOOKING_STATUSES.CONFIRMED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case BOOKING_STATUSES.PENDING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case BOOKING_STATUSES.CANCELLED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      case BOOKING_STATUSES.COMPLETED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Info className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50 py-8">
        <Container>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-gray-600">View and manage your stay bookings</p>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'past'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'canceled'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('canceled')}
            >
              Cancelled
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && getFilteredBookings().length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'upcoming' && "You don't have any upcoming bookings."}
                {activeTab === 'past' && "You don't have any past bookings."}
                {activeTab === 'canceled' && "You don't have any cancelled bookings."}
              </p>
              <button
                onClick={() => navigate('/stays')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Stays
              </button>
            </div>
          )}

          {!loading && !error && getFilteredBookings().length > 0 && (
            <div className="space-y-6">
              {getFilteredBookings().map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        {getStatusBadge(booking.status)}
                        <span className="ml-3 text-sm text-gray-500">Booking ID: {booking.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {booking.room?.name || 'Room'} at {booking.property?.name || 'Unknown Property'}
                      </h3>
                      {booking.property?.address && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{booking.property.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <div className="text-xl font-bold text-[#0071c2]">
                        {formatPrice(booking.total_price)}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-4 sm:px-6 sm:py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Stay Details</h4>
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm mb-1">
                            <span className="font-medium">Check-in:</span> {format(parseISO(booking.check_in_date), 'EEEE, dd MMM yyyy')}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Check-out:</span> {format(parseISO(booking.check_out_date), 'EEEE, dd MMM yyyy')}
                          </div>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Special Requests</h4>
                          <p className="text-sm text-gray-700">{booking.special_requests}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      {booking.room && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Room Information</h4>
                          <p className="text-sm text-gray-700">
                            {booking.room.room_type.charAt(0).toUpperCase() + booking.room.room_type.slice(1)} room
                          </p>
                          <p className="text-sm text-gray-700">
                            Accommodates up to {booking.room.capacity} guests
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap space-x-2">
                        {booking.status === BOOKING_STATUSES.CONFIRMED &&
                          activeTab === 'upcoming' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </button>
                          )}

                        <button
                          onClick={() => booking.room && navigate(`/stays/${booking.room.id}`)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          <Info className="h-3.5 w-3.5 mr-1" />
                          View Room
                        </button>

                        <button
                          onClick={() => copyBookingDetails(booking)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-50 hover:bg-gray-100"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default UserBookings;