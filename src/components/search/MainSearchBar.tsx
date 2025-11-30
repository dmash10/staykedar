import React, { useState, useEffect } from "react";
import { Calendar, Users, MapPin, Plus, Minus, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

interface MainSearchBarProps {
    initialLocation?: string;
    initialCheckIn?: Date | null;
    initialCheckOut?: Date | null;
    initialGuests?: { adults: number; children: number; rooms: number };
    onSearch?: (data: { location: string; checkIn: Date | null; checkOut: Date | null; guests: { adults: number; children: number; rooms: number } }) => void;
    className?: string;
}

const MainSearchBar: React.FC<MainSearchBarProps> = ({
    initialLocation = "kedarnath",
    initialCheckIn = null,
    initialCheckOut = null,
    initialGuests = { adults: 2, children: 0, rooms: 1 },
    onSearch,
    className = ""
}) => {
    const [location, setLocation] = useState(initialLocation);
    const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
    const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);
    const [adults, setAdults] = useState(initialGuests.adults);
    const [children, setChildren] = useState(initialGuests.children);
    const [rooms, setRooms] = useState(initialGuests.rooms);

    const [showGuestModal, setShowGuestModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState("calendar");
    const [showPets, setShowPets] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [flexibleDuration, setFlexibleDuration] = useState("weekend");
    const [selectedFlexibleMonths, setSelectedFlexibleMonths] = useState<string[]>([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
        // Don't allow going before current month
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
        if (onSearch) {
            onSearch({ location, checkIn, checkOut, guests: { adults, children, rooms } });
        }
    };

    const handleDateSelection = (day: number, monthIndex: number, year: number) => {
        if (isPastDate(year, monthIndex, day)) return;

        const selectedDate = new Date(year, monthIndex, day);

        if (!checkIn) {
            setCheckIn(selectedDate);
        } else if (!checkOut) {
            if (selectedDate > checkIn) {
                setCheckOut(selectedDate);
            } else {
                setCheckIn(selectedDate);
                setCheckOut(null);
            }
        } else {
            setCheckIn(selectedDate);
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

    const renderCalendar = (month: Date) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = getDaysInMonth(month);
        const firstDay = getFirstDayOfMonth(month);
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const isPast = isPastDate(year, monthIndex, day);
            const isSelected = (checkIn && date.toDateString() === checkIn.toDateString()) ||
                (checkOut && date.toDateString() === checkOut.toDateString());
            const isInRange = checkIn && checkOut && date > checkIn && date < checkOut;

            days.push(
                <button
                    key={`day-${day}`}
                    type="button"
                    disabled={isPast}
                    className={`
            h-10 w-10 text-sm rounded-full flex items-center justify-center
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}
            ${isSelected ? 'bg-[#0071c2] text-white font-semibold' : ''}
            ${isInRange ? 'bg-[#e6f4ff]' : ''}
            ${!isSelected && !isPast ? 'hover:bg-gray-100' : ''}
          `}
                    onClick={() => !isPast && handleDateSelection(day, monthIndex, year)}
                >
                    {day}
                </button>
            );
        }

        return <div className="grid grid-cols-7 gap-1 text-center">{days}</div>;
    };

    return (
        <form onSubmit={handleSubmit} className={`relative shadow-2xl rounded-lg ${className}`}>
            <div className="border-4 border-yellow-500 rounded-lg overflow-hidden mx-auto bg-white">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                    {/* Location */}
                    <div className="md:col-span-3 bg-white py-2 px-4 flex items-center relative border-b md:border-b-0 md:border-r border-gray-200">
                        <div className="flex-shrink-0">
                            <MapPin className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-2 flex-grow">
                            <label className="block text-xs text-gray-600">Where are you going?</label>
                            <button
                                type="button"
                                className="cursor-pointer flex items-center font-medium bg-transparent border-0 p-0 text-left w-full focus:outline-none"
                                onClick={() => {
                                    setShowLocationDropdown(!showLocationDropdown);
                                    setShowCalendar(false);
                                    setShowGuestModal(false);
                                }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-gray-800 truncate">{locations.find(loc => loc.value === location)?.label || location}</span>
                                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="md:col-span-3 bg-white py-2 px-4 flex items-center relative border-b md:border-b-0 md:border-r border-gray-200">
                        <div className="flex-shrink-0">
                            <Calendar className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-2 flex-grow">
                            <label className="block text-xs text-gray-600">Check-in date — Check-out date</label>
                            <button
                                type="button"
                                className="cursor-pointer flex items-center font-medium bg-transparent border-0 p-0 text-left w-full focus:outline-none"
                                onClick={() => {
                                    setShowCalendar(!showCalendar);
                                    setShowGuestModal(false);
                                    setShowLocationDropdown(false);
                                }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="truncate">
                                        {checkIn && checkOut
                                            ? `${formatDate(checkIn)} — ${formatDate(checkOut)}`
                                            : "Select dates"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                </div>
                            </button>
                        </div>
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
                                className="cursor-pointer flex items-center font-medium bg-transparent border-0 p-0 text-left w-full focus:outline-none"
                                onClick={() => {
                                    setShowGuestModal(!showGuestModal);
                                    setShowCalendar(false);
                                    setShowLocationDropdown(false);
                                }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="whitespace-nowrap truncate">{adults} adults · {children} children · {rooms} room</span>
                                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-1" />
                                </div>
                            </button>
                        </div>
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

            {/* Location Dropdown */}
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

            {/* Calendar Popup */}
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

                    {/* Tabs */}
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
                        {activeTab === 'calendar' ? (
                            <>
                                {/* Month Headers */}
                                <div className="flex justify-between mb-4">
                                    <div className="flex items-center">
                                        <button
                                            type="button"
                                            className="text-[#0071c2] p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                            onClick={goToPreviousMonth}
                                            disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <h4 className="mx-4 font-medium w-32">
                                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                        </h4>
                                    </div>
                                    <div className="flex items-center">
                                        <h4 className="mx-4 font-medium w-32">
                                            {monthNames[getNextMonth(currentMonth).getMonth()]} {getNextMonth(currentMonth).getFullYear()}
                                        </h4>
                                        <button
                                            type="button"
                                            className="text-[#0071c2] p-1 hover:bg-gray-100 rounded"
                                            onClick={goToNextMonth}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Calendars */}
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Current Month */}
                                    <div>
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                <div key={day} className="text-xs font-medium text-gray-600 h-6 flex items-center justify-center">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        {renderCalendar(currentMonth)}
                                    </div>

                                    {/* Next Month */}
                                    <div>
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                <div key={day} className="text-xs font-medium text-gray-600 h-6 flex items-center justify-center">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        {renderCalendar(getNextMonth(currentMonth))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 mt-6 pt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(false)}
                                        className="py-2 px-8 bg-[#0071c2] text-white font-medium rounded hover:bg-[#00487a] transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Flexible Dates Tab
                            <div className="space-y-6">
                                {/* Duration Selection */}
                                <div>
                                    <h4 className="text-base font-semibold mb-3">How long do you want to stay?</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { value: "weekend", label: "A weekend" },
                                            { value: "week", label: "A week" },
                                            { value: "month", label: "A month" },
                                            { value: "other", label: "Other" }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFlexibleDuration(option.value)}
                                                className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${flexibleDuration === option.value
                                                    ? "border-[#0071c2] bg-[#e6f4ff] text-[#0071c2]"
                                                    : "border-gray-300 hover:border-[#0071c2]"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Month Selection */}
                                <div>
                                    <h4 className="text-base font-semibold mb-3">When do you want to go?</h4>
                                    <p className="text-sm text-gray-600 mb-4">Select up to 3 months</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { month: "Nov", year: "2025" },
                                            { month: "Dec", year: "2025" },
                                            { month: "Jan", year: "2026" },
                                            { month: "Feb", year: "2026" },
                                            { month: "Mar", year: "2026" },
                                            { month: "Apr", year: "2026" }
                                        ].map((item) => {
                                            const key = `${item.month}-${item.year}`;
                                            const isSelected = selectedFlexibleMonths.includes(key);
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedFlexibleMonths(prev => prev.filter(m => m !== key));
                                                        } else if (selectedFlexibleMonths.length < 3) {
                                                            setSelectedFlexibleMonths(prev => [...prev, key]);
                                                        }
                                                    }}
                                                    className={`py-3 px-4 rounded-lg border-2 text-center transition-all ${isSelected
                                                        ? "border-[#0071c2] bg-[#0071c2] text-white"
                                                        : "border-gray-300 hover:border-[#0071c2]"
                                                        }`}
                                                >
                                                    <div className="font-medium">{item.month}</div>
                                                    <div className="text-xs opacity-75">{item.year}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFlexibleDuration("weekend");
                                            setSelectedFlexibleMonths([]);
                                        }}
                                        className="px-6 py-2 text-[#0071c2] font-medium hover:bg-gray-100 rounded"
                                    >
                                        Clear all
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(false)}
                                        className="px-6 py-2 bg-[#0071c2] text-white font-medium rounded hover:bg-[#00487a] transition-colors"
                                    >
                                        Select dates and months
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Guest Selection Modal */}
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
    );
};

export default MainSearchBar;
