import { BlindProperty } from '@/types/stays';

// Fallback images for properties without photos
const FALLBACK_IMAGES: Record<string, string[]> = {
    budget: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    ],
    standard: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    ],
    premium: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
    ],
};

export const getPropertyImages = (property: BlindProperty): string[] => {
    if (property.images && property.images.length > 0) {
        return property.images;
    }
    return FALLBACK_IMAGES[property.category] || FALLBACK_IMAGES.standard;
};

// Generate scarcity count (1-3 rooms left)
export const getScarcityCount = (propertyId: string): number => {
    // Use property ID hash for consistent display
    const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 3) + 1;
};

// Format price for display
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
};

// Calculate fake "market rate" for strikethrough
export const getMarketRate = (basePrice: number): number => {
    return Math.round(basePrice * 1.4); // 40% higher
};

// Generate WhatsApp URL with pre-filled message
export const generateWhatsAppUrl = (
    propertyId: string,
    propertyName: string,
    price: number,
    checkIn?: string,
    isUrgent?: boolean
): string => {
    const phone = '919027475042';
    const idShort = propertyId.slice(0, 8).toUpperCase();

    let message = isUrgent
        ? `🚨 URGENT: I need a room TODAY. Please check availability immediately.`
        : `Hi, I am interested in Property #${idShort} (${propertyName})${checkIn ? ` for ${checkIn}` : ''}. Is it available for ${formatPrice(price)}?`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// Get amenity icon and label
export const getAmenityDetails = (key: string, value: string | boolean) => {
    const amenityMap: Record<string, { icon: string; label: string; isPositive: boolean }> = {
        'geyser:gas': { icon: '✅', label: 'Gas Geyser (24/7 Hot Water)', isPositive: true },
        'geyser:solar': { icon: '⚠️', label: 'Solar Geyser (Cold when cloudy)', isPositive: false },
        'geyser:electric': { icon: '✅', label: 'Electric Geyser', isPositive: true },
        'toilet:western': { icon: '✅', label: 'Western Toilet', isPositive: true },
        'toilet:indian': { icon: '⚠️', label: 'Indian Toilet Only', isPositive: false },
        'parking:true': { icon: '✅', label: 'Parking Available', isPositive: true },
        'parking:false': { icon: '⚠️', label: 'No Parking', isPositive: false },
        'wifi:true': { icon: '✅', label: 'WiFi Available', isPositive: true },
        'restaurant:true': { icon: '✅', label: 'In-house Restaurant', isPositive: true },
    };

    return amenityMap[`${key}:${value}`] || null;
};

// Check if date is within 48 hours (urgent)
export const isUrgentBooking = (date: Date): boolean => {
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours < 48 && diffHours >= 0;
};

// Check if date is more than 2 months away (early bird)
export const isEarlyBird = (date: Date): boolean => {
    const now = new Date();
    const twoMonthsLater = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());
    return date > twoMonthsLater;
};

// Fake names for social proof toaster
export const FAKE_BOOKING_NAMES = [
    'Amit from Delhi',
    'Priya from Mumbai',
    'Rahul from Bangalore',
    'Sunita from Kolkata',
    'Vikram from Pune',
    'Anita from Chennai',
    'Rajesh from Hyderabad',
    'Meera from Jaipur'
];

export const FAKE_LOCATIONS = ['Sonprayag', 'Guptkashi', 'Phata', 'Gaurikund'];

export const getRandomBookingMessage = (): string => {
    const name = FAKE_BOOKING_NAMES[Math.floor(Math.random() * FAKE_BOOKING_NAMES.length)];
    const location = FAKE_LOCATIONS[Math.floor(Math.random() * FAKE_LOCATIONS.length)];
    return `${name} just requested a room in ${location}`;
};
