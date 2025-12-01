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

        const userBookings = await stayService.getBookingsForCustomer(user.id);

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
    const styles = {
      [BOOKING_STATUSES.CONFIRMED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
      [BOOKING_STATUSES.PENDING]: "bg-amber-100 text-amber-700 border-amber-200",
      [BOOKING_STATUSES.CANCELLED]: "bg-rose-100 text-rose-700 border-rose-200",
      [BOOKING_STATUSES.CHECKED_IN]: "bg-indigo-100 text-indigo-700 border-indigo-200",
      [BOOKING_STATUSES.CHECKED_OUT]: "bg-slate-100 text-slate-700 border-slate-200",
    };

    const icons = {
      [BOOKING_STATUSES.CONFIRMED]: CheckCircle,
      [BOOKING_STATUSES.PENDING]: AlertTriangle,
      [BOOKING_STATUSES.CANCELLED]: XCircle,
      [BOOKING_STATUSES.CHECKED_IN]: MapPin,
      [BOOKING_STATUSES.CHECKED_OUT]: CheckCircle,
    };

    const Icon = icons[status] || Info;
    const style = styles[status] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-slate-50 py-12">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
              <p className="text-slate-500 mt-2">Manage your upcoming stays and view booking history</p>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 inline-flex mb-8">
              {(['upcoming', 'past', 'canceled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 animate-pulse">Loading your bookings...</p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-900 mb-1">Unable to load bookings</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && getFilteredBookings().length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  {activeTab === 'upcoming' && "You don't have any upcoming trips planned. Time to explore?"}
                  {activeTab === 'past' && "Your travel history is empty. Start making memories!"}
                  {activeTab === 'canceled' && "No cancelled bookings to show."}
                </p>
                <button
                  onClick={() => navigate('/stays')}
                  className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Explore Stays
                </button>
              </div>
            )}

            {!loading && !error && getFilteredBookings().length > 0 && (
              <div className="space-y-6">
                {getFilteredBookings().map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section */}
                      <div className="md:w-72 h-48 md:h-auto relative bg-slate-100 shrink-0">
                        {booking.property?.images?.[0] ? (
                          <img
                            src={booking.property.images[0]}
                            alt={booking.property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <MapPin className="h-10 w-10 opacity-20" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {booking.property?.name || 'Unknown Property'}
                              </h3>
                              <div className="flex items-center text-slate-500 text-sm mt-1">
                                <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                                <span className="line-clamp-1">{booking.property?.address || 'Address not available'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-slate-900">
                                {formatPrice(booking.total_price)}
                              </div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Total Amount</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="text-xs text-slate-500 font-medium uppercase mb-1">Check-in</div>
                              <div className="font-semibold text-slate-900 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                {format(parseISO(booking.check_in_date), 'EEE, dd MMM yyyy')}
                              </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="text-xs text-slate-500 font-medium uppercase mb-1">Check-out</div>
                              <div className="font-semibold text-slate-900 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                {format(parseISO(booking.check_out_date), 'EEE, dd MMM yyyy')}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                            {booking.room && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
                                {booking.room.room_type} Room
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
                              {booking.room?.capacity || 2} Guests
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => booking.room && navigate(`/stays/${booking.room.id}`)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              View Property
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => copyBookingDetails(booking)}
                              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center"
                            >
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                              Copy Details
                            </button>
                          </div>

                          {booking.status === BOOKING_STATUSES.CONFIRMED && activeTab === 'upcoming' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default UserBookings;