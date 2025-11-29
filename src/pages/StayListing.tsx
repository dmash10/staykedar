import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Search, Calendar, Users, MapPin, Filter, Loader2, Bug } from 'lucide-react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { AvailableRoom, SearchRoomsParams } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';
import { showDebugInfo } from '@/utils/debug-helpers';

const StayListing: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search params
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [roomType, setRoomType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Results state
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Load rooms on mount and when search params change
  useEffect(() => {
    loadRooms();
  }, [currentPage, location, checkIn, checkOut, guests, roomType, priceRange]);

  const loadRooms = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading rooms with search params:', {
        checkIn,
        checkOut,
        location,
        guests
      });
      
      // Convert string dates to Date objects if needed
      const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
      const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
      
      // Use the updated searchRooms function with correct parameters
      const availableRooms = await stayService.searchRooms(
        checkInDate,
        checkOutDate,
        location || '',
        guests
      );
      
      console.log('Search returned rooms:', availableRooms?.length || 0);
      
      // Apply price filter if set
      let filteredRooms = availableRooms;
      if (priceRange[0] > 0 || priceRange[1] < 10000) {
        filteredRooms = availableRooms.filter(
          room => room.price >= priceRange[0] && room.price <= priceRange[1]
        );
      }
      
      // Apply room type filter if set
      if (roomType && roomType !== 'all') {
        filteredRooms = filteredRooms.filter(
          room => room.room_type === roomType
        );
      }
      
      console.log('After filtering:', filteredRooms?.length || 0, 'rooms match criteria');
      setRooms(filteredRooms);
      
      // Set total pages (assuming we know total count)
      // In a real app, you'd get this from the API
      setTotalPages(Math.ceil(filteredRooms.length / itemsPerPage));
      
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('Failed to load available rooms. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load available rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    // Update URL search params
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());
    
    setSearchParams(params);
    loadRooms();
  };

  const navigateToRoomDetail = (roomId: string) => {
    navigate(`/stays/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-[#003580] py-6">
          <Container>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Find Your Perfect Stay</h1>
              
              {/* Debug button - only visible in development */}
              {process.env.NODE_ENV !== 'production' && (
                <button
                  onClick={() => {
                    showDebugInfo();
                    toast({
                      title: "Debug Info",
                      description: "Check the console for diagnostics",
                      variant: "default",
                    });
                  }}
                  className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded text-white"
                >
                  <Bug size={16} />
                  <span>Diagnose</span>
                </button>
              )}
            </div>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Location */}
                <div className="md:col-span-3 flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where are you going?"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Check-in */}
                <div className="md:col-span-3 flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Check-out */}
                <div className="md:col-span-3 flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Guests */}
                <div className="md:col-span-2 flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
                
                {/* Search Button */}
                <div className="md:col-span-1">
                  <button
                    type="submit"
                    className="w-full bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-2 px-4 rounded"
                  >
                    <Search className="h-5 w-5 mx-auto" />
                  </button>
                </div>
              </div>
            </form>
          </Container>
        </div>
        
        <Container className="py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden text-blue-600"
                >
                  {showFilters ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className={`${showFilters ? 'block' : 'hidden md:block'}`}>
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                </div>
                
                {/* Room Type Filter */}
                <div>
                  <h3 className="font-medium mb-2">Room Type</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roomType"
                        checked={roomType === null}
                        onChange={() => setRoomType(null)}
                        className="mr-2"
                      />
                      <span>All Types</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roomType"
                        checked={roomType === 'single'}
                        onChange={() => setRoomType('single')}
                        className="mr-2"
                      />
                      <span>Single</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roomType"
                        checked={roomType === 'double'}
                        onChange={() => setRoomType('double')}
                        className="mr-2"
                      />
                      <span>Double</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roomType"
                        checked={roomType === 'suite'}
                        onChange={() => setRoomType('suite')}
                        className="mr-2"
                      />
                      <span>Suite</span>
                    </label>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange([0, 10000]);
                    setRoomType(null);
                  }}
                  className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            {/* Results */}
            <div className="flex-grow">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : error ? (
                <div className="bg-red-100 p-4 rounded-lg text-red-700">
                  {error}
                </div>
              ) : rooms.length === 0 ? (
                <div className="bg-yellow-100 p-4 rounded-lg text-yellow-700">
                  No rooms found matching your criteria. Try adjusting your search or filters.
                </div>
              ) : (
                <>
                  <p className="mb-4 text-gray-600">{rooms.length} stays found</p>
                  
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <div
                        key={room.room_id}
                        onClick={() => navigateToRoomDetail(room.room_id)}
                        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Room Image (placeholder) */}
                          <div className="w-full md:w-1/3 h-48 bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500">Room Image</span>
                          </div>
                          
                          {/* Room Details */}
                          <div className="w-full md:w-2/3 p-4">
                            <div className="flex justify-between">
                              <h3 className="text-xl font-bold">{room.room_name}</h3>
                              <span className="text-2xl font-bold text-[#0071c2]">
                                {formatPrice(room.price)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-2">at {room.property_name}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {room.room_type}
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {room.room_capacity} Guests
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-4">
                              This comfortable {room.room_type} room can accommodate up to {room.room_capacity} guests.
                            </p>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToRoomDetail(room.room_id);
                              }}
                              className="bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-2 px-4 rounded"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded-md ${
                              currentPage === page
                                ? 'bg-[#0071c2] text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
      </main>
      <Footer />
    </>
  );
};

export default StayListing; 