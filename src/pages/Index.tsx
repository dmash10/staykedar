import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Hero from "../components/home/Hero";
import WhyUs from "../components/home/WhyUs";
import FeaturedDestinations from "../components/home/FeaturedDestinations";
import CuratedPackages from "../components/home/CuratedPackages";
import HowItWorks from "../components/home/HowItWorks";
import TrustSignals from "../components/home/TrustSignals";
import PromoBanner from "../components/home/PromoBanner";
import PluginRenderer from "../components/plugins/PluginRenderer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>StayKedarnath | Find Serene Stays & Plan Your Yatra</title>
        <meta name="description" content="Find the perfect accommodation for your Kedarnath Yatra. Book stays, helicopter services, and VIP poojas for a seamless spiritual journey." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />
        
        {/* Promotional Banner Strip */}
        <PromoBanner position="homepage" />

        <main className="flex-grow">
          <Hero />
          <WhyUs />
          <FeaturedDestinations />
          <CuratedPackages />
          <HowItWorks />
          <TrustSignals />

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
