import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
  Loader2,
  Filter,
  Phone,
  Shield,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PackageType {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  images: string[];
  category: string;
  features: string[];
  location: string;
}

const Packages = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('price', { ascending: true });

        if (error) throw error;

        if (data) {
          const transformedData = data.map((pkg: any) => ({
            ...pkg,
            features: pkg.features || [],
            images: pkg.images || []
          }));
          setPackages(transformedData);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          title: "Error",
          description: "Could not load packages. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [toast]);

  const categories = [
    { id: "all", label: "All Packages" },
    { id: "budget", label: "Budget Friendly" },
    { id: "premium", label: "Premium" },
    { id: "helicopter", label: "Helicopter" }
  ];

  const filteredPackages = activeCategory === "all"
    ? packages
    : packages.filter(pkg => pkg.category?.toLowerCase() === activeCategory);

  return (
    <>
      <Helmet>
        <title>Spiritual Yatra Packages | StayKedarnath</title>
        <meta name="description" content="Book the best Kedarnath, Badrinath, and Chardham Yatra packages. From budget to luxury helicopter tours, find your perfect spiritual journey." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Nav />

        <main className="flex-grow">
          {/* Compact Hero Section - Strictly matched to homepage visual weight */}
          <section className="relative py-12 md:py-16 flex items-center justify-center overflow-hidden bg-[#003580]">
            <div className="absolute inset-0 z-0 opacity-40">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop"
                alt="Majestic Himalayas"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#003580] via-[#003580]/80 to-transparent" />
            </div>

            <Container className="relative z-10">
              <div className="max-w-3xl">
                <Badge className="mb-4 bg-blue-500/20 text-blue-100 border-blue-400/30 px-3 py-1 text-xs backdrop-blur-sm">
                  <Star className="w-3 h-3 mr-1.5 fill-yellow-400 text-yellow-400" />
                  Best Price Guarantee
                </Badge>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                  Find Your Perfect <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                    Spiritual Journey
                  </span>
                </h1>
                <p className="text-lg text-blue-100 max-w-xl mb-8 leading-relaxed">
                  Explore our curated selection of Yatra packages, designed to provide you with a comfortable and divine experience.
                </p>
              </div>
            </Container>
          </section>

          {/* Sticky Filter Bar */}
          <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
            <Container>
              <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeCategory === cat.id
                          ? "bg-[#0071c2] text-white shadow-md ring-2 ring-blue-200 ring-offset-1"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="hidden md:flex items-center text-sm text-slate-500">
                  <span className="font-semibold text-slate-900 mr-1">{filteredPackages.length}</span> packages found
                </div>
              </div>
            </Container>
          </div>

          {/* Packages Grid */}
          <section className="py-12 bg-slate-50 min-h-[600px]">
            <Container>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-[#0071c2] mb-4" />
                  <p className="text-slate-500">Loading best packages for you...</p>
                </div>
              ) : filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {filteredPackages.map((pkg) => (
                      <motion.div
                        layout
                        key={pkg.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
                      >
                        {/* Card Image */}
                        <div className="relative h-56 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                          <img
                            src={pkg.images[0] || 'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?q=80&w=1000'}
                            alt={pkg.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute top-3 left-3 z-20">
                            <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md flex items-center shadow-sm">
                              <MapPin className="w-3 h-3 mr-1 text-[#0071c2]" />
                              {pkg.location}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <Clock className="w-3.5 h-3.5" />
                              {pkg.duration}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              4.9
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#0071c2] transition-colors line-clamp-1">
                            {pkg.title}
                          </h3>

                          <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {pkg.description}
                          </p>

                          <div className="space-y-2 mb-5">
                            {pkg.features.slice(0, 2).map((feature, idx) => (
                              <div key={idx} className="flex items-start text-xs text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Starting From</p>
                              <p className="text-xl font-bold text-[#0071c2]">₹{pkg.price.toLocaleString()}</p>
                            </div>
                            <Link to={`/packages/${pkg.slug}`}>
                              <Button size="sm" className="rounded-lg bg-[#0071c2] hover:bg-[#005a9c] text-white font-semibold shadow-sm hover:shadow-md transition-all">
                                View Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No packages found</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    We couldn't find any packages in this category.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveCategory("all")}
                    className="text-[#0071c2] border-blue-200 hover:bg-blue-50"
                  >
                    View All Packages
                  </Button>
                </div>
              )}
            </Container>
          </section>

          {/* Trust Indicators (Compact) */}
          <section className="bg-white border-t border-slate-100 py-12">
            <Container>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: Shield, label: "100% Secure", sub: "Verified Partners" },
                  { icon: Star, label: "4.9/5 Ratings", sub: "From 5000+ Pilgrims" },
                  { icon: Clock, label: "24/7 Support", sub: "Always Here For You" },
                  { icon: CheckCircle2, label: "Best Price", sub: "Guaranteed" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 text-[#0071c2]">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.label}</h3>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Packages;
