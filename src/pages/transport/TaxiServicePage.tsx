/**
 * TaxiServicePage.tsx - Programmatic SEO Page for Taxi Services
 * 
 * URL Pattern: /taxi/[city-slug]
 * Example: /taxi/haridwar, /taxi/rudraprayag
 * 
 * This page is dynamically generated based on city data.
 * Key SEO features:
 * - FAQPage Schema for AI Overview visibility
 * - TaxiService Schema for rich results
 * - Breadcrumb Schema for site structure
 * - City-specific content (not duplicate)
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Clock,
  Users,
  Phone,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Navigation,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Shield,
  Banknote,
  HeadphonesIcon,
  BadgeCheck,
  Mountain,
  Info,
  Flame,
  ArrowLeftRight,
  Loader2,
  Plane,
  Train,
  Route,
  Calendar,
  CloudSun,
  Utensils,
  BookOpen,

  Map,
  Download,
  FileText
} from "lucide-react";

import { PDFDownloadLink } from "@react-pdf/renderer";
import CityGuidePDF from "@/components/pdf/CityGuidePDF";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIOptimizedFAQ, { FAQItem } from "@/components/SEO/AIOptimizedFAQ";
import { supabase } from "@/integrations/supabase/client";

// Import fallback data (used if Supabase fails)
import citiesDataJson from "@/data/cities.json";
import servicesData from "@/data/services.json";
import {
  generateTaxiServiceSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  combineSchemas
} from "@/utils/seoSchemas";

// Types
interface TaxiRates {
  drop_sonprayag_sedan: number;
  drop_sonprayag_suv: number;
  drop_sonprayag_tempo: number;
  per_km_rate_plains: number;
  per_km_rate_hills: number;
  min_km_per_day: number;
  driver_allowance: number;
  note?: string;
}

interface CityData {
  slug: string;
  name: string;
  type: string;
  meta_title?: string;
  state: string;
  coordinates?: { lat: number; lng: number };
  images?: string[];
  connectivity?: {
    next_stop: string | null;
    distance_to_next: string | null;
    nearest_airport: string;
    nearest_railway: string;
  };
  distance_from_delhi: string;
  distance_from_kedarnath: string;
  elevation: string;
  position_on_route: number;
  is_major_hub: boolean;
  taxi_rates: TaxiRates;
  description: string;
  special_info?: string;
  nearby_attractions?: string[];
  taxi_tip?: string;
  stay_vibe?: string;
  highlight_tag?: string;
  avg_hotel_price?: string;
  warning_tip?: string;
  alert?: string;
  faqs?: { question: string; answer: string }[];
  // Rich content fields
  taxi_hero_title?: string;
  taxi_hero_description?: string;
  long_description?: string;
  how_to_reach?: string;
  best_time_to_visit?: string;
  weather_info?: string;
  local_food?: string;
  history?: string;
  route_description?: string;
}

// Generic fallback tip
const genericTip = "Book your return taxi in advance as network connectivity is poor in the mountains.";

// Get fallback image based on index
const getFallbackImage = (index: number) => {
  const images = [
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
  ];
  return images[index % images.length];
};

const TaxiServicePage = () => {
  const { lang, citySlug } = useParams<{ lang?: string; citySlug: string }>();
  // Validate language
  const currentLang = ['hi', 'ta', 'te', 'kn', 'ml'].includes(lang || '') ? lang : null;

  const [city, setCity] = useState<CityData | null>(null);
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const taxiService = servicesData.taxi;

  // Lead Capture State
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!leadPhone || leadPhone.length < 10) {
        throw new Error("Please enter a valid phone number");
      }

      // Save lead to Supabase
      const { error } = await supabase.from("leads").insert({
        phone: leadPhone,
        name: leadName,
        city_slug: citySlug,
        lead_type: "offline_guide_pdf",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your guide is ready to download!",
      });

      // Close dialog after a short delay (user will click the download link inside)
      // Actually, we want them to click the download link which will be revealed
    } catch (error: any) {
      console.error("Error saving lead:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch city data from Supabase
  useEffect(() => {
    const fetchCityData = async () => {
      setLoading(true);
      try {
        // Fetch current city
        const { data: cityData, error: cityError } = await supabase
          .from('seo_cities')
          .select('*')
          .eq('slug', citySlug)
          .eq('is_active', true)
          .single();

        if (cityError || !cityData) {
          // Fallback to JSON data
          const jsonCity = (citiesDataJson as CityData[]).find(c => c.slug === citySlug);
          if (jsonCity) {
            setCity(jsonCity);
            setAllCities(citiesDataJson as CityData[]);
          } else {
            setError(true);
          }
        } else {
          // Vernacular Logic
          let description = cityData.description;
          let meta_title = cityData.meta_title;
          let faqs = cityData.faqs;

          if (currentLang) {
            description = cityData[`description_${currentLang}`] || cityData.description; // Fallback to English
            meta_title = cityData[`meta_title_${currentLang}`] || cityData.meta_title;
            faqs = cityData[`faq_${currentLang}`] || cityData.faqs;
            // Note: Meta description etc can be added similarly
          }

          // Transform Supabase data to match component interface
          const transformedCity: CityData = {
            ...cityData,
            description: description, // Override with localized
            meta_title: meta_title,
            coordinates: cityData.coordinates as { lat: number; lng: number },
            connectivity: cityData.connectivity as CityData['connectivity'],
            taxi_rates: cityData.taxi_rates as TaxiRates,
            faqs: faqs as { question: string; answer: string }[],
            is_major_hub: cityData.is_featured || false,
            distance_from_delhi: '',
            distance_from_kedarnath: cityData.connectivity?.distance_to_next || '',
          };
          setCity(transformedCity);

          // Fetch all cities for navigation
          const { data: allCitiesData } = await supabase
            .from('seo_cities')
            .select('*')
            .eq('is_active', true)
            .order('position_on_route', { ascending: true });

          if (allCitiesData) {
            const transformedCities = allCitiesData.map(c => ({
              ...c,
              coordinates: c.coordinates as { lat: number; lng: number },
              connectivity: c.connectivity as CityData['connectivity'],
              taxi_rates: c.taxi_rates as TaxiRates,
              faqs: c.faqs as { question: string; answer: string }[],
              is_major_hub: c.is_featured || false,
              distance_from_delhi: '',
              distance_from_kedarnath: c.connectivity?.distance_to_next || '',
            }));
            setAllCities(transformedCities);
          }
        }
      } catch (err) {
        console.error('Error fetching city:', err);
        // Fallback to JSON
        const jsonCity = (citiesDataJson as CityData[]).find(c => c.slug === citySlug);
        if (jsonCity) {
          setCity(jsonCity);
          setAllCities(citiesDataJson as CityData[]);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (citySlug) {
      fetchCityData();
    }
  }, [citySlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading taxi services...</p>
        </div>
      </div>
    );
  }

  // 404 if city not found
  if (error || !city) {
    return <Navigate to="/car-rentals" replace />;
  }

  // Get next and previous cities for navigation
  const nextCity = city.connectivity?.next_stop
    ? allCities.find(c => c.name === city.connectivity?.next_stop || c.slug === city.connectivity?.next_stop?.toLowerCase().replace(/\s+/g, '-'))
    : null;

  const prevCity = allCities.find(
    c => c.connectivity?.next_stop === city.name || c.connectivity?.next_stop === city.slug
  );

  // Get nearby cities for related routes
  const nearbyCities = allCities
    .filter(c => c.slug !== citySlug && c.is_major_hub && c.taxi_rates?.drop_sonprayag_sedan > 0)
    .sort((a, b) => a.position_on_route - b.position_on_route)
    .slice(0, 4);

  // Use city-specific taxi rates (not calculated multipliers)
  const sedanPrice = city.taxi_rates?.drop_sonprayag_sedan || 0;
  const suvPrice = city.taxi_rates?.drop_sonprayag_suv || 0;
  const tempoPrice = city.taxi_rates?.drop_sonprayag_tempo || Math.round(suvPrice * 1.5);

  // Check if this is a hill area (elevation > 1500m)
  const isHillArea = parseInt(city.elevation) > 1500;

  // Check if taxi service is available (price > 0)
  const hasTaxiService = sedanPrice > 0;

  // Generate SEO data
  // Use custom titles if available, otherwise use templates
  const pageTitle = city.meta_title || city.taxi_hero_title || taxiService.title_template.replace("{city}", city.name);
  const pageDescription = city.taxi_hero_description || taxiService.description_template.replace("{city}", city.name);
  const pageH1 = city.taxi_hero_title || taxiService.h1_template.replace("{city}", city.name);
  const canonicalUrl = `https://staykedarnath.in/taxi/${city.slug}`;

  // Generate schemas
  const taxiSchema = hasTaxiService
    ? generateTaxiServiceSchema(city, city.taxi_rates, taxiService.vehicle_types)
    : null;
  const faqSchema = city.faqs ? generateFAQSchema(city.faqs) : null;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://staykedarnath.in" },
    { name: "Taxi Services", url: "https://staykedarnath.in/car-rentals" },
    { name: `Taxi in ${city.name}`, url: canonicalUrl }
  ]);

  const allSchemas = combineSchemas(taxiSchema, faqSchema, breadcrumbSchema);

  // Convert faqs to FAQItem format
  const cityFaqs: FAQItem[] = city.faqs?.map(f => ({
    question: f.question,
    answer: f.answer
  })) || [];

  // Display tip (with fallback)
  const displayTip = city.taxi_tip || genericTip;

  const handleWhatsAppEnquiry = (vehicleType?: string) => {
    const message = vehicleType
      ? `Hi! I want to book a ${vehicleType} taxi from ${city.name} for Kedarnath trip. Please share availability and rates.`
      : `Hi! I need taxi service from ${city.name} for Kedarnath Yatra. Please share available options.`;
    window.open(`https://wa.me/919027475942?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{pageTitle} | StayKedarnath</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${city.name} taxi, ${city.name} car rental, ${city.name} to Kedarnath taxi, cab service ${city.name}, taxi service ${city.name}`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`Taxi from ${city.name} to Kedarnath: 2025 Rates & Route`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`/api/og/taxi-rate?from=${encodeURIComponent(city.name)}&to=Kedarnath&price=${sedanPrice}&distance=${encodeURIComponent(city.distance_from_kedarnath)}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`/api/og/taxi-rate?from=${encodeURIComponent(city.name)}&to=Kedarnath&price=${sedanPrice}&distance=${encodeURIComponent(city.distance_from_kedarnath)}`} />

        {/* JSON-LD Schemas - Critical for AI Search */}
        {allSchemas && (
          <script type="application/ld+json">
            {JSON.stringify(allSchemas)}
          </script>
        )}
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/car-rentals" className="hover:text-white transition-colors">Taxi Services</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{city.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <MapPin className="w-3 h-3 mr-1" /> {city.state}
              </Badge>
              {city.highlight_tag && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  {city.highlight_tag}
                </Badge>
              )}
              {city.type && (
                <Badge className="bg-white/10 text-white/70 border-white/20">
                  {city.type}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {pageH1}
            </h1>

            <p className="text-xl text-blue-100/80 mb-6">
              {city.description}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                <Navigation className="w-4 h-4" />
                <span>{city.distance_from_kedarnath} to Kedarnath</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                <Mountain className="w-4 h-4" />
                <span>{city.elevation} Elevation</span>
              </div>
              {city.is_major_hub && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Major Hub
                </Badge>
              )}
            </div>

            {/* Next Stop Navigation - NEW */}
            {nextCity && (
              <Link to={`/taxi/${nextCity.slug}`}>
                <div className="inline-flex items-center gap-3 px-4 py-3 mb-6 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer group">
                  <ArrowLeftRight className="w-5 h-5 text-blue-300" />
                  <div>
                    <p className="text-xs text-blue-200">Next Stop on Route</p>
                    <p className="text-white font-semibold group-hover:text-blue-200">
                      {nextCity.name} ({city.connectivity?.distance_to_next})
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}

            {/* Social Proof / Urgency - NEW */}
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-200 text-sm mb-6 w-fit">
              <Flame className="w-4 h-4" />
              <span>12 people booked from {city.name} today</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleWhatsAppEnquiry()}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Quote on WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => window.location.href = 'tel:+919027475942'}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>

            {/* Download Rate Card - NEW */}
            <div className="mt-6">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  const url = `/api/og/taxi-rate?from=${encodeURIComponent(city.name)}&to=Kedarnath&price=${sedanPrice}&distance=${encodeURIComponent(city.distance_from_kedarnath)}`;
                  window.open(url, '_blank');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Rate Card
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Offline Guide Lead Magnet FAB */}
      {city && (
        <div className="fixed bottom-6 right-6 z-50">
          <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 h-14 animate-bounce hover:animate-none"
              >
                <FileText className="w-5 h-5 mr-2" />
                Download Offline Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Download {city.name} Travel Guide</DialogTitle>
                <DialogDescription>
                  Get the complete offline PDF with taxi rates, hotel contacts, and emergency numbers.
                </DialogDescription>
              </DialogHeader>

              {!leadPhone || submitting ? (
                <form onSubmit={handleLeadSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Your Name"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      required
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      Get Free Guide
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Success!</h3>
                    <p className="text-gray-500">Your number is saved. Download your guide now.</p>
                  </div>

                  <PDFDownloadLink
                    document={<CityGuidePDF city={city} />}
                    fileName={`${city.slug}-travel-guide.pdf`}
                    className="w-full"
                  >
                    {({ loading }) => (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {loading ? "Preparing PDF..." : "Download PDF Now"}
                      </Button>
                    )}
                  </PDFDownloadLink>

                  <Button variant="ghost" size="sm" onClick={() => { setIsGuideOpen(false); setLeadPhone(""); }}>
                    Close
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Alert Banner (if applicable) */}
      {(city.warning_tip || city.alert) && (
        <section className="bg-amber-50 border-y border-amber-200">
          <Container className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                {city.warning_tip && (
                  <p className="text-amber-800 font-medium">{city.warning_tip}</p>
                )}
                {city.alert && (
                  <p className="text-amber-700 text-sm mt-1">{city.alert}</p>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Vehicle Options */}
      {hasTaxiService ? (
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Available Vehicles from {city.name}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our range of well-maintained vehicles with experienced drivers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sedan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Car className="w-8 h-8 text-blue-600" />
                      </div>
                      <Badge variant="secondary">Most Popular</Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">Sedan</h3>
                    <p className="text-gray-500 text-sm mb-4">Swift Dzire / Toyota Etios</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>4 Passengers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>AC, Comfortable for couples/small families</span>
                      </div>
                    </div>

                    {/* Hill Warning for Sedans - NEW */}
                    {isHillArea && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded mb-4">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>Note: AC may be switched off on steep climbs near {city.name}.</span>
                      </div>
                    )}

                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm text-gray-500">Drop to Sonprayag</p>
                      <p className="text-3xl font-bold text-blue-600">₹{sedanPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">+ ₹{city.taxi_rates.per_km_rate_hills}/km extra</p>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleWhatsAppEnquiry('Sedan')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Book Sedan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* SUV */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow border-2 border-blue-500 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Recommended</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Car className="w-8 h-8 text-white" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700">Best Value</Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">SUV</h3>
                    <p className="text-gray-500 text-sm mb-4">Toyota Innova / Ertiga</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>6-7 Passengers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Best for families, more luggage space</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Hill-certified driver</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm text-gray-500">Drop to Sonprayag</p>
                      <p className="text-3xl font-bold text-blue-600">₹{suvPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">+ ₹{city.taxi_rates.per_km_rate_hills}/km extra</p>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleWhatsAppEnquiry('SUV (Innova/Ertiga)')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Book SUV
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tempo Traveller */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Car className="w-8 h-8 text-purple-600" />
                      </div>
                      <Badge variant="secondary">Groups</Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">Tempo Traveller</h3>
                    <p className="text-gray-500 text-sm mb-4">12-17 Seater</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>12-17 Passengers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Ideal for large groups & families</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm text-gray-500">Drop to Sonprayag</p>
                      <p className="text-3xl font-bold text-blue-600">₹{tempoPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">+ ₹{city.taxi_rates.per_km_rate_hills}/km extra</p>
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleWhatsAppEnquiry('Tempo Traveller')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Book Tempo
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Pricing Notes */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-2">Pricing Notes:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li>• Driver allowance: ₹{city.taxi_rates.driver_allowance}/night</li>
                <li>• Minimum: {city.taxi_rates.min_km_per_day} km/day</li>
                <li>• Toll & parking extra</li>
                <li>• 5% GST applicable</li>
              </ul>
            </div>
          </Container>
        </section>
      ) : (
        /* No Taxi Service Available (e.g., Gaurikund) */
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center max-w-xl mx-auto">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No Direct Taxi to {city.name}
              </h2>
              <p className="text-gray-600 mb-6">
                {city.taxi_rates.note || `Private vehicles cannot reach ${city.name}. Use government shuttle services from Sonprayag.`}
              </p>
              {prevCity && (
                <Link to={`/taxi/${prevCity.slug}`}>
                  <Button>
                    Book Taxi to {prevCity.name} Instead
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* City-Specific Tips (Unique Content) */}
      <section className="py-12 bg-blue-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Taxi Tip for {city.name}
                  </h3>
                  <p className="text-gray-600">{displayTip}</p>
                </div>
              </div>
            </motion.div>

            {city.special_info && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Good to Know
                    </h3>
                    <p className="text-gray-600">{city.special_info}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Container>
      </section>

      {/* Rich Content: About This City */}
      {city.long_description && (
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About {city.name}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                {city.long_description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Rich Content: How to Reach */}
      {city.how_to_reach && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Route className="w-7 h-7 text-blue-600" />
              How to Reach {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {city.connectivity?.nearest_airport && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">By Air</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Nearest Airport: {city.connectivity.nearest_airport}
                    </p>
                  </CardContent>
                </Card>
              )}
              {city.connectivity?.nearest_railway && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Train className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">By Rail</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Nearest Station: {city.connectivity.nearest_railway}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">By Road</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {city.distance_from_kedarnath} from Kedarnath Temple
                  </p>
                </CardContent>
              </Card>
            </div>
            {city.how_to_reach && (
              <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-600">
                  {city.how_to_reach.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-3" dangerouslySetInnerHTML={{
                      __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Rich Content: Best Time & Weather */}
      {(city.best_time_to_visit || city.weather_info) && (
        <section className="py-12 bg-white">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {city.best_time_to_visit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Best Time to Visit</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{city.best_time_to_visit}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {city.weather_info && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="h-full border-0 shadow-md bg-gradient-to-br from-blue-50 to-sky-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <CloudSun className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Weather in {city.name}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{city.weather_info}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Rich Content: Route Description */}
      {city.route_description && (
        <section className="py-12 bg-gradient-to-br from-slate-800 to-slate-900">
          <Container>
            <div className="flex items-center gap-3 mb-6">
              <Map className="w-7 h-7 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">
                The Journey from {city.name} to Kedarnath
              </h2>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
              <p className="text-blue-100 leading-relaxed text-lg">
                {city.route_description}
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Rich Content: History */}
      {city.history && (
        <section className="py-12 bg-amber-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-7 h-7 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  History & Significance of {city.name}
                </h2>
              </div>
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <p className="text-gray-600 leading-relaxed">{city.history}</p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Rich Content: Local Food */}
      {city.local_food && (
        <section className="py-12 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Utensils className="w-7 h-7 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Where to Eat in {city.name}
                </h2>
              </div>
              <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-6 md:p-8">
                  <p className="text-gray-600 leading-relaxed">{city.local_food}</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>
      )}

      {/* Nearby Attractions */}
      {city.nearby_attractions && city.nearby_attractions.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Places to Visit in {city.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              {city.nearby_attractions.map((attraction) => (
                <Badge
                  key={attraction}
                  variant="outline"
                  className="px-4 py-2 text-base border-gray-300 text-gray-700 bg-white"
                >
                  <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                  {attraction}
                </Badge>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Why Book With Us */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Why Book With StayKedarnath?</h2>
            <p className="text-blue-100">Trusted by 10,000+ pilgrims for Kedarnath Yatra</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BadgeCheck, title: "Verified Drivers", desc: "All drivers verified with 5+ years experience" },
              { icon: Shield, title: "Safe Travel", desc: "Comprehensive insurance, GPS tracking" },
              { icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock assistance" },
              { icon: Banknote, title: "Best Prices", desc: "No hidden charges, transparent pricing" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm"
              >
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Related Routes */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Taxi Services from Other Cities
            </h2>
            <Link to="/car-rentals" className="text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyCities.map((otherCity, index) => (
              <motion.div
                key={otherCity.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/taxi/${otherCity.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Car className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {otherCity.name}
                          </h3>
                          <p className="text-sm text-gray-500">{otherCity.distance_from_kedarnath} to Kedarnath</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm text-gray-500">From</span>
                        <span className="font-bold text-blue-600">₹{otherCity.taxi_rates.drop_sonprayag_sedan.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ Section - Critical for AI Overview */}
      {cityFaqs.length > 0 && (
        <section className="py-16 bg-white">
          <Container>
            <AIOptimizedFAQ
              title={`Taxi Service FAQs - ${city.name}`}
              description={`Common questions about taxi services from ${city.name} for Kedarnath Yatra`}
              faqs={cityFaqs}
              showSchema={false}
            />
          </Container>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-12 bg-gradient-to-r from-slate-900 to-blue-900">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to Book Your Taxi from {city.name}?
              </h2>
              <p className="text-blue-200">
                Get instant quotes and book your pilgrimage journey today
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleWhatsAppEnquiry()}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => window.location.href = 'tel:+919027475942'}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default TaxiServicePage;
