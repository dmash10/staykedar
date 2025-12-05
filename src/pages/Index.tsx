import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Hero from "../components/home/Hero";
import MarqueeBanner from "../components/home/MarqueeBanner";
import WhyUs from "../components/home/WhyUs";
import FeaturedDestinations from "../components/home/FeaturedDestinations";
import CuratedPackages from "../components/home/CuratedPackages";
import HowItWorks from "../components/home/HowItWorks";
import TrustSignals from "../components/home/TrustSignals";
import PromoBanner from "../components/home/PromoBanner";
import PluginRenderer from "../components/plugins/PluginRenderer";
import { GlobalSchemaMarkup } from "../components/SEO/SchemaMarkup";
import AIOptimizedFAQ, { KedarnathTravelFAQs } from "../components/SEO/AIOptimizedFAQ";

const Index = () => {
  // Homepage structured data for AI Search
  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "StayKedarnath - Book Kedarnath Stays, Helicopter & Yatra Packages",
    "description": "Official booking partner for Kedarnath stays, helicopter services, and pilgrimage packages. Plan your sacred journey to Kedarnath Temple with trusted accommodations and VIP darshan services.",
    "url": "https://staykedarnath.in",
    "mainEntity": {
      "@type": "TouristDestination",
      "name": "Kedarnath",
      "description": "Kedarnath is one of the holiest Hindu temples dedicated to Lord Shiva, located in the Himalayan range of Uttarakhand, India. At 3,583 meters elevation, it is one of the four Char Dham pilgrimage sites.",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 30.7346,
        "longitude": 79.0669,
        "elevation": "3583"
      },
      "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
      "touristType": ["Pilgrimage", "Religious Tourism", "Trekking"],
      "includesAttraction": [
        {
          "@type": "TouristAttraction",
          "name": "Kedarnath Temple",
          "description": "Ancient Hindu temple dedicated to Lord Shiva, part of Char Dham Yatra"
        },
        {
          "@type": "TouristAttraction", 
          "name": "Vasuki Tal",
          "description": "Glacial lake located 6 km from Kedarnath at 4,135 meters"
        },
        {
          "@type": "TouristAttraction",
          "name": "Chorabari Tal (Gandhi Sarovar)",
          "description": "Sacred lake located 3 km from Kedarnath Temple"
        }
      ]
    },
    "provider": {
      "@type": "TravelAgency",
      "name": "StayKedarnath",
      "url": "https://staykedarnath.in"
    }
  };

  return (
    <>
      <Helmet>
        <title>StayKedarnath | Book Kedarnath Stays, Helicopter & Yatra Packages 2024</title>
        <meta name="description" content="Official Kedarnath booking partner. Book verified stays near Kedarnath Temple, helicopter services from ₹2,500, VIP darshan, and complete Char Dham Yatra packages. 24/7 support. Best prices guaranteed." />
        <meta name="keywords" content="Kedarnath booking, Kedarnath hotel, Kedarnath helicopter, Char Dham Yatra, Kedarnath Temple, Kedarnath trek, Kedarnath stay, Gaurikund hotel, Kedarnath package" />
        <link rel="canonical" href="https://staykedarnath.in" />
        
        {/* Open Graph for Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="StayKedarnath - Book Kedarnath Stays & Helicopter Services" />
        <meta property="og:description" content="Official booking partner for Kedarnath. Book verified stays, helicopter services, and Char Dham Yatra packages." />
        <meta property="og:url" content="https://staykedarnath.in" />
        <meta property="og:image" content="https://staykedarnath.in/og-image.png" />
        <meta property="og:site_name" content="StayKedarnath" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="StayKedarnath - Book Kedarnath Stays & Helicopter Services" />
        <meta name="twitter:description" content="Official booking partner for Kedarnath stays and Char Dham Yatra packages." />
        <meta name="twitter:image" content="https://staykedarnath.in/og-image.png" />
        
        {/* Homepage Schema */}
        <script type="application/ld+json">
          {JSON.stringify(homepageSchema)}
        </script>
      </Helmet>
      
      {/* Global Schema Markup for Organization, Website, LocalBusiness */}
      <GlobalSchemaMarkup />

      <div className="min-h-screen flex flex-col">
        <Nav />

        {/* Promotional Banner Strip */}
        <PromoBanner position="homepage" />

        <main className="flex-grow">
          {/* Hero with search bar inside */}
          <Hero />
          
          {/* Animated Marquee Banner - Below Hero */}
          <MarqueeBanner />
          
          <WhyUs />
          <FeaturedDestinations />
          <CuratedPackages />
          <HowItWorks />
          <TrustSignals />
          
          {/* AI-Optimized FAQ Section for Search Visibility */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <AIOptimizedFAQ 
                title="Kedarnath Yatra - Frequently Asked Questions"
                description="Everything you need to know about planning your sacred journey to Kedarnath"
                faqs={KedarnathTravelFAQs}
              />
            </div>
          </section>

          {/* Plugin Renderers */}
          <div className="fixed bottom-20 right-4 z-10">
            <PluginRenderer pluginName="Live Chat" />
          </div>
        </main>

        <Footer />

        {/* Popup Banner (shows after delay) */}
        <PromoBanner position="popup" />
      </div>
    </>
  );
};

export default Index;
