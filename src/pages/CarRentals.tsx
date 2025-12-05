import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Phone,
  MessageCircle,
  Shield,
  CheckCircle2,
  ArrowRight,
  BadgeCheck,
  HeadphonesIcon,
  Banknote,
  ChevronRight,
  Search,
  Filter,
  Navigation,
  Loader2,
  Languages,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import AIOptimizedFAQ, { FAQItem } from "../components/SEO/AIOptimizedFAQ";
import { CarDriver, CarRoute, CarRoutePricing } from "@/types/carRentals";
import citiesData from "@/data/cities.json";

// Car rental FAQs for AI Search
const CarRentalFAQs: FAQItem[] = [
  {
    question: "How much does it cost to rent a car for Kedarnath trip?",
    answer: "Car rental prices for Kedarnath vary by vehicle type and route. Sedan (Swift Dzire/Etios) costs ₹12-15 per km. SUV (Innova/Ertiga) costs ₹18-22 per km. Tempo Traveller (12-17 seater) costs ₹25-35 per km. A typical Delhi-Kedarnath round trip (900 km) costs ₹15,000-25,000 for sedan and ₹22,000-35,000 for SUV including driver, fuel, and tolls."
  },
  {
    question: "Which car is best for Kedarnath road trip?",
    answer: "For Kedarnath, SUVs like Toyota Innova Crysta, Mahindra Scorpio, or Maruti Ertiga are recommended due to mountainous terrain. For families of 4-5, Innova offers the best comfort. For budget travelers (2-3 people), Swift Dzire works well. For groups of 8+, Tempo Traveller is most economical. All vehicles should have good ground clearance for hill roads."
  },
  {
    question: "Is self-drive car rental available for Kedarnath?",
    answer: "Self-drive is not recommended for Kedarnath due to challenging mountain roads, unpredictable weather, and steep gradients. Local drivers know the terrain, alternate routes during landslides, and safe stopping points. All our rentals include experienced drivers familiar with Char Dham routes. Driver charges and accommodation are included in the package."
  },
  {
    question: "What documents are needed to book a car for Kedarnath?",
    answer: "To book a car rental, you need: Valid ID proof (Aadhaar/PAN/Passport), contact number for booking confirmation, and advance payment (20-50% of total). For the journey, carry: Original ID proofs of all passengers, Char Dham registration (if applicable), and medical certificates for senior citizens. No driving license needed as all cars come with drivers."
  },
  {
    question: "Can I book a one-way car from Delhi to Kedarnath?",
    answer: "Yes, one-way drops are available but cost more than round trips. One-way Delhi to Gaurikund/Sonprayag costs approximately ₹8,000-12,000 for sedan and ₹12,000-18,000 for SUV. Round trip is more economical as it includes driver's return journey. For one-way, you pay for the vehicle's return (empty run) charges."
  },
  {
    question: "What is included in Kedarnath car rental packages?",
    answer: "Our car rental packages include: Vehicle with experienced driver, fuel costs, driver allowance (₹300-500/day), toll taxes, state permits, parking charges, and basic insurance. Night charges apply if driving after 10 PM. Accommodation for driver is your responsibility but we can arrange at nominal cost. AC is included but may not work on steep climbs."
  }
];

// Benefits
const benefits = [
  {
    icon: <BadgeCheck className="w-6 h-6" />,
    title: "Verified Drivers",
    description: "All drivers are verified with 5+ years mountain driving experience"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Full Insurance",
    description: "Comprehensive insurance coverage for worry-free travel"
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Round-the-clock assistance during your entire journey"
  },
  {
    icon: <Banknote className="w-6 h-6" />,
    title: "No Hidden Charges",
    description: "Transparent pricing with all costs included upfront"
  }
];

const CarRentals = () => {
  const [drivers, setDrivers] = useState<CarDriver[]>([]);
  const [routes, setRoutes] = useState<(CarRoute & { pricing: CarRoutePricing[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('car_drivers')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (driversError) throw driversError;

      // Fetch popular routes with pricing
      const { data: routesData, error: routesError } = await supabase
        .from('car_routes')
        .select(`
          *,
          pricing:car_route_pricing(*)
        `)
        .eq('is_active', true)
        .eq('is_popular', true)
        .order('distance_km', { ascending: true });

      if (routesError) throw routesError;

      setDrivers(driversData || []);
      setRoutes(routesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const message = `Hi! I want to book a car:\n\n📍 Pickup: ${pickupLocation || 'Not specified'}\n📍 Drop: ${dropLocation || 'Kedarnath'}\n📅 Date: ${pickupDate || 'Not specified'}\n\nPlease share available drivers and pricing.`;
    const whatsappUrl = `https://wa.me/919027475942?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.base_city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterArea === 'all' || 
      driver.service_areas.some(area => area.toLowerCase().includes(filterArea.toLowerCase()));
    
    return matchesSearch && matchesFilter;
  });

  // Schema for SEO
  const carRentalSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "name": "StayKedarnath Car Rentals",
    "description": "Hire experienced taxi drivers for Kedarnath Yatra - Choose from verified drivers with Sedan, SUV, Tempo Traveller",
    "url": "https://staykedarnath.in/car-rentals",
    "areaServed": {
      "@type": "Place",
      "name": "Uttarakhand, India"
    },
    "priceRange": "₹₹-₹₹₹",
    "telephone": "+91-9027475942"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Hire Taxi for Kedarnath Yatra | Verified Drivers with Cars</title>
        <meta name="description" content="Hire verified taxi drivers for Kedarnath trip from Delhi, Haridwar, Rishikesh. Choose experienced drivers with Sedan, SUV, Innova, Tempo Traveller. Book directly!" />
        <meta name="keywords" content="Kedarnath taxi driver, hire car with driver Kedarnath, Innova driver Kedarnath, tempo traveller Char Dham, Delhi to Kedarnath taxi" />
        <link rel="canonical" href="https://staykedarnath.in/car-rentals" />
        <meta property="og:title" content="Hire Taxi for Kedarnath Yatra | StayKedarnath" />
        <meta property="og:description" content="Book verified taxi drivers for your Kedarnath pilgrimage. Best prices, experienced drivers!" />
        <meta property="og:url" content="https://staykedarnath.in/car-rentals" />
        <script type="application/ld+json">{JSON.stringify(carRentalSchema)}</script>
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
              <Car className="w-3 h-3 mr-1" /> Trusted by 10,000+ Pilgrims
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Hire Taxi Drivers for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Kedarnath Yatra
              </span>
            </h1>
            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
              Choose from verified, experienced drivers. Book directly, travel safely.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pickup Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Select value={pickupLocation} onValueChange={setPickupLocation}>
                        <SelectTrigger className="pl-10 h-12 border-gray-200">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delhi">Delhi NCR</SelectItem>
                          <SelectItem value="haridwar">Haridwar</SelectItem>
                          <SelectItem value="rishikesh">Rishikesh</SelectItem>
                          <SelectItem value="dehradun">Dehradun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Destination</label>
                    <div className="relative">
                      <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Select value={dropLocation} onValueChange={setDropLocation}>
                        <SelectTrigger className="pl-10 h-12 border-gray-200">
                          <SelectValue placeholder="Where to?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kedarnath">Kedarnath</SelectItem>
                          <SelectItem value="badrinath">Badrinath</SelectItem>
                          <SelectItem value="chardham">Char Dham</SelectItem>
                          <SelectItem value="dodham">Do Dham</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Travel Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="pl-10 h-12 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleSearch}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Find Drivers
                    </Button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Verified Drivers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Direct Contact</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>No Middlemen</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Best Prices</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Popular Routes */}
      {routes.length > 0 && (
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Popular Routes</h2>
              <p className="text-gray-600">Pre-planned routes with transparent pricing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {routes.slice(0, 4).map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-0 shadow-md h-full">
                    <div className="relative h-32 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                      {route.image && (
                        <img
                          src={route.image}
                          alt={`${route.from_city} to ${route.to_city}`}
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <span className="font-semibold">{route.from_city}</span>
                          <ArrowRight className="w-4 h-4" />
                          <span className="font-semibold">{route.to_city}</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> {route.distance_km} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {route.duration_hours} hrs
                        </span>
                      </div>
                      {route.pricing && route.pricing.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Starting from</p>
                          <p className="text-xl font-bold text-blue-600">
                            ₹{Math.min(...route.pricing.map(p => p.one_way_price)).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Driver Profiles */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Verified Drivers</h2>
              <p className="text-gray-600">Choose a driver and book directly</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="kedarnath">Kedarnath</SelectItem>
                  <SelectItem value="badrinath">Badrinath</SelectItem>
                  <SelectItem value="char dham">Char Dham</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-20">
              <Car className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Drivers Found</h3>
              <p className="text-gray-500 mb-6">
                {drivers.length === 0 
                  ? "We're currently onboarding drivers. Contact us for bookings!"
                  : "Try adjusting your search filters"}
              </p>
              <Button onClick={() => window.open('https://wa.me/919027475942', '_blank')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact for Booking
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    {/* Driver Header */}
                    <div className="relative h-24 bg-gradient-to-r from-blue-600 to-blue-800">
                      {driver.cover_image && (
                        <img src={driver.cover_image} alt="" className="w-full h-full object-cover opacity-30" />
                      )}
                      {driver.is_featured && (
                        <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-900">
                          <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="pt-0 pb-6 px-6">
                      {/* Profile Photo */}
                      <div className="flex items-end gap-4 -mt-10 mb-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                            {driver.photo ? (
                              <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                {driver.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          {driver.is_verified && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="pb-1">
                          <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {driver.base_city}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{driver.rating}</span>
                          <span className="text-sm text-gray-400">({driver.total_reviews})</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.experience_years}+ years exp
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.total_trips} trips
                        </div>
                      </div>

                      {/* Bio */}
                      {driver.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{driver.bio}</p>
                      )}

                      {/* Service Areas */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {driver.service_areas.slice(0, 3).map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                            {area}
                          </Badge>
                        ))}
                        {driver.service_areas.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100">
                            +{driver.service_areas.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Languages */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Languages className="w-4 h-4" />
                        <span>{driver.languages.join(', ')}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const message = `Hi ${driver.name}! I found your profile on StayKedarnath and would like to book a taxi for my Kedarnath trip. Please share your availability and rates.`;
                            window.open(`https://wa.me/${driver.whatsapp || driver.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${driver.phone}`}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Link to={`/car-rentals/driver/${driver.slug}`}>
                          <Button variant="outline">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-blue-600">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Why Book With Us?</h2>
            <p className="text-blue-100">Direct booking with verified drivers - no middlemen, no extra charges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-blue-100 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">Book your taxi in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Choose a Driver",
                description: "Browse verified driver profiles, check ratings and reviews"
              },
              {
                step: "02",
                title: "Contact Directly",
                description: "WhatsApp or call the driver to discuss your trip details"
              },
              {
                step: "03",
                title: "Confirm & Travel",
                description: "Agree on price, pay advance, and enjoy your journey!"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className="text-5xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-blue-200" />
                )}
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Taxi Services by City - Internal Linking for SEO */}
      <section className="py-16 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Taxi Services by City
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find taxi services from all major cities on the Kedarnath route. Click on your pickup city for detailed pricing.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(citiesData as any[])
              .filter(city => city.base_taxi_price > 0)
              .sort((a, b) => a.position_on_route - b.position_on_route)
              .map((city, index) => (
                <motion.div
                  key={city.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/taxi/${city.slug}`}>
                    <Card className="hover:shadow-lg transition-all group cursor-pointer border-2 hover:border-blue-300 h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <Car className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {city.name}
                            </h3>
                            {city.is_major_hub && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">Major Hub</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {city.distance_from_kedarnath}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-gray-500">From</span>
                          <span className="font-bold text-blue-600">₹{city.base_taxi_price.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-slate-900 to-blue-900">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Want to List Your Taxi Service?
              </h2>
              <p className="text-blue-200">
                Join our network of verified drivers and get more bookings
              </p>
            </div>
            <Link to="/driver-registration">
              <Button 
                size="lg" 
                className="bg-white text-blue-900 hover:bg-blue-50"
              >
                <Car className="w-4 h-4 mr-2" />
                Register as Driver
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <Container>
          <AIOptimizedFAQ
            title="Car Rental FAQs - Kedarnath Yatra"
            description="Everything you need to know about hiring a taxi for your Kedarnath pilgrimage"
            faqs={CarRentalFAQs}
          />
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default CarRentals;
