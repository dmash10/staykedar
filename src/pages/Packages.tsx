import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { motion } from "framer-motion";
import { 
  Package, 
  Plane, 
  Calendar, 
  Users, 
  PenLine, 
  Map, 
  ChevronRight,
  Star,
  Check,
  Mountain,
  Hotel,
  Coffee
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PackageOption {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  category: string;
  features: string[];
  popular?: boolean;
}

const packageOptions: PackageOption[] = [
  {
    id: 1,
    title: "Basic Kedarnath Yatra",
    description: "A simple package covering the essentials for your Kedarnath journey.",
    price: 9999,
    duration: "3 Days, 2 Nights",
    image: "https://images.unsplash.com/photo-1535732820275-9ffd998cac22?q=80&w=1000&auto=format&fit=crop",
    category: "budget",
    features: [
      "Accommodation in Sonprayag",
      "Guided trek to Kedarnath",
      "Daily breakfast",
      "Transportation from Rishikesh"
    ]
  },
  {
    id: 2,
    title: "Premium Kedarnath Experience",
    description: "Comfortable accommodations and guided tour with additional amenities.",
    price: 18999,
    duration: "4 Days, 3 Nights",
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1000&auto=format&fit=crop",
    category: "premium",
    popular: true,
    features: [
      "Deluxe accommodation in Sonprayag",
      "Guided trek with experienced guide",
      "All meals included",
      "Private transportation from Dehradun",
      "Pooja arrangements",
      "Medical assistance"
    ]
  },
  {
    id: 3,
    title: "Helicopter Darshan",
    description: "Quick and convenient helicopter service directly to Kedarnath temple.",
    price: 24999,
    duration: "2 Days, 1 Night",
    image: "https://images.unsplash.com/photo-1608778581110-bba5c94a22d0?q=80&w=1000&auto=format&fit=crop", 
    category: "helicopter",
    features: [
      "Helicopter ride to Kedarnath",
      "Luxury accommodation in Guptkashi",
      "Priority darshan",
      "All meals included",
      "VIP pooja arrangements",
      "Personal guide"
    ]
  },
  {
    id: 4,
    title: "Chardham Special",
    description: "Complete Chardham Yatra including Kedarnath, Badrinath, Gangotri and Yamunotri.",
    price: 45999,
    duration: "12 Days, 11 Nights",
    image: "https://images.unsplash.com/photo-1468078809804-4c7b3e60a478?q=80&w=1000&auto=format&fit=crop",
    category: "premium",
    features: [
      "Visit all four Dhams",
      "Comfortable accommodations",
      "All meals included",
      "Private transportation",
      "Experienced guide",
      "Pooja arrangements at all temples",
      "Helicopter option for Kedarnath (additional cost)"
    ]
  },
  {
    id: 5,
    title: "Solo Traveler Package",
    description: "Specially designed package for solo travelers with group activities.",
    price: 13999,
    duration: "5 Days, 4 Nights",
    image: "https://images.unsplash.com/photo-1490077476659-095159692ab5?q=80&w=1000&auto=format&fit=crop",
    category: "budget",
    features: [
      "Shared accommodation",
      "Group trekking",
      "All meals included",
      "Transportation from Rishikesh",
      "Evening spiritual sessions",
      "Local sightseeing"
    ]
  },
];

const Packages = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const filteredPackages = activeTab === "all" 
    ? packageOptions 
    : packageOptions.filter(pkg => pkg.category === activeTab);

  const handlePackageEnquiry = (packageTitle: string) => {
    toast({
      title: "Enquiry Sent!",
      description: `We'll contact you soon about the ${packageTitle} package.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Kedarnath Packages | StayKedarnath</title>
        <meta name="description" content="Explore our comprehensive Kedarnath Yatra packages. From budget-friendly to luxury options, find the perfect package for your spiritual journey." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Nav />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-16 bg-primary-deep/5 mt-16">
            <Container className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/90 to-primary-light/80 -z-10" />
              <div 
                className="absolute inset-0 bg-cover bg-center -z-20" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535732820275-9ffd998cac22?q=80&w=1000&auto=format&fit=crop')" }}
              />

              <div className="container-custom relative">
                <div className="max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 flex items-center"
                  >
                    <Package className="mr-3 text-white" size={30} />
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                      Yatra Packages
                    </h1>
                  </motion.div>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-xl text-white/90 mb-8"
                  >
                    Simplify your spiritual journey with our carefully curated packages. From budget-friendly options
                    to premium experiences, we have something for every pilgrim.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center text-white/90 bg-white/10 px-4 py-2 rounded-full">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>Available Year-Round</span>
                    </div>
                    <div className="flex items-center text-white/90 bg-white/10 px-4 py-2 rounded-full">
                      <Users className="w-5 h-5 mr-2" />
                      <span>Group & Private Options</span>
                    </div>
                    <div className="flex items-center text-white/90 bg-white/10 px-4 py-2 rounded-full">
                      <Plane className="w-5 h-5 mr-2" />
                      <span>Helicopter Services</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Container>
          </section>
          
          {/* Packages Section */}
          <section className="py-16 bg-white">
            <Container>
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  Choose Your Perfect Package
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Select from our range of packages designed to suit different needs and preferences.
                  All packages include spiritual guidance and assistance throughout your journey.
                </p>
              </div>

              <Tabs defaultValue="all" className="w-full mb-10">
                <div className="flex justify-center mb-8">
                  <TabsList className="bg-primary-subtle">
                    <TabsTrigger 
                      value="all" 
                      onClick={() => setActiveTab("all")}
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      All Packages
                    </TabsTrigger>
                    <TabsTrigger 
                      value="budget" 
                      onClick={() => setActiveTab("budget")}
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Budget Friendly
                    </TabsTrigger>
                    <TabsTrigger 
                      value="premium" 
                      onClick={() => setActiveTab("premium")}
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Premium
                    </TabsTrigger>
                    <TabsTrigger 
                      value="helicopter" 
                      onClick={() => setActiveTab("helicopter")}
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Helicopter
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPackages.map((pkg) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-xl overflow-hidden shadow-md border border-border relative"
                      >
                        {pkg.popular && (
                          <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Most Popular
                          </div>
                        )}
                        <div 
                          className="h-56 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${pkg.image})` }}
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-foreground mb-2">{pkg.title}</h3>
                          <p className="text-muted-foreground mb-4">{pkg.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span className="text-sm">{pkg.duration}</span>
                            </div>
                            <span className="font-bold text-primary-deep">₹{pkg.price.toLocaleString()}</span>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium text-foreground mb-2">Package Includes:</h4>
                            <ul className="space-y-1">
                              {pkg.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <Check className="w-4 h-4 text-primary-deep mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{feature}</span>
                                </li>
                              ))}
                              {pkg.features.length > 3 && (
                                <li className="text-sm text-primary-light">+{pkg.features.length - 3} more features</li>
                              )}
                            </ul>
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-full btn-primary">
                                View Details
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-display">{pkg.title}</DialogTitle>
                              </DialogHeader>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div>
                                  <div 
                                    className="h-64 rounded-lg bg-cover bg-center mb-4" 
                                    style={{ backgroundImage: `url(${pkg.image})` }}
                                  />
                                  <div className="space-y-2">
                                    <div className="flex items-center text-muted-foreground">
                                      <Calendar className="w-4 h-4 mr-2 text-primary-deep" />
                                      <span>{pkg.duration}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                      <Users className="w-4 h-4 mr-2 text-primary-deep" />
                                      <span>Group and Private options available</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                      <Map className="w-4 h-4 mr-2 text-primary-deep" />
                                      <span>Starts from Rishikesh/Dehradun</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-muted-foreground mb-4">{pkg.description}</p>
                                  
                                  <h4 className="font-medium text-foreground mb-2">Package Includes:</h4>
                                  <ul className="space-y-2 mb-6">
                                    {pkg.features.map((feature, index) => (
                                      <li key={index} className="flex items-start">
                                        <Check className="w-4 h-4 text-primary-deep mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-muted-foreground">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  
                                  <div className="flex flex-col space-y-3">
                                    <p className="text-2xl font-bold text-primary-deep">₹{pkg.price.toLocaleString()}</p>
                                    <button 
                                      className="btn-primary"
                                      onClick={() => handlePackageEnquiry(pkg.title)}
                                    >
                                      Book Now
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="budget" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Content will be populated by filteredPackages */}
                  </div>
                </TabsContent>
                
                <TabsContent value="premium" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Content will be populated by filteredPackages */}
                  </div>
                </TabsContent>
                
                <TabsContent value="helicopter" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Content will be populated by filteredPackages */}
                  </div>
                </TabsContent>
              </Tabs>
            </Container>
          </section>

          {/* Additional Services */}
          <section className="py-16" id="helicopter">
            <Container>
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  Additional Services
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Enhance your spiritual journey with our specialized services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-border text-center p-8"
                >
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary-subtle flex items-center justify-center">
                      <Plane className="w-8 h-8 text-primary-deep" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Helicopter Services</h3>
                  <p className="text-muted-foreground mb-6">
                    Skip the trek and reach Kedarnath temple quickly with our helicopter services.
                    Available from multiple locations with priority darshan.
                  </p>
                  <button 
                    className="btn-secondary"
                    onClick={() => toast({
                      title: "Helicopter Enquiry",
                      description: "We'll contact you soon about helicopter bookings.",
                    })}
                  >
                    Enquire Now
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-border text-center p-8"
                  id="pooja"
                >
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary-subtle flex items-center justify-center">
                      <PenLine className="w-8 h-8 text-primary-deep" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">VIP Pooja Arrangements</h3>
                  <p className="text-muted-foreground mb-6">
                    Special pooja arrangements at Kedarnath temple with experienced priests.
                    Includes all pooja materials and personalized ceremonies.
                  </p>
                  <button 
                    className="btn-secondary"
                    onClick={() => toast({
                      title: "Pooja Enquiry",
                      description: "We'll contact you soon about VIP pooja arrangements.",
                    })}
                  >
                    Book Pooja
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-border text-center p-8"
                  id="guide"
                >
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary-subtle flex items-center justify-center">
                      <Mountain className="w-8 h-8 text-primary-deep" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Experienced Guides</h3>
                  <p className="text-muted-foreground mb-6">
                    Knowledgeable guides who understand the spiritual and cultural significance
                    of Kedarnath, enhancing your pilgrimage experience.
                  </p>
                  <button 
                    className="btn-secondary"
                    onClick={() => toast({
                      title: "Guide Service Enquiry",
                      description: "We'll contact you soon about guide services.",
                    })}
                  >
                    Hire Guide
                  </button>
                </motion.div>
              </div>
            </Container>
          </section>

          {/* Kedarnath Shop Section */}
          <section className="py-16 bg-secondary/30" id="shop">
            <Container>
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  Kedarnath Shop
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Everything you need for your spiritual journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-border"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">Trekking Essentials</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Walking sticks, raincoats, weather-appropriate gear
                    </p>
                    <Link 
                      to="/packages#shop" 
                      className="text-sm text-primary-light hover:text-primary-deep flex items-center"
                    >
                      View Products
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-border"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">Pooja Items</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete pooja kits, prasad, and offering materials
                    </p>
                    <Link 
                      to="/packages#shop" 
                      className="text-sm text-primary-light hover:text-primary-deep flex items-center"
                    >
                      View Products
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-border"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">Souvenirs</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Kedarnath mementos, religious items, and local crafts
                    </p>
                    <Link 
                      to="/packages#shop" 
                      className="text-sm text-primary-light hover:text-primary-deep flex items-center"
                    >
                      View Products
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-border"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">Books & Guides</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Spiritual literature, maps, and guidebooks
                    </p>
                    <Link 
                      to="/packages#shop" 
                      className="text-sm text-primary-light hover:text-primary-deep flex items-center"
                    >
                      View Products
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
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
