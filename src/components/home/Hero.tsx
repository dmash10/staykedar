import React from "react";
import Container from "../Container";
import MainSearchBar from "../search/MainSearchBar";

const Hero = () => {
  const handleSearch = (data: any) => {
    console.log("Search data:", data);
    // Navigate to listings page with params if needed
    // For now just log as per original
  };

  return (
    <section className="bg-[#003580] relative pb-32 md:pb-20">
      <Container className="relative z-10 pt-12 pb-8">
        <div className="flex flex-col items-start text-left mb-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Discover Your Spiritual Journey<br className="hidden md:block" /> to Kedarnath
          </h1>
          <p className="text-base md:text-xl text-white/90 max-w-2xl">
            Find Serene Stays and Plan Your Yatra with Ease.
          </p>
        </div>
      </Container>

      {/* Booking Form */}
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 z-20">
        <Container>
          <MainSearchBar onSearch={handleSearch} />
        </Container>
      </div>
    </section>
  );
};

export default Hero;
