import React, { useState } from "react";
import { Calendar, Users, MapPin, Plus, Minus, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../Container";
import "react-datepicker/dist/react-datepicker.css";

const Hero = () => {
  const [location, setLocation] = useState("kedarnath");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [showPets, setShowPets] = useState(false);

  // Format date to show day and month
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day} ${dayNum} ${month}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ location, checkIn, checkOut, adults, children, rooms, showPets });
    // Redirect to search results or process the form
  };

  const handleDateSelection = (day: number, month: number) => {
    if (!checkIn) {
      setCheckIn(new Date(2025, month, day));
    } else if (!checkOut) {
      setCheckOut(new Date(2025, month, day));
    } else {
      setCheckIn(new Date(2025, month, day));
      setCheckOut(null);
    }
  };

  const locations = [
    { value: "kedarnath", label: "Kedarnath" },
    { value: "sonprayag", label: "Sonprayag" },
    { value: "sersi", label: "Sersi" },
    { value: "guptakashi", label: "Guptakashi" },
    { value: "gaurikund", label: "Gaurikund" },
    { value: "rudraprayag", label: "Rudraprayag" },
    { value: "rishikesh", label: "Rishikesh" },
    { value: "haridwar", label: "Haridwar" },
  ];

  return (
    <section className="bg-[#003580] relative pb-10">
      <Container className="relative z-10 pt-6 pb-16">
        <div className="flex flex-col items-start text-left mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Discover Your Spiritual Journey<br />to Kedarnath
          </h1>
          <p className="text-xl text-white/90">
            Find Serene Stays and Plan Your Yatra with Ease.
          </p>
      </div>
      </Container>
      
      {/* Booking Form - Positioned at the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
        <Container>
          <form onSubmit={handleSubmit} className="relative">
            <div className="border-4 border-yellow-500 rounded-lg overflow-hidden mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Where are you going? */}
                <div className="md:col-span-3 bg-white py-2 px-4 flex items-center relative">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-2 flex-grow">
                    <label className="block text-xs text-gray-600">Where are you going?</label>
                    <button 
                      type="button"
                      className="cursor-pointer flex items-center font-medium bg-transparent border-0 p-0 text-left w-full"
                      onClick={() => {
                        setShowLocationDropdown(!showLocationDropdown);
                        setShowCalendar(false);
                        setShowGuestModal(false);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-gray-800">{locations.find(loc => loc.value === location)?.label}</span>
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      </div>
                    </button>
                  </div>
                  {/* Vertical yellow divider */}
                  <div className="absolute top-0 bottom-0 right-0 w-1 bg-yellow-500"></div>
                </div>

                {/* Check-in & Check-out dates */}
                <div className="md:col-span-3 bg-white py-2 px-4 flex items-center relative">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-2 flex-grow">
                    <label className="block text-xs text-gray-600">Check-in date — Check-out date</label>
                    <button 
                      type="button"
                      className="cursor-pointer flex items-center font-medium bg-transparent border-0 p-0 text-left w-full"
                      onClick={() => {
                        setShowCalendar(!showCalendar);
                        setShowGuestModal(false);
                        setShowLocationDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {checkIn && checkOut 
                            ? `${formatDate(checkIn)} — ${formatDate(checkOut)}`
                            : "Select dates"}
            </span>
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      </div>
                    </button>
                  </div>
                  {/* Vertical yellow divider */}
                  <div className="absolute top-0 bottom-0 right-0 w-1 bg-yellow-500"></div>
        </div>

                {/* Guests */}
                <div className="md:col-span-4 bg-white py-2 px-4 flex items-center relative">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-2 flex-grow">
                    <label className="block text-xs text-gray-600">Guests</label>
                    <button 
                      type="button"
                      className="cursor-pointer flex items-center font-medium bg-transparent border-0 p-0 text-left w-full"
                      onClick={() => {
                        setShowGuestModal(!showGuestModal);
                        setShowCalendar(false);
                        setShowLocationDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="whitespace-nowrap">{adults} adults · {children} children · {rooms} room</span>
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-1" />
                      </div>
                    </button>
                  </div>
                  {/* Vertical yellow divider */}
                  <div className="absolute top-0 bottom-0 right-0 w-1 bg-yellow-500"></div>
                </div>

                {/* Search Button */}
                <div className="md:col-span-2 bg-[#0071c2] hover:bg-[#00487a] cursor-pointer transition-colors">
                  <button
                    type="submit"
                    className="w-full h-full flex items-center justify-center text-white font-bold py-4"
                  >
                    Search
                  </button>
                </div>
                </div>
              </div>

            {/* Dropdowns rendered below the form, not inside */}
            {showLocationDropdown && (
              <div 
                className="absolute mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 z-50"
                style={{ left: '0', top: '100%' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Select Location</h3>
                  <button 
                    type="button" 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowLocationDropdown(false)}
                  >
                    ✕
                  </button>
              </div>

                <div className="max-h-64 overflow-y-auto">
                  {locations.map((loc) => (
                    <button
                      key={loc.value}
                      type="button"
                      className={`w-full text-left px-4 py-2 rounded hover:bg-gray-100 ${location === loc.value ? 'bg-[#e6f4ff] text-[#0071c2] font-medium' : ''}`}
                      onClick={() => {
                        setLocation(loc.value);
                        setShowLocationDropdown(false);
                      }}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
                  
            {/* Date picker popup - rendered outside the form */}
            {showCalendar && (
              <div 
                className="absolute mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[650px]"
                style={{ left: '50%', transform: 'translateX(-50%)', top: '100%' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-xl font-bold">Select Dates</h3>
                  <button 
                    type="button" 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCalendar(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="flex border-b">
                  <button
                    type="button"
                    className={`py-2 px-4 ${activeTab === 'calendar' ? 'border-b-2 border-[#0071c2] text-[#0071c2] font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('calendar')}
                  >
                    Calendar
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-4 ${activeTab === 'flexible' ? 'border-b-2 border-[#0071c2] text-[#0071c2] font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('flexible')}
                  >
                    I'm flexible
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <button type="button" className="text-[#0071c2] p-1">
                        &lt;
                      </button>
                      <h4 className="mx-4">May 2025</h4>
                    </div>
                    <div className="flex items-center">
                      <h4 className="mx-4">June 2025</h4>
                      <button type="button" className="text-[#0071c2] p-1">
                        &gt;
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-4">
                    {/* May 2025 */}
                    <div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="text-xs font-medium text-gray-600 h-6 flex items-center justify-center">
                            {day}
                          </div>
                        ))}
                        
                        {/* First week empty days */}
                        {[...Array(4)].map((_, i) => (
                          <div key={`empty-${i}`} className="h-10 w-10"></div>
                        ))}
                        
                        {/* May days */}
                        {[...Array(31)].map((_, i) => {
                          const day = i + 1;
                          const date = new Date(2025, 4, day);
                          const isSelected = (checkIn && day === checkIn.getDate() && checkIn.getMonth() === 4) || 
                                            (checkOut && day === checkOut.getDate() && checkOut.getMonth() === 4);
                          const isInRange = checkIn && checkOut && 
                                          date > checkIn && date < checkOut;
                          
                          return (
                            <button
                              key={`may-${day}`}
                              type="button"
                              className={`
                                h-10 w-10 text-sm rounded-full flex items-center justify-center
                                ${isSelected ? 'bg-[#0071c2] text-white' : ''}
                                ${isInRange ? 'bg-[#e6f4ff]' : ''}
                                ${!isSelected ? 'hover:bg-gray-100' : ''}
                                text-gray-700
                              `}
                              onClick={() => handleDateSelection(day, 4)}
                            >
                              {day}
                            </button>
                          );
                        })}
                </div>
              </div>

                    {/* June 2025 */}
                    <div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="text-xs font-medium text-gray-600 h-6 flex items-center justify-center">
                            {day}
                          </div>
                        ))}
                        
                        {/* First week empty days */}
                        {[...Array(7)].map((_, i) => (
                          <div key={`june-empty-${i}`} className="h-10 w-10"></div>
                        ))}
                        
                        {/* June days */}
                        {[...Array(30)].map((_, i) => {
                          const day = i + 1;
                          const date = new Date(2025, 5, day);
                          const isSelected = (checkIn && day === checkIn.getDate() && checkIn.getMonth() === 5) || 
                                            (checkOut && day === checkOut.getDate() && checkOut.getMonth() === 5);
                          const isInRange = checkIn && checkOut && 
                                          date > checkIn && date < checkOut;
                          
                          return (
                            <button
                              key={`june-${day}`}
                              type="button"
                              className={`
                                h-10 w-10 text-sm rounded-full flex items-center justify-center
                                ${isSelected ? 'bg-[#0071c2] text-white' : ''}
                                ${isInRange ? 'bg-[#e6f4ff]' : ''}
                                ${!isSelected ? 'hover:bg-gray-100' : ''}
                                text-gray-700
                              `}
                              onClick={() => handleDateSelection(day, 5)}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="py-2 px-8 bg-[#0071c2] text-white font-medium rounded hover:bg-[#00487a] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
                  
            {/* Guest Selection Modal - rendered outside the form */}
            {showGuestModal && (
              <div 
                className="absolute mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50"
                style={{ right: '0', top: '100%' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Select Guests</h3>
                  <button 
                    type="button" 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowGuestModal(false)}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Adults */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Adults</span>
                  <div className="flex items-center border border-gray-300 rounded w-32">
                    <button 
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))} 
                      disabled={adults <= 1}
                      className="w-10 h-10 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 border-r border-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{adults}</span>
                    <button 
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-10 h-10 flex items-center justify-center text-[#0071c2] border-l border-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Children */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Children</span>
                  <div className="flex items-center border border-gray-300 rounded w-32">
                    <button 
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))} 
                      disabled={children <= 0}
                      className="w-10 h-10 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 border-r border-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{children}</span>
                    <button 
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-10 h-10 flex items-center justify-center text-[#0071c2] border-l border-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Rooms */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-medium">Rooms</span>
                  <div className="flex items-center border border-gray-300 rounded w-32">
                    <button 
                      type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))} 
                      disabled={rooms <= 1}
                      className="w-10 h-10 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 border-r border-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{rooms}</span>
                    <button 
                      type="button"
                      onClick={() => setRooms(rooms + 1)}
                      className="w-10 h-10 flex items-center justify-center text-[#0071c2] border-l border-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pet toggle */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Travelling with pets?</span>
                    <div 
                      className={`w-12 h-6 rounded-full ${showPets ? 'bg-[#0071c2]' : 'bg-gray-300'} flex items-center p-1 cursor-pointer transition-colors duration-200`}
                      onClick={() => setShowPets(!showPets)}
                    >
                      <div 
                        className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${showPets ? 'translate-x-6' : ''}`}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Assistance animals aren't considered pets.
                    <a href="#" className="block text-[#0071c2] mt-1">
                      Read more about travelling with assistance animals
                    </a>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowGuestModal(false)}
                    className="py-2 px-6 bg-[#0071c2] text-white font-medium rounded hover:bg-[#00487a] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </form>
          
          {/* Looking for Package link - Placed below the search form */}
          <div className="mt-3 flex justify-end">
            <Link to="/packages" className="inline-flex items-center rounded-md bg-white px-4 py-2 text-[#0071c2] font-medium border border-[#FFD700] hover:bg-[#f5f9ff] transition-colors">
              I'm looking for package <span className="ml-2">→</span>
                </Link>
        </div>
      </Container>
      </div>
    </section>
  );
};

export default Hero;
