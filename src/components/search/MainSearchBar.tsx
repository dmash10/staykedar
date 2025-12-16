import React, { useState, useEffect, useRef } from "react";
import { Calendar, Users, MapPin, Plus, Minus, ChevronDown, ChevronLeft, ChevronRight, X, Search, Mountain, Building, Tent, Home, Star, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MainSearchBarProps {
    initialLocation?: string;
    initialCheckIn?: Date | null;
    initialCheckOut?: Date | null;
    initialGuests?: { adults: number; children: number; rooms: number };
    onSearch?: (data: { location: string; checkIn: Date | null; checkOut: Date | null; guests: { adults: number; children: number; rooms: number } }) => void;
    className?: string;
}

import { supabase } from "@/integrations/supabase/client";

interface Destination {
    id: string;
    slug: string;
    name: string;
    type: string;
    description: string;
    elevation: string;
    is_popular: boolean;
    image_url: string;
}

const MainSearchBar: React.FC<MainSearchBarProps> = ({
    initialLocation = "kedarnath",
    initialCheckIn = null,
    initialCheckOut = null,
    initialGuests = { adults: 2, children: 0, rooms: 1 },
    onSearch,
    className = ""
}) => {
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState<Destination[]>([]);

    // Fetch destinations on mount
    useEffect(() => {
        const fetchDestinations = async () => {
            const { data } = await supabase
                .from('destinations')
                .select('*')
                .order('display_order', { ascending: true });

            if (data) setDestinations(data);
        };
        fetchDestinations();
    }, []);

    // Icon mapping helper
    const getDestinationIcon = (type: string) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('base camp') || lowerType.includes('camp')) return Tent;
        if (lowerType.includes('town') || lowerType.includes('city') || lowerType.includes('stay')) return Building;
        if (lowerType.includes('home')) return Home;
        return Mountain; // Default for Temple, Hill Station, etc.
    };

    const [location, setLocation] = useState(initialLocation);
    const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
    const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);
    const [adults, setAdults] = useState(initialGuests.adults);
    const [children, setChildren] = useState(initialGuests.children);
    const [rooms, setRooms] = useState(initialGuests.rooms);
    const [childrenAges, setChildrenAges] = useState<number[]>([]);

    const [showGuestModal, setShowGuestModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [locationSearch, setLocationSearch] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingCheckOut, setSelectingCheckOut] = useState(false);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

    const locationInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Filter destinations based on search
    const filteredDestinations = destinations.filter(dest =>
        dest.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
        (dest.description && dest.description.toLowerCase().includes(locationSearch.toLowerCase())) ||
        (dest.type && dest.type.toLowerCase().includes(locationSearch.toLowerCase()))
    );

    const popularDestinations = destinations.filter(d => d.is_popular);

    // Update state when props change
    useEffect(() => {
        if (initialLocation) setLocation(initialLocation);
        if (initialCheckIn) setCheckIn(initialCheckIn);
        if (initialCheckOut) setCheckOut(initialCheckOut);
        if (initialGuests) {
            setAdults(initialGuests.adults);
            setChildren(initialGuests.children);
            setRooms(initialGuests.rooms);
        }
    }, [initialLocation, initialCheckIn, initialCheckOut, initialGuests]);

    // Update children ages array when children count changes
    useEffect(() => {
        if (children > childrenAges.length) {
            setChildrenAges([...childrenAges, ...Array(children - childrenAges.length).fill(5)]);
        } else if (children < childrenAges.length) {
            setChildrenAges(childrenAges.slice(0, children));
        }
    }, [children]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (formRef.current && !formRef.current.contains(e.target as Node)) {
                closeAllDropdowns();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when location dropdown opens
    useEffect(() => {
        if (showLocationDropdown && locationInputRef.current) {
            locationInputRef.current.focus();
        }
    }, [showLocationDropdown]);

    // Get next month
    const getNextMonth = (date: Date) => {
        const next = new Date(date);
        next.setMonth(next.getMonth() + 1);
        return next;
    };

    // Navigate months
    const goToPreviousMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(prev.getMonth() - 1);
        if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
            setCurrentMonth(prev);
        }
    };

    const goToNextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        setCurrentMonth(next);
    };

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    // Get first day of month
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    // Check if date is in the past
    const isPastDate = (year: number, month: number, day: number) => {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Format date
    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[date.getDay()]} ${date.getDate()} ${shortMonthNames[date.getMonth()]}`;
    };

    // Format date for display
    const formatDateShort = (date: Date | null) => {
        if (!date) return '';
        return `${date.getDate()} ${shortMonthNames[date.getMonth()]}`;
    };

    // Calculate nights between dates
    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (onSearch) {
            onSearch({ location, checkIn, checkOut, guests: { adults, children, rooms } });
        }

        const params = new URLSearchParams();
        params.set('location', location);

        if (checkIn) {
            params.set('checkIn', checkIn.toISOString());
        }

        if (checkOut) {
            params.set('checkOut', checkOut.toISOString());
        }

        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('rooms', rooms.toString());

        navigate(`/stays?${params.toString()}`);
    };

    const handleDateSelection = (day: number, monthIndex: number, year: number) => {
        if (isPastDate(year, monthIndex, day)) return;

        const selectedDate = new Date(year, monthIndex, day);

        if (!checkIn || (checkIn && checkOut)) {
            // Start new selection
            setCheckIn(selectedDate);
            setCheckOut(null);
            setSelectingCheckOut(true);
        } else if (selectingCheckOut) {
            // Selecting checkout
            if (selectedDate > checkIn) {
                setCheckOut(selectedDate);
                setSelectingCheckOut(false);
            } else {
                // If clicked date is before check-in, restart selection
                setCheckIn(selectedDate);
                setCheckOut(null);
            }
        }
    };

    // Quick date selection
    const selectQuickDates = (type: 'tonight' | 'tomorrow' | 'weekend' | 'nextWeek') => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        switch (type) {
            case 'tonight':
                setCheckIn(now);
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setCheckOut(tomorrow);
                break;
            case 'tomorrow':
                const tom = new Date(now);
                tom.setDate(tom.getDate() + 1);
                setCheckIn(tom);
                const dayAfter = new Date(tom);
                dayAfter.setDate(dayAfter.getDate() + 1);
                setCheckOut(dayAfter);
                break;
            case 'weekend':
                // Find next Friday
                const friday = new Date(now);
                const dayOfWeek = friday.getDay();
                const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
                friday.setDate(friday.getDate() + daysUntilFriday);
                setCheckIn(friday);
                const sunday = new Date(friday);
                sunday.setDate(sunday.getDate() + 2);
                setCheckOut(sunday);
                break;
            case 'nextWeek':
                // Next Monday to Friday
                const monday = new Date(now);
                const daysUntilMonday = (8 - monday.getDay()) % 7 || 7;
                monday.setDate(monday.getDate() + daysUntilMonday);
                setCheckIn(monday);
                const nextFriday = new Date(monday);
                nextFriday.setDate(nextFriday.getDate() + 4);
                setCheckOut(nextFriday);
                break;
        }
    };

    const closeAllDropdowns = () => {
        setShowLocationDropdown(false);
        setShowCalendar(false);
        setShowGuestModal(false);
        setLocationSearch("");
    };

    const renderCalendar = (month: Date, isSecondMonth: boolean = false) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = getDaysInMonth(month);
        const firstDay = getFirstDayOfMonth(month);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${monthIndex}-${i}`} className="h-8 w-8 md:h-9 md:w-9"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const isPast = isPastDate(year, monthIndex, day);
            const isCheckIn = checkIn && date.toDateString() === checkIn.toDateString();
            const isCheckOut = checkOut && date.toDateString() === checkOut.toDateString();
            const isInRange = checkIn && checkOut && date > checkIn && date < checkOut;
            const isHoveredRange = checkIn && !checkOut && hoveredDate && date > checkIn && date <= hoveredDate;
            const isToday = date.toDateString() === today.toDateString();

            days.push(
                <button
                    key={`day-${monthIndex}-${day}`}
                    type="button"
                    disabled={isPast}
                    className={`
                        h-8 w-8 md:h-9 md:w-9 text-xs md:text-sm rounded-full flex items-center justify-center relative transition-all
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-[#e6f4ff]'}
                        ${isCheckIn ? 'bg-[#0071c2] text-white font-bold' : ''}
                        ${isCheckOut ? 'bg-[#0071c2] text-white font-bold' : ''}
                        ${isInRange ? 'bg-[#e6f4ff]' : ''}
                        ${isHoveredRange ? 'bg-[#f0f8ff]' : ''}
                        ${isToday && !isCheckIn && !isCheckOut ? 'ring-1 ring-[#0071c2] font-semibold' : ''}
                    `}
                    onClick={() => !isPast && handleDateSelection(day, monthIndex, year)}
                    onMouseEnter={() => !isPast && selectingCheckOut && setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                >
                    {day}
                </button>
            );
        }

        return (
            <div className={isSecondMonth ? "hidden md:block" : ""}>
                <h4 className="font-semibold text-sm text-center mb-2">
                    {monthNames[monthIndex]} {year}
                </h4>
                <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(dayName => (
                        <div key={`${monthIndex}-${dayName}`} className="text-[10px] font-medium text-gray-500 h-6 flex items-center justify-center">
                            {dayName}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center">{days}</div>
            </div>
        );
    };

    const selectedDestination = destinations.find(d => d.slug === location);

    return (
        <form ref={formRef} onSubmit={handleSubmit} className={`relative ${className}`}>
            {/* Premium Search Container */}
            <div className="bg-white p-2 rounded-xl shadow-xl border border-blue-100/50 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-[3px]">
                    {/* Location */}
                    <div className="md:col-span-3 relative">
                        <div
                            className="bg-white py-3 px-4 flex items-center h-14 md:h-auto cursor-pointer rounded-md md:rounded-l-md md:rounded-r-none hover:bg-gray-50 transition-colors"
                            onClick={() => {
                                setShowLocationDropdown(!showLocationDropdown);
                                setShowCalendar(false);
                                setShowGuestModal(false);
                            }}
                        >
                            <div className="flex-shrink-0">
                                <MapPin className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-2 flex-grow">
                                <label className="block text-xs text-gray-600">Where are you going?</label>
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-gray-800 truncate text-sm md:text-base font-medium">
                                        {selectedDestination?.name || (location === "kedarnath" ? "Kedarnath" : location)}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                </div>
                            </div>
                        </div>

                        {/* Location Dropdown */}
                        {showLocationDropdown && (
                            <div
                                className="absolute left-0 right-0 md:w-[360px] top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Search Input */}
                                <div className="p-3 border-b sticky top-0 bg-white">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            ref={locationInputRef}
                                            type="text"
                                            placeholder="Search destinations..."
                                            value={locationSearch}
                                            onChange={(e) => setLocationSearch(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0071c2]"
                                        />
                                        {locationSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setLocationSearch("")}
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                            >
                                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-y-auto max-h-[50vh]">
                                    {/* Popular Destinations */}
                                    {!locationSearch && (
                                        <div className="p-3 border-b">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Popular Destinations</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {popularDestinations.slice(0, 6).map((dest) => (
                                                    <button
                                                        key={dest.slug}
                                                        type="button"
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${location === dest.slug
                                                                ? 'bg-[#0071c2] text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        onClick={() => {
                                                            setLocation(dest.slug);
                                                            closeAllDropdowns();
                                                        }}
                                                    >
                                                        {dest.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* All Destinations */}
                                    <div className="p-2">
                                        {filteredDestinations.length === 0 ? (
                                            <p className="text-center text-gray-500 py-4 text-sm">No destinations found</p>
                                        ) : (
                                            filteredDestinations.map((dest) => {
                                                const IconComponent = getDestinationIcon(dest.type);
                                                return (
                                                    <button
                                                        key={dest.slug}
                                                        type="button"
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${location === dest.slug
                                                                ? 'bg-[#e6f4ff]'
                                                                : 'hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => {
                                                            setLocation(dest.slug);
                                                            closeAllDropdowns();
                                                        }}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${location === dest.slug ? 'bg-[#0071c2]' : 'bg-gray-100'
                                                            }`}>
                                                            <IconComponent className={`w-5 h-5 ${location === dest.slug ? 'text-white' : 'text-gray-600'}`} />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium text-sm ${location === dest.slug ? 'text-[#0071c2]' : 'text-gray-800'}`}>
                                                                    {dest.name}
                                                                </span>
                                                                {dest.is_popular && (
                                                                    <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                                                        Popular
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500">{dest.description} • {dest.elevation}</p>
                                                        </div>
                                                        {location === dest.slug && (
                                                            <Check className="w-5 h-5 text-[#0071c2]" />
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="md:col-span-3 relative">
                        <div
                            className="bg-white py-3 px-4 flex items-center h-14 md:h-auto cursor-pointer rounded-md md:rounded-none hover:bg-gray-50 transition-colors"
                            onClick={() => {
                                setShowCalendar(!showCalendar);
                                setShowGuestModal(false);
                                setShowLocationDropdown(false);
                            }}
                        >
                            <div className="flex-shrink-0">
                                <Calendar className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-2 flex-grow">
                                <label className="block text-xs text-gray-600">Check-in — Check-out</label>
                                <div className="flex items-center justify-between w-full">
                                    <span className="truncate text-sm md:text-base font-medium">
                                        {checkIn && checkOut
                                            ? `${formatDateShort(checkIn)} — ${formatDateShort(checkOut)}`
                                            : checkIn
                                                ? `${formatDateShort(checkIn)} — Select`
                                                : "Select dates"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                </div>
                            </div>
                        </div>

                        {/* Calendar Dropdown */}
                        {showCalendar && (
                            <div
                                className="absolute left-0 right-0 md:left-auto md:right-auto md:w-[580px] top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header with selection info */}
                                <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-500 uppercase">Check-in</p>
                                                <p className={`text-sm font-semibold ${checkIn ? 'text-[#0071c2]' : 'text-gray-400'}`}>
                                                    {checkIn ? formatDate(checkIn) : 'Select date'}
                                                </p>
                                            </div>
                                            <div className="text-gray-300">→</div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-500 uppercase">Check-out</p>
                                                <p className={`text-sm font-semibold ${checkOut ? 'text-[#0071c2]' : 'text-gray-400'}`}>
                                                    {checkOut ? formatDate(checkOut) : 'Select date'}
                                                </p>
                                            </div>
                                            {checkIn && checkOut && (
                                                <div className="bg-[#e6f4ff] px-2 py-1 rounded text-xs font-medium text-[#0071c2]">
                                                    {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="p-1 hover:bg-gray-200 rounded-full"
                                            onClick={closeAllDropdowns}
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Select Options */}
                                <div className="px-3 py-2 border-b flex gap-2 overflow-x-auto">
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                                        onClick={() => selectQuickDates('tonight')}
                                    >
                                        Tonight
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                                        onClick={() => selectQuickDates('tomorrow')}
                                    >
                                        Tomorrow
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                                        onClick={() => selectQuickDates('weekend')}
                                    >
                                        This Weekend
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                                        onClick={() => selectQuickDates('nextWeek')}
                                    >
                                        Next Week
                                    </button>
                                    {(checkIn || checkOut) && (
                                        <button
                                            type="button"
                                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 whitespace-nowrap"
                                            onClick={() => { setCheckIn(null); setCheckOut(null); }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Calendar Grid */}
                                <div className="p-3">
                                    {/* Month Navigation */}
                                    <div className="flex justify-between items-center mb-3">
                                        <button
                                            type="button"
                                            className="p-2 text-[#0071c2] hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                                            onClick={goToPreviousMonth}
                                            disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <div className="flex-grow" />
                                        <button
                                            type="button"
                                            className="p-2 text-[#0071c2] hover:bg-gray-100 rounded-full"
                                            onClick={goToNextMonth}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Two Month View on Desktop, One on Mobile */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderCalendar(currentMonth)}
                                        {renderCalendar(getNextMonth(currentMonth), true)}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t p-3 flex justify-between items-center bg-gray-50 rounded-b-lg">
                                    <p className="text-xs text-gray-500">
                                        {selectingCheckOut ? 'Select check-out date' : 'Select check-in date'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={closeAllDropdowns}
                                        className="py-2 px-5 bg-[#0071c2] text-white text-sm font-medium rounded-lg hover:bg-[#00487a] transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Guests */}
                    <div className="md:col-span-4 relative">
                        <div
                            className="bg-white py-3 px-4 flex items-center h-14 md:h-auto cursor-pointer rounded-md md:rounded-none hover:bg-gray-50 transition-colors"
                            onClick={() => {
                                setShowGuestModal(!showGuestModal);
                                setShowCalendar(false);
                                setShowLocationDropdown(false);
                            }}
                        >
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-2 flex-grow">
                                <label className="block text-xs text-gray-600">Guests</label>
                                <div className="flex items-center justify-between w-full">
                                    <span className="whitespace-nowrap truncate text-sm md:text-base font-medium">
                                        {adults + children} guest{adults + children !== 1 ? 's' : ''} · {rooms} room{rooms !== 1 ? 's' : ''}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-1" />
                                </div>
                            </div>
                        </div>

                        {/* Guest Dropdown */}
                        {showGuestModal && (
                            <div
                                className="absolute left-0 right-0 md:right-0 md:left-auto md:w-[320px] top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4">
                                    {/* Rooms */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-800">Rooms</span>
                                            <p className="text-xs text-gray-500">Number of rooms needed</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setRooms(Math.max(1, rooms - 1))}
                                                disabled={rooms <= 1}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 disabled:border-gray-200 hover:border-[#0071c2] disabled:hover:border-gray-200"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-semibold">{rooms}</span>
                                            <button
                                                type="button"
                                                onClick={() => setRooms(Math.min(10, rooms + 1))}
                                                disabled={rooms >= 10}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 disabled:border-gray-200 hover:border-[#0071c2] disabled:hover:border-gray-200"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Adults */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-800">Adults</span>
                                            <p className="text-xs text-gray-500">Ages 18 or above</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                                disabled={adults <= 1}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 disabled:border-gray-200 hover:border-[#0071c2] disabled:hover:border-gray-200"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-semibold">{adults}</span>
                                            <button
                                                type="button"
                                                onClick={() => setAdults(Math.min(30, adults + 1))}
                                                disabled={adults >= 30}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 disabled:border-gray-200 hover:border-[#0071c2] disabled:hover:border-gray-200"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children */}
                                    <div className="py-3 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-semibold text-gray-800">Children</span>
                                                <p className="text-xs text-gray-500">Ages 0-17</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                                    disabled={children <= 0}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 disabled:border-gray-200 hover:border-[#0071c2] disabled:hover:border-gray-200"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-6 text-center font-semibold">{children}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setChildren(Math.min(10, children + 1))}
                                                    disabled={children >= 10}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[#0071c2] disabled:text-gray-300 disabled:border-gray-200 hover:border-[#0071c2] disabled:hover:border-gray-200"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Children Ages */}
                                        {children > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs text-gray-500">Age of children at check-out</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {childrenAges.map((age, index) => (
                                                        <select
                                                            key={index}
                                                            value={age}
                                                            onChange={(e) => {
                                                                const newAges = [...childrenAges];
                                                                newAges[index] = parseInt(e.target.value);
                                                                setChildrenAges(newAges);
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0071c2]"
                                                        >
                                                            <option value="">Child {index + 1} age</option>
                                                            {[...Array(18)].map((_, i) => (
                                                                <option key={i} value={i}>{i} year{i !== 1 ? 's' : ''} old</option>
                                                            ))}
                                                        </select>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Summary */}
                                    <div className="pt-3 flex items-center justify-between">
                                        <div className="text-xs text-gray-500">
                                            {rooms} room{rooms !== 1 ? 's' : ''} for {adults + children} guest{adults + children !== 1 ? 's' : ''}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={closeAllDropdowns}
                                            className="py-2 px-5 bg-[#0071c2] text-white text-sm font-medium rounded-lg hover:bg-[#00487a] transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full h-14 md:h-full bg-[#0071c2] hover:bg-[#00487a] cursor-pointer transition-colors rounded-md md:rounded-l-none md:rounded-r-md flex items-center justify-center text-white font-bold text-lg md:text-base gap-2"
                        >
                            <Search className="w-5 h-5" />
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default MainSearchBar;
