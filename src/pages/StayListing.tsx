import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { Loader2, Filter, Star } from 'lucide-react';
import Container from '@/components/Container';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MainSearchBar from '@/components/search/MainSearchBar';
import stayService, { PropertySearchResult } from '@/api/stayService';
import { useToast } from '@/components/ui/use-toast';
import AIOptimizedFAQ, { StaysFAQs } from '@/components/SEO/AIOptimizedFAQ';
import { Link } from 'react-router-dom';
import { MapPin, Mountain, Bed, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import citiesData from '@/data/cities.json';

const StayListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State from URL params
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Data states
  const [properties, setProperties] = useState<PropertySearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Constants for filters
  const amenitiesList = ['Wi-Fi', 'Parking', 'Restaurant', 'Room Service', 'Power Backup', 'Geyser'];
  const propertyTypesList = ['Hotel', 'Homestay', 'Resort', 'Guest House', 'Dharamshala'];

  // Load properties on mount and when search params change
  useEffect(() => {
    loadProperties();
  }, [currentPage, location, checkIn, checkOut, guests, priceRange, selectedAmenities, selectedPropertyTypes, minRating]);

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      // Convert string dates to Date objects if needed
      const checkInDate = typeof checkIn === 'string' && checkIn ? new Date(checkIn) : new Date();
      const checkOutDate = typeof checkOut === 'string' && checkOut ? new Date(checkOut) : new Date(new Date().setDate(new Date().getDate() + 1));

      const results = await stayService.searchProperties(
        checkInDate,
        checkOutDate,
        location || '',
        guests,
        {
          amenities: selectedAmenities,
          propertyTypes: selectedPropertyTypes,
          minRating: minRating || undefined
        }
      );

      // Apply filters
      let filteredProperties = results;

      // Price Filter (Lowest Price)
      if (priceRange[0] > 0 || priceRange[1] < 10000) {
        filteredProperties = filteredProperties.filter(
          p => p.lowestPrice >= priceRange[0] && p.lowestPrice <= priceRange[1]
        );
      }

      setProperties(filteredProperties);
      setTotalPages(Math.ceil(filteredProperties.length / itemsPerPage));

    } catch (error) {
      console.error('Error loading properties:', error);
      setError('Failed to load available stays. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load available stays. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (data: { location: string; checkIn: Date | null; checkOut: Date | null; guests: { adults: number; children: number; rooms: number } }) => {
    setCurrentPage(1);

    const newLocation = data.location;
    const newCheckIn = data.checkIn ? format(data.checkIn, 'yyyy-MM-dd') : '';
    const newCheckOut = data.checkOut ? format(data.checkOut, 'yyyy-MM-dd') : '';
    const newGuests = data.guests.adults + data.guests.children;

    setLocation(newLocation);
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    setGuests(newGuests);

    // Update URL search params
    const params = new URLSearchParams();
    if (newLocation) params.set('location', newLocation);
    if (newCheckIn) params.set('checkIn', newCheckIn);
    if (newCheckOut) params.set('checkOut', newCheckOut);
    if (newGuests) params.set('guests', newGuests.toString());

    setSearchParams(params);
  };

  const navigateToPropertyDetail = (propertyId: string) => {
    navigate(`/stays/${propertyId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <>
      <Helmet>
        <title>Hotels & Stays Near Kedarnath Temple | StayKedarnath</title>
        <meta name="description" content="Book verified hotels and stays near Kedarnath Temple. Budget to premium accommodations in Gaurikund, Sonprayag, and Guptkashi. Best prices guaranteed with free cancellation." />
        <meta name="keywords" content="Kedarnath hotel, Kedarnath stay, Gaurikund hotel, Sonprayag hotel, Guptkashi hotel, Kedarnath accommodation, Char Dham stay" />
        <link rel="canonical" href="https://staykedarnath.in/stays" />
      </Helmet>
      
      <Nav />
      <main className="min-h-screen bg-gray-50">
        {/* Header with Search Bar */}
        <div className="bg-[#003580] pt-8 pb-16">
          <Container>
            <h1 className="text-3xl font-bold text-white mb-6">Find Your Perfect Stay</h1>
            <MainSearchBar
              initialLocation={location}
              initialCheckIn={checkIn ? new Date(checkIn) : null}
              initialCheckOut={checkOut ? new Date(checkOut) : null}
              initialGuests={{ adults: guests, children: 0, rooms: 1 }}
              onSearch={handleSearch}
            />
          </Container>
        </div>

        <Container className="py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Filters
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden text-[#0071c2] font-medium"
                  >
                    {showFilters ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className={`${showFilters ? 'block' : 'hidden lg:block'} space-y-8`}>
                  {/* Price Range Filter */}
                  <div>
                    <h3 className="font-semibold mb-4 text-gray-900">Price Range</h3>
                    <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}+</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0071c2]"
                    />
                  </div>

                  {/* Property Type Filter */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Property Type</h3>
                    <div className="space-y-2">
                      {propertyTypesList.map(type => (
                        <label key={type} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPropertyTypes.includes(type)}
                            onChange={() => togglePropertyType(type)}
                            className="w-4 h-4 text-[#0071c2] border-gray-300 rounded focus:ring-[#0071c2]"
                          />
                          <span className="ml-2 text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Filter */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Amenities</h3>
                    <div className="space-y-2">
                      {amenitiesList.map(amenity => (
                        <label key={amenity} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="w-4 h-4 text-[#0071c2] border-gray-300 rounded focus:ring-[#0071c2]"
                          />
                          <span className="ml-2 text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Star Rating</h3>
                    <div className="space-y-2">
                      {[5, 4, 3].map(rating => (
                        <label key={rating} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={minRating === rating}
                            onChange={() => setMinRating(minRating === rating ? null : rating)}
                            className="w-4 h-4 text-[#0071c2] border-gray-300 rounded focus:ring-[#0071c2]"
                          />
                          <span className="ml-2 flex items-center gap-1 text-gray-700">
                            {Array.from({ length: rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setPriceRange([0, 10000]);
                      setSelectedAmenities([]);
                      setSelectedPropertyTypes([]);
                      setMinRating(null);
                    }}
                    className="w-full py-2 px-4 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-grow">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0071c2]" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
                  {error}
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">No stays found</h3>
                  <p className="text-yellow-700">Try adjusting your search criteria or filters to find more options.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{properties.length} properties found</h2>
                    <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071c2]">
                      <option>Recommended</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Top Rated</option>
                    </select>
                  </div>

                  <div className="space-y-6">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => navigateToPropertyDetail(property.id)}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 cursor-pointer group"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Property Image */}
                          <div className="w-full md:w-72 h-48 md:h-auto bg-gray-200 relative overflow-hidden">
                            <img
                              src={property.images?.[0] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"}
                              alt={property.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Mock Rating Badge */}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1 text-xs font-bold shadow-sm">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {property.rating || 4.5}
                            </div>
                          </div>

                          {/* Property Details */}
                          <div className="flex-grow p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0071c2] transition-colors">
                                    {property.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-2">{property.address || location || 'Kedarnath'}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500 mb-1">Starting from</div>
                                  <span className="text-2xl font-bold text-[#0071c2]">
                                    {formatPrice(property.lowestPrice)}
                                  </span>
                                  <div className="text-xs text-gray-500">per night</div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
                                  {property.roomCount} Room Types Available
                                </span>
                                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                  Free Cancellation
                                </span>
                              </div>

                              <p className="text-sm text-gray-500 line-clamp-2">
                                {property.description || `Experience comfort and tranquility at ${property.name}. Perfect for pilgrims seeking rest after their journey.`}
                              </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                className="bg-[#0071c2] hover:bg-[#005a9c] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                              >
                                See Availability
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                              ? 'bg-[#0071c2] text-white'
                              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
        
        {/* Stays by Location - Internal Linking for SEO */}
        <section className="py-12 bg-gray-50 border-t">
          <Container>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Find Stays by Location
              </h2>
              <p className="text-gray-600">
                Explore accommodation options at different stops on the Kedarnath route
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(citiesData as any[])
                .filter(city => city.is_major_hub && city.stay_vibe)
                .sort((a, b) => a.position_on_route - b.position_on_route)
                .map((city, index) => (
                  <motion.div
                    key={city.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/stays/location/${city.slug}`}>
                      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all group cursor-pointer border-2 hover:border-[#0071c2]">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-[#0071c2] transition-colors">
                            <Bed className="w-5 h-5 text-[#0071c2] group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#0071c2] transition-colors">
                              {city.name}
                            </h3>
                            <p className="text-xs text-gray-500">{city.stay_vibe}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <Mountain className="w-3 h-3" /> {city.elevation}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {city.distance_from_kedarnath}
                          </div>
                        </div>
                        {city.avg_hotel_price && (
                          <div className="mt-2 pt-2 border-t text-sm">
                            <span className="text-gray-500">Hotels from </span>
                            <span className="font-semibold text-[#0071c2]">{city.avg_hotel_price}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </Container>
        </section>

        {/* FAQ Section for SEO */}
        <Container className="py-12 bg-white border-t">
          <AIOptimizedFAQ 
            title="Frequently Asked Questions About Kedarnath Accommodation"
            description="Everything you need to know before booking your stay"
            faqs={StaysFAQs}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default StayListing;