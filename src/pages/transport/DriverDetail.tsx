import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Container from "../../components/Container";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Calendar,
  Users,
  Star,
  Phone,
  MessageCircle,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Languages,
  Award,
  Clock,
  Fuel,
  Briefcase,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CarDriver, CarVehicle, CarReview } from "@/types/carRentals";
import { generateBreadcrumbSchema } from "@/components/SEO/SchemaMarkup";

const DriverDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [driver, setDriver] = useState<CarDriver | null>(null);
  const [vehicles, setVehicles] = useState<CarVehicle[]>([]);
  const [reviews, setReviews] = useState<CarReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    pickup: '',
    drop: 'Kedarnath',
    date: '',
    passengers: '2',
    vehicleType: '',
    message: ''
  });

  useEffect(() => {
    if (slug) {
      fetchDriverData();
    }
  }, [slug]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);

      // Fetch driver
      const { data: driverData, error: driverError } = await supabase
        .from('car_drivers')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (driverError) throw driverError;
      setDriver(driverData);

      // Fetch vehicles
      const { data: vehiclesData } = await supabase
        .from('car_vehicles')
        .select('*')
        .eq('driver_id', driverData.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      setVehicles(vehiclesData || []);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('car_reviews')
        .select('*')
        .eq('driver_id', driverData.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10);

      setReviews(reviewsData || []);

    } catch (error) {
      console.error('Error fetching driver:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = () => {
    if (!driver) return;

    const message = `Hi ${driver.name}! 👋

I found your profile on StayKedarnath and would like to book a taxi.

📋 *Booking Details:*
👤 Name: ${bookingForm.name}
📞 Phone: ${bookingForm.phone}
📍 Pickup: ${bookingForm.pickup}
📍 Drop: ${bookingForm.drop}
📅 Date: ${bookingForm.date}
👥 Passengers: ${bookingForm.passengers}
🚗 Vehicle: ${bookingForm.vehicleType === 'any' || !bookingForm.vehicleType ? 'Any' : bookingForm.vehicleType}

${bookingForm.message ? `💬 Message: ${bookingForm.message}` : ''}

Please confirm availability and share the price.`;

    window.open(`https://wa.me/${(driver.whatsapp || driver.phone).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <Container className="py-32 text-center">
          <Car className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Driver Not Found</h1>
          <p className="text-gray-500 mb-6">The driver profile you're looking for doesn't exist.</p>
          <Link to="/car-rentals">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Drivers
            </Button>
          </Link>
        </Container>
        <Footer />
      </div>
    );
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://staykedarnath.in' },
    { name: 'Car Rentals', url: 'https://staykedarnath.in/car-rentals' },
    { name: driver.name, url: `https://staykedarnath.in/car-rentals/driver/${driver.slug}` }
  ]);

  const driverSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${driver.name} - Taxi Service`,
    "description": driver.bio || `Professional taxi driver for Kedarnath Yatra with ${driver.experience_years}+ years experience`,
    "url": `https://staykedarnath.in/car-rentals/driver/${driver.slug}`,
    "telephone": driver.phone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": driver.base_city,
      "addressRegion": "Uttarakhand",
      "addressCountry": "IN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": driver.rating,
      "reviewCount": driver.total_reviews
    },
    "areaServed": driver.service_areas.map(area => ({
      "@type": "Place",
      "name": area
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{driver.name} - Taxi Driver for Kedarnath | StayKedarnath</title>
        <meta name="description" content={`Book ${driver.name} for your Kedarnath trip. ${driver.experience_years}+ years experience, ${driver.rating} rating. Services: ${driver.service_areas.join(', ')}`} />
        <link rel="canonical" href={`https://staykedarnath.in/car-rentals/driver/${driver.slug}`} />
        <script type="application/ld+json">{JSON.stringify(driverSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Nav />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16">
        <Container>
          <Link to="/car-rentals" className="inline-flex items-center text-blue-300 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Drivers
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:w-1/3"
            >
              <Card className="overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800">
                  {driver.cover_image && (
                    <img src={driver.cover_image} alt="" className="w-full h-full object-cover opacity-30" />
                  )}
                  {driver.is_featured && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-900">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                    </Badge>
                  )}
                </div>

                <CardContent className="pt-0 pb-6 px-6 text-center">
                  <div className="relative -mt-16 mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg mx-auto">
                      {driver.photo ? (
                        <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                          {driver.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {driver.is_verified && (
                      <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-green-500 rounded-full p-1.5">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{driver.name}</h1>
                  <p className="text-gray-500 flex items-center justify-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" /> {driver.base_city}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y">
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xl font-bold">{driver.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{driver.total_reviews} reviews</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{driver.experience_years}+</p>
                      <p className="text-xs text-gray-500">Years Exp</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{driver.total_trips}</p>
                      <p className="text-xs text-gray-500">Trips</p>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        const message = `Hi ${driver.name}! I found your profile on StayKedarnath and would like to know more about your taxi services for Kedarnath trip.`;
                        window.open(`https://wa.me/${(driver.whatsapp || driver.phone).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `tel:${driver.phone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {driver.phone}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:w-2/3 space-y-6"
            >
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {driver.bio ? (
                    <p className="text-gray-600">{driver.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      Professional taxi driver with {driver.experience_years}+ years of experience
                      serving pilgrims on {driver.service_areas.join(', ')} routes.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Service Areas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {driver.service_areas.map((area) => (
                          <Badge key={area} variant="secondary">{area}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Languages className="w-4 h-4" /> Languages
                      </h4>
                      <p className="text-gray-700">{driver.languages.join(', ')}</p>
                    </div>
                  </div>

                  {driver.is_verified && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Verified Driver</p>
                        <p className="text-sm text-green-600">
                          This driver has been verified by StayKedarnath team for authenticity and reliability.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicles */}
              {vehicles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Available Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {vehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${vehicle.is_primary ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
                        >
                          <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {vehicle.images?.[0] ? (
                              <img src={vehicle.images[0]} alt={vehicle.vehicle_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{vehicle.vehicle_name}</h4>
                              <Badge variant="secondary">{vehicle.vehicle_type}</Badge>
                              {vehicle.is_primary && <Badge className="bg-blue-600">Primary</Badge>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {vehicle.capacity} seats
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> {vehicle.luggage_capacity} bags
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {vehicle.features.map((feature) => (
                                <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Starting</p>
                            <p className="text-xl font-bold text-blue-600">₹{vehicle.price_per_km}/km</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Booking Form & Reviews */}
      <section className="py-12">
        <Container>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Book This Driver</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Your Name</label>
                      <Input
                        placeholder="Full name"
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone</label>
                      <Input
                        placeholder="+91 9876543210"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Pickup Location</label>
                      <Select value={bookingForm.pickup} onValueChange={(v) => setBookingForm({ ...bookingForm, pickup: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delhi">Delhi NCR</SelectItem>
                          <SelectItem value="Haridwar">Haridwar</SelectItem>
                          <SelectItem value="Rishikesh">Rishikesh</SelectItem>
                          <SelectItem value="Dehradun">Dehradun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Destination</label>
                      <Select value={bookingForm.drop} onValueChange={(v) => setBookingForm({ ...bookingForm, drop: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Where to?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kedarnath">Kedarnath</SelectItem>
                          <SelectItem value="Badrinath">Badrinath</SelectItem>
                          <SelectItem value="Char Dham">Char Dham</SelectItem>
                          <SelectItem value="Do Dham">Do Dham</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Travel Date</label>
                      <Input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Passengers</label>
                      <Select value={bookingForm.passengers} onValueChange={(v) => setBookingForm({ ...bookingForm, passengers: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'person' : 'people'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {vehicles.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Preferred Vehicle</label>
                      <Select value={bookingForm.vehicleType} onValueChange={(v) => setBookingForm({ ...bookingForm, vehicleType: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any vehicle</SelectItem>
                          {vehicles.map(v => (
                            <SelectItem key={v.id} value={v.vehicle_name}>{v.vehicle_name} ({v.vehicle_type})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Message (Optional)</label>
                    <Textarea
                      placeholder="Any specific requirements..."
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={handleBookingSubmit}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Booking Request via WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Reviews
                    <Badge variant="secondary">{driver.total_reviews}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-500">No reviews yet</p>
                      <p className="text-sm text-gray-400">Be the first to review after your trip!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {review.customer_name.charAt(0)}
                              </div>
                              <span className="font-medium">{review.customer_name}</span>
                              {review.is_verified && (
                                <Badge variant="secondary" className="text-xs">Verified Trip</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-gray-600 text-sm">{review.review_text}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(review.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default DriverDetail;


