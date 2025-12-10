/**
 * PackagesFromCityPage.tsx - Programmatic SEO Page for Packages by Starting City
 * 
 * URL Pattern: /packages/from/[city-slug]
 * Example: /packages/from/haridwar, /packages/from/delhi
 * 
 * Shows tour packages that start from a specific city.
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  ChevronRight,
  Phone,
  MessageCircle,
  ArrowRight,
  Clock,
  Calendar,
  Loader2,
  Users,
  Package,
  IndianRupee,
  CheckCircle2
} from "lucide-react";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIOptimizedFAQ, { FAQItem } from "@/components/SEO/AIOptimizedFAQ";
import { supabase } from "@/integrations/supabase/client";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
  combineSchemas
} from "@/utils/seoSchemas";

// Import cities data for city info
import citiesDataJson from "@/data/cities.json";

// Types
interface CityData {
  slug: string;
  name: string;
  type: string;
  state: string;
  description: string;
}

interface PackageData {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  images: string[];
  category: string;
  location: string;
  features: string[];
  inclusions: string[];
}

// Generate FAQs for packages from this city
const generatePackageFAQs = (city: CityData, packages: PackageData[]): FAQItem[] => {
  const minPrice = packages.length > 0 ? Math.min(...packages.map(p => p.price || 0)) : 0;

  return [
    {
      question: `What Kedarnath packages are available from ${city.name}?`,
      answer: `We offer ${packages.length}+ tour packages starting from ${city.name} including Kedarnath Yatra, Char Dham packages, and Panch Kedar tours. Packages range from budget to premium options.`
    },
    {
      question: `How much does a Kedarnath package from ${city.name} cost?`,
      answer: minPrice > 0
        ? `Kedarnath packages from ${city.name} start from ₹${minPrice.toLocaleString()}. Price varies based on duration, accommodation type, and inclusions like helicopter services.`
        : `Package prices vary based on duration and inclusions. Contact us for customized quotes starting from your budget.`
    },
    {
      question: `What is the best package for first-time Kedarnath visitors from ${city.name}?`,
      answer: `For first-timers, we recommend a 4-5 day package that includes comfortable stays, experienced guides, and flexible trek options. This gives enough time to acclimatize and enjoy the journey.`
    },
    {
      question: `Do packages from ${city.name} include transportation?`,
      answer: `Yes, all our packages include pick-up and drop from ${city.name}. Transportation is provided in comfortable vehicles suitable for mountain roads.`
    },
    {
      question: `Can I customize a Kedarnath package from ${city.name}?`,
      answer: `Absolutely! We offer customizable packages where you can choose your accommodation type, add helicopter options, extend to Badrinath/Char Dham, or adjust the itinerary. Contact us for custom quotes.`
    }
  ];
};

const PackagesFromCityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [city, setCity] = useState<CityData | null>(null);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First try to get city from seo_cities
        let cityData: CityData | null = null;

        const { data: seoCityData } = await supabase
          .from('seo_cities')
          .select('slug, name, type, state, description')
          .eq('slug', citySlug)
          .eq('is_active', true)
          .single();

        if (seoCityData) {
          cityData = seoCityData as CityData;
        } else {
          // Fallback to local JSON
          const localCity = (citiesDataJson as CityData[]).find(c => c.slug === citySlug);
          if (localCity) {
            cityData = localCity;
          }
        }

        if (!cityData) {
          setError(true);
          return;
        }

        setCity(cityData);

        // Fetch packages - match by location containing city name or "All" locations
        const { data: packagesData } = await supabase
          .from('packages')
          .select('*')
          .order('price', { ascending: true });

        if (packagesData) {
          // Filter packages that could start from this city
          const filteredPackages = packagesData.filter(pkg =>
            pkg.location?.toLowerCase().includes(cityData?.name.toLowerCase()) ||
            pkg.location?.toLowerCase().includes('all') ||
            pkg.location?.toLowerCase().includes('haridwar') || // Most packages start from major hubs
            pkg.location?.toLowerCase().includes('rishikesh')
          );
          setPackages(filteredPackages as PackageData[]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (citySlug) {
      fetchData();
    }
  }, [citySlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  // 404 if city not found
  if (error || !city) {
    return <Navigate to="/packages" replace />;
  }

  // Generate SEO data
  const pageTitle = `Kedarnath Packages from ${city.name} | Tour Packages 2026`;
  const pageDescription = `Book Kedarnath tour packages starting from ${city.name}. ${packages.length}+ packages available with hotels, transport, and meals. Best prices for 2026 Yatra.`;
  const canonicalUrl = `https://staykedarnath.in/packages/from/${city.slug}`;

  // Generate schemas
  const faqItems = generatePackageFAQs(city, packages);
  const faqSchema = generateFAQSchema(faqItems);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://staykedarnath.in" },
    { name: "Packages", url: "https://staykedarnath.in/packages" },
    { name: `From ${city.name}`, url: canonicalUrl }
  ]);

  // ItemList Schema for packages
  const packageListSchema = packages.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Kedarnath Tour Packages from ${city.name}`,
    "description": pageDescription,
    "itemListElement": packages.slice(0, 10).map((pkg, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "TouristTrip",
        "name": pkg.title,
        "description": pkg.description,
        "touristType": "Pilgrimage",
        "offers": {
          "@type": "Offer",
          "price": pkg.price,
          "priceCurrency": "INR"
        }
      }
    }))
  } : null;

  const allSchemas = combineSchemas(faqSchema, breadcrumbSchema, packageListSchema);

  const handleWhatsAppEnquiry = (pkg?: PackageData) => {
    const message = pkg
      ? `Hi! I'm interested in the "${pkg.title}" package from ${city.name}. Can you share more details?`
      : `Hi! I'm looking for Kedarnath tour packages from ${city.name}. Can you help me choose the right one?`;
    window.open(`https://wa.me/919027475942?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {allSchemas && (
          <script type="application/ld+json">
            {JSON.stringify(allSchemas)}
          </script>
        )}
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-900 via-amber-900 to-orange-900 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
          }} />
        </div>

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-orange-200 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/packages" className="hover:text-white transition-colors">Packages</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">From {city.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                <MapPin className="w-3 h-3 mr-1" /> Starting from {city.name}
              </Badge>
              <Badge className="bg-white/10 text-white/70 border-white/20">
                <Package className="w-3 h-3 mr-1" /> {packages.length}+ Packages
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Kedarnath Tour Packages from {city.name}
            </h1>

            <p className="text-xl text-orange-100/80 mb-6">
              Explore our curated collection of Kedarnath pilgrimage packages starting from {city.name}.
              All-inclusive tours with hotels, transport, meals, and experienced guides.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                <Package className="w-4 h-4" />
                <span>{packages.length}+ Packages</span>
              </div>
              {packages.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                  <IndianRupee className="w-4 h-4" />
                  <span>Starting ₹{Math.min(...packages.map(p => p.price || 0)).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleWhatsAppEnquiry()}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Custom Quote
              </Button>
              <a href="tel:+919027475942">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Packages Grid */}
      <section className="py-16 bg-white">
        <Container>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Available Packages from {city.name}
          </h2>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/packages/${pkg.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all group overflow-hidden">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={pkg.images?.[0] || `https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600`}
                          alt={pkg.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {pkg.category && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 text-gray-700">
                              {pkg.category}
                            </Badge>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-white/80 text-sm">Starting from</p>
                              <p className="text-2xl font-bold text-white">
                                ₹{pkg.price?.toLocaleString()}
                              </p>
                            </div>
                            {pkg.duration && (
                              <Badge className="bg-white/20 text-white border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {pkg.duration}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {pkg.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {pkg.description}
                        </p>

                        {/* Features */}
                        {pkg.inclusions && pkg.inclusions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(pkg.inclusions as string[]).slice(0, 3).map((inc, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                                {inc}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.preventDefault();
                              handleWhatsAppEnquiry(pkg);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Enquire
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Custom Packages Available</h3>
              <p className="text-gray-600 mb-6">
                We can create a custom package starting from {city.name} based on your requirements.
              </p>
              <Button onClick={() => handleWhatsAppEnquiry()} className="bg-orange-600 hover:bg-orange-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                Request Custom Package
              </Button>
            </Card>
          )}
        </Container>
      </section>

      {/* Why Book With Us */}
      <section className="py-12 bg-gray-50">
        <Container>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Book Packages from {city.name} with Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Local Expertise</h3>
                <p className="text-gray-600 text-sm">Based in Uttarakhand with deep knowledge of the region</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Verified Hotels</h3>
                <p className="text-gray-600 text-sm">Quality-checked accommodations at every stop</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Expert Guides</h3>
                <p className="text-gray-600 text-sm">Experienced guides who know every trail</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Best Prices</h3>
                <p className="text-gray-600 text-sm">Competitive rates with no hidden charges</p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Related Links */}
      <section className="py-12 bg-gradient-to-r from-orange-600 to-amber-600">
        <Container>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            More Options from {city.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to={`/taxi/${city.slug}`}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <MapPin className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-bold mb-1">Taxi from {city.name}</h3>
                  <p className="text-orange-100 text-sm">Book taxi for your journey</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={`/stays/location/${city.slug}`}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <Calendar className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-bold mb-1">Hotels in {city.name}</h3>
                  <p className="text-orange-100 text-sm">Find accommodation</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={`/guide/${city.slug}`}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <Star className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-bold mb-1">{city.name} Travel Guide</h3>
                  <p className="text-orange-100 text-sm">Complete guide</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <Container>
          <AIOptimizedFAQ
            title={`Kedarnath Packages from ${city.name} FAQs`}
            description={`Common questions about tour packages starting from ${city.name}`}
            faqs={faqItems}
          />
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default PackagesFromCityPage;

