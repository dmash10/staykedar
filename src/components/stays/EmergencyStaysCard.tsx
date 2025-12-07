import { Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface EmergencyStaysCardProps {
    onCallClick: () => void;
    onWhatsAppClick: () => void;
}

const EmergencyStaysCard = ({ onCallClick, onWhatsAppClick }: EmergencyStaysCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-9 h-9" />
                </div>
                <h2 className="text-3xl font-bold mb-2">
                    Stuck in Traffic?
                </h2>
                <h3 className="text-2xl font-semibold mb-4">
                    Don't Panic.
                </h3>
                <p className="text-white/90 text-lg max-w-md mx-auto">
                    Online inventory is often wrong during rush hours. Our ground team has access to
                    <span className="font-bold"> 'Offline Rooms'</span> that aren't listed here.
                </p>
            </div>

            {/* Actions */}
            <div className="bg-white p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Call Button */}
                    <Button
                        onClick={onCallClick}
                        className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold flex items-center justify-center gap-3 rounded-xl"
                    >
                        <Phone className="w-6 h-6 animate-pulse" />
                        Call Emergency Hotline
                    </Button>

                    {/* WhatsApp Button */}
                    <Button
                        onClick={onWhatsAppClick}
                        className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold flex items-center justify-center gap-3 rounded-xl"
                    >
                        <MessageCircle className="w-6 h-6" />
                        WhatsApp Urgent Request
                    </Button>
                </div>

                <p className="text-center text-gray-500 text-sm mt-4">
                    Our team responds within 2 minutes for urgent requests
                </p>
            </div>

            {/* Trust indicators */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Team Online Now
                </span>
                <span>•</span>
                <span>50+ Emergency Bookings Today</span>
            </div>
        </motion.div>
    );
};

export default EmergencyStaysCard;
