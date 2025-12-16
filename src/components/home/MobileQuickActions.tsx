import { useState, useEffect } from "react";
import { Phone, MessageCircle, Search, X, Home, MapPin, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MobileQuickActions = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Phone number for calls
    const phoneNumber = '+919027475042';

    // WhatsApp message
    const handleWhatsApp = () => {
        const message = encodeURIComponent('Hi! I need help with Kedarnath Yatra booking.');
        window.open(`https://wa.me/919027475042?text=${message}`, '_blank');
    };

    // Call
    const handleCall = () => {
        window.location.href = `tel:${phoneNumber}`;
    };

    // Navigation items
    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: MapPin, label: 'Stays', path: '/stays/smart' },
        { icon: Package, label: 'Packages', path: '/packages' },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile Bottom Navigation - Only visible on mobile */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom"
                    >
                        <div className="flex items-stretch">
                            {/* Quick Actions - Left Side */}
                            <div className="flex-1 flex">
                                {/* Call Button */}
                                <button
                                    onClick={handleCall}
                                    className="flex-1 flex flex-col items-center justify-center py-2 px-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                >
                                    <div className="p-1.5 rounded-full bg-green-100">
                                        <Phone className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-[10px] mt-1 font-medium">Call</span>
                                </button>

                                {/* WhatsApp Button */}
                                <button
                                    onClick={handleWhatsApp}
                                    className="flex-1 flex flex-col items-center justify-center py-2 px-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                >
                                    <div className="p-1.5 rounded-full bg-green-100">
                                        <MessageCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-[10px] mt-1 font-medium">WhatsApp</span>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="w-px bg-gray-200 my-2" />

                            {/* Navigation - Right Side */}
                            <div className="flex-1 flex">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 transition-colors ${active
                                                    ? 'text-[#0071c2]'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-full ${active ? 'bg-blue-100' : ''}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[10px] mt-1 ${active ? 'font-bold' : 'font-medium'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Modal */}
            <AnimatePresence>
                {showSearchModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 z-[60] bg-white"
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                            <button
                                onClick={() => setShowSearchModal(false)}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search destinations, hotels..."
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0071c2]"
                                />
                            </div>
                        </div>

                        <div className="p-4">
                            <p className="text-sm text-gray-500 mb-3">Popular Searches</p>
                            <div className="flex flex-wrap gap-2">
                                {['Kedarnath Hotels', 'Helicopter Booking', 'Char Dham Package', 'Budget Stays'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => {
                                            setShowSearchModal(false);
                                            navigate(`/search?q=${encodeURIComponent(term)}`);
                                        }}
                                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MobileQuickActions;
