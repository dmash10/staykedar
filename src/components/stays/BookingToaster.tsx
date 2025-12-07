import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { getRandomBookingMessage } from '@/utils/stayUtils';

interface BookingToasterProps {
    interval?: number; // milliseconds between toasts
}

const BookingToaster = ({ interval = 30000 }: BookingToasterProps) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Show first toast after 10 seconds
        const initialTimer = setTimeout(() => {
            showToast();
        }, 10000);

        // Then show every interval
        const intervalTimer = setInterval(() => {
            showToast();
        }, interval);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(intervalTimer);
        };
    }, [interval]);

    const showToast = () => {
        setMessage(getRandomBookingMessage());
        setVisible(true);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setVisible(false);
        }, 5000);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 left-6 z-50"
                >
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-100 p-4 pr-10 max-w-sm relative overflow-hidden">
                        {/* Accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-green-500" />

                        <button
                            onClick={() => setVisible(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3 pl-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium text-sm">{message}</p>
                                <p className="text-gray-400 text-xs mt-0.5">Just now</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BookingToaster;
