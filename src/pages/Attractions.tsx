import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Compass, Star, Users, Camera, Route, Heart, ArrowRight, Tag, ChevronDown, ChevronUp, Search } from "lucide-react";

import Container from "../components/Container";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

// Define attraction data
interface Attraction {
  id: string;
  name: string;
  type: string;
  description: string;
  shortDescription: string;
  image: string;
  distance: string;
  timeRequired: string;
  bestTime: string;
  difficulty: string;
  rating: number;
  tags: string[];
  location: string;
  coordinates?: { lat: number; lng: number };
}

const attractions: Attraction[] = [
  {
    id: "kedarnath-temple",
    name: "Kedarnath Temple",
    type: "Religious",
    description: "Kedarnath Temple is one of the holiest Hindu temples dedicated to Lord Shiva and is located on the Garhwal Himalayan range. The magnificent temple has stood for over 1000 years, surviving natural disasters including the devastating 2013 flood. The temple's architecture is awe-inspiring, with large stone slabs over a rectangular platform. The present temple was built by Adi Shankaracharya and stands adjacent to the site of an earlier temple built by the Pandavas.",
    shortDescription: "One of the holiest Hindu temples dedicated to Lord Shiva, located at an elevation of 3,583 m.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Kedarnath_Temple.JPG",
    distance: "0 km",
    timeRequired: "1-2 hours",
    bestTime: "May-June, September-October",
    difficulty: "Easy",
    rating: 5,
    tags: ["Temple", "Religious", "Historical", "Must Visit"],
    location: "Kedarnath, Rudraprayag"
  },
  {
    id: "bhairav-temple",
    name: "Bhairav Temple",
    type: "Religious",
    description: "Bhairav Temple is located at a short distance from Kedarnath Temple. The temple is dedicated to Bhairav, the fierce manifestation of Lord Shiva, who is believed to protect the area during the winter months when Kedarnath Temple is closed. Pilgrims often visit this temple after darshan at the main Kedarnath Temple to complete their pilgrimage. The temple offers magnificent views of the surrounding Himalayan peaks.",
    shortDescription: "A temple dedicated to Bhairav, believed to be the protector of Kedarnath during winter.",
    image: "https://www.euttaranchal.com/tourism/photos/bhairav-nath-temple-7053635.jpg",
    distance: "1 km",
    timeRequired: "1 hour",
    bestTime: "May-June, September-October",
    difficulty: "Moderate",
    rating: 4.5,
    tags: ["Temple", "Religious", "Hiking"],
    location: "Near Kedarnath Temple"
  },
  {
    id: "chorabari-tal",
    name: "Chorabari Tal (Gandhi Sarovar)",
    type: "Natural",
    description: "Chorabari Tal, also known as Gandhi Sarovar, is a glacial lake located about 3 km uphill from Kedarnath Temple. This pristine lake is formed from the melting glaciers of the surrounding Himalayan peaks. It's named after Mahatma Gandhi as his ashes were immersed here. The lake is surrounded by snow-capped mountains and offers a serene environment for meditation and reflection. During the 2013 floods, the lake overflowed, causing significant damage to the area.",
    shortDescription: "A glacial lake named after Mahatma Gandhi, offering pristine views of the Himalayas.",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Chorabari_Tal_%28Gandhi_Sarovar%29_-_panoramio.jpg",
    distance: "3 km",
    timeRequired: "3-4 hours",
    bestTime: "May-June, September-October",
    difficulty: "Moderate to Difficult",
    rating: 4.8,
    tags: ["Lake", "Natural", "Hiking", "Scenic"],
    location: "Above Kedarnath Temple"
  },
  {
    id: "vasuki-tal",
    name: "Vasuki Tal",
    type: "Natural",
    description: "Vasuki Tal is a high-altitude glacial lake situated at an elevation of 4,135 meters above sea level. The lake gets its name from Vasuki Nag (the serpent god) and is considered sacred. The trek to Vasuki Tal is challenging but rewarding, with breathtaking views of peaks like Kedarnath and Chaukhamba. The crystal-clear waters of the lake reflect the surrounding mountains, creating a mesmerizing sight. This is a perfect destination for trekkers and nature lovers seeking to explore beyond the usual pilgrimage route.",
    shortDescription: "A high-altitude sacred lake named after Vasuki Nag, with stunning mountain views.",
    image: "https://www.euttaranchal.com/tourism/photos/vasuki-tal-9238453.jpg",
    distance: "8 km",
    timeRequired: "Full day",
    bestTime: "June-September",
    difficulty: "Difficult",
    rating: 4.7,
    tags: ["Lake", "Natural", "Trekking", "Adventure"],
    location: "Beyond Kedarnath"
  },
  {
    id: "shankaracharya-samadhi",
    name: "Shankaracharya Samadhi",
    type: "Historical",
    description: "Shankaracharya Samadhi is the final resting place of Adi Shankaracharya, the reviver of Hindu philosophy in the 8th century. Located behind the Kedarnath Temple, this site holds great significance for followers of Hinduism. It is believed that after establishing the Kedarnath Temple, Adi Shankaracharya entered his samadhi (final meditation) at this spot. The site was damaged in the 2013 floods but has been restored and continues to be an important pilgrimage spot.",
    shortDescription: "The final resting place of Adi Shankaracharya, the 8th-century Hindu philosopher.",
    image: "https://media.newstrack.in/uploads/spiritual-news/religious-news/Jun/05/big_thumb/2_5cf7ac1e22b5f.jpg",
    distance: "0.5 km",
    timeRequired: "30 minutes",
    bestTime: "May-June, September-October",
    difficulty: "Easy",
    rating: 4.3,
    tags: ["Historical", "Religious", "Cultural"],
    location: "Behind Kedarnath Temple"
  },
  {
    id: "sonprayag",
    name: "Sonprayag",
    type: "Religious",
    description: "Sonprayag is one of the Panch Prayags (five confluences) of Alaknanda River and is the starting point for the trek or vehicle journey to Kedarnath. It's the confluence of rivers Mandakini and Basuki. The site is not only of geographical importance but also holds religious significance. According to Hindu mythology, this is where Lord Shiva's son Karthikeya hid himself in the form of gold, and Goddess Parvati had to find him. Pilgrims often take a holy dip here before proceeding to Kedarnath.",
    shortDescription: "A sacred confluence of rivers and the starting point for the journey to Kedarnath.",
    image: "https://static.toiimg.com/photo/msid-69935323/69935323.jpg",
    distance: "18 km",
    timeRequired: "1 hour",
    bestTime: "Year-round",
    difficulty: "Easy",
    rating: 4.2,
    tags: ["Confluence", "Religious", "Starting Point"],
    location: "Sonprayag, Rudraprayag"
  }
];

const Attractions = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Get unique types for filtering
  const attractionTypes = Array.from(new Set(attractions.map(a => a.type)));
  
  // Filter attractions based on search and type
  const filteredAttractions = attractions.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         attraction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attraction.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType ? attraction.type === filterType : true;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Helmet>
        <title>Attractions Near Kedarnath | StayKedarnath</title>
        <meta name="description" content="Explore the most beautiful and sacred attractions near Kedarnath. Plan your visit to these must-see destinations during your pilgrimage." />
      </Helmet>
      
      <Nav />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 relative bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=2070"
            alt="Kedarnath attractions"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-blue-900/60 z-0"></div>
        
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Attractions Near Kedarnath
            </motion.h1>
            <motion.p 
              className="text-lg text-blue-100 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover the most sacred and beautiful attractions around Kedarnath to enhance your spiritual journey
            </motion.p>
          </div>
        </Container>
      </section>
      
      {/* Search and Filter Section */}
      <section className="py-8 bg-white shadow-md dark:bg-gray-800">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-auto flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search attractions, activities, or keywords..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterType === null 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setFilterType(null)}
              >
                All
              </button>
              
              {attractionTypes.map(type => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterType === type 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>
      
      {/* Attractions List */}
      <section className="py-16">
        <Container>
          {filteredAttractions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No attractions found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAttractions.map((attraction) => (
                <motion.div
                  key={attraction.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col dark:bg-gray-800 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={attraction.image}
                      alt={attraction.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold uppercase rounded-full px-3 py-1.5">
                      {attraction.type}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 dark:text-white">{attraction.name}</h3>
                    
                    <div className="mb-4 flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < Math.floor(attraction.rating)
                                ? "text-yellow-500 fill-yellow-500"
                                : i < attraction.rating
                                ? "text-yellow-500 fill-yellow-500 opacity-50"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{attraction.rating.toFixed(1)}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 dark:text-gray-300">{attraction.shortDescription}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-blue-600 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">{attraction.distance}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="text-blue-600 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">{attraction.timeRequired}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="text-blue-600 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">{attraction.bestTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Compass size={16} className="text-blue-600 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">{attraction.difficulty}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex flex-wrap gap-2">
                      {attraction.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {attraction.tags.length > 3 && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                          +{attraction.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 pt-2">
                    <button
                      className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-between font-medium transition-colors duration-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300"
                      onClick={() => setExpandedId(expandedId === attraction.id ? null : attraction.id)}
                    >
                      <span>View Details</span>
                      {expandedId === attraction.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    
                    {expandedId === attraction.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-gray-700 dark:text-gray-300"
                      >
                        <p className="mb-4">{attraction.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin size={16} className="text-blue-600 mr-2" />
                            <span className="text-gray-600 dark:text-gray-400">{attraction.location}</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium dark:text-blue-400 dark:hover:text-blue-300">
                            <span>Get Directions</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </section>
      
      {/* Tips Section */}
      <section className="py-16 bg-blue-50 dark:bg-gray-850">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">Tips for Visiting Attractions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
              Make the most of your visit to Kedarnath with these helpful tips
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4 dark:bg-blue-900">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Best Timing</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Visit attractions early in the morning to avoid crowds and get the best views. The weather is generally clearer in the early hours.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4 dark:bg-blue-900">
                  <Compass className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Physical Preparation</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Most attractions require some trekking. Ensure you're physically prepared, stay hydrated, and acclimatize properly to the high altitude before attempting more challenging treks.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Local Guide</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Consider hiring a local guide who can provide insights about the religious and historical significance of these attractions, enhancing your experience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4 dark:bg-blue-900">
                  <Camera className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Photography</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Photography is allowed at most outdoor spots, but some temples restrict photography inside. Always ask for permission before taking photos at religious sites.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4 dark:bg-blue-900">
                  <Route className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Plan Your Route</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Plan your visits efficiently. Many attractions can be covered in a single day if they are close to each other. Consider the difficulty level and time required for each.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4 dark:bg-blue-900">
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Respect Sacred Sites</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Many attractions are considered sacred. Dress modestly, remove footwear when required, and maintain silence in temple premises as a sign of respect.
              </p>
            </div>
          </div>
        </Container>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to explore Kedarnath?</h2>
              <p className="text-blue-100 max-w-2xl">
                Book your stay with us and get customized recommendations for attractions based on your interests and schedule.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Book Now
              </button>
              <button className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors duration-200">
                Contact Us
              </button>
            </div>
          </div>
        </Container>
      </section>
      
      <Footer />
    </div>
  );
};

export default Attractions; 