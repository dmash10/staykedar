import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlindProperty } from '@/types/stays';
import { getPropertyImages, getScarcityCount, formatPrice, getMarketRate, getAmenityDetails } from '@/utils/stayUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BlindPropertyCardProps {
    property: BlindProperty;
    onCheckAvailability: (property: BlindProperty) => void;
}

const BlindPropertyCard = ({ property, onCheckAvailability }: BlindPropertyCardProps) => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = getPropertyImages(property);
    const scarcityCount = getScarcityCount(property.id);
    const marketRate = getMarketRate(property.base_price);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Get top 3 amenity tags
    const amenityTags = Object.entries(property.amenities)
        .map(([key, value]) => getAmenityDetails(key, value as string | boolean))
        .filter(Boolean)
        .slice(0, 3);

    return (
        <motion.div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/stays/view/${property.id}`)}
        >
            {/* Image Carousel */}
            <div className="relative h-52 bg-gray-100 overflow-hidden">
                <img
                    src={images[currentImageIndex]}
                    alt={property.display_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Verified Badge */}
                <div className="absolute top-3 left-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                    </div>
                </div>

                {/* Zone Tag */}
                {property.zone_description && (
                    <div className="absolute bottom-3 right-3">
                        <div className="bg-black/70 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.zone_description}
                        </div>
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {property.display_name}
                </h3>

                {/* Audit Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {amenityTags.map((tag, idx) => (
                        <Badge
                            key={idx}
                            variant="outline"
                            className={`text-xs ${tag?.isPositive
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                        >
                            {tag?.icon} {tag?.label}
                        </Badge>
                    ))}
                </div>

                {/* Scarcity */}
                <div className="flex items-center gap-1 text-red-600 text-sm font-medium mb-3">
                    <Flame className="w-4 h-4" />
                    Only {scarcityCount} room{scarcityCount > 1 ? 's' : ''} left at this price
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 line-through">{formatPrice(marketRate)}</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(property.base_price)}</p>
                        <p className="text-xs text-gray-500">Est. Net Rate</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCheckAvailability(property);
                            }}
                            className="bg-primary hover:bg-primary/90"
                        >
                            Check Availability
                        </Button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/stays/view/${property.id}`);
                            }}
                            className="text-xs text-primary hover:underline"
                        >
                            View Audit Report
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BlindPropertyCard;
