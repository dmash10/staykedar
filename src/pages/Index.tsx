import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Hero from "../components/home/Hero";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ExploreStays from "../components/home/ExploreStays";
import PackagesTeaser from "../components/home/PackagesTeaser";
import YatraGuide from "../components/home/YatraGuide";
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
        
        <main className="flex-grow">
          <Hero />
          <WhyChooseUs />
          <ExploreStays />
          <PackagesTeaser />
          <YatraGuide />
          
          {/* Plugin Renderers */}
          <div className="fixed bottom-20 right-4 z-10">
            <PluginRenderer pluginName="Live Chat" />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
