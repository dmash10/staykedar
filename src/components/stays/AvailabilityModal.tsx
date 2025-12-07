import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { BlindProperty } from '@/types/stays';
import { formatPrice, generateWhatsAppUrl } from '@/utils/stayUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilityModalProps {
    property: BlindProperty;
    checkIn?: string;
    isOpen: boolean;
    onClose: () => void;
}

const LOADING_STAGES = [
    { text: 'Connecting to Partner Network...', duration: 1200 },
    { text: 'Verifying Room Status...', duration: 1000 },
    { text: 'Negotiating Rate...', duration: 1300 },
];

const AvailabilityModal = ({ property, checkIn, isOpen, onClose }: AvailabilityModalProps) => {
    const [phone, setPhone] = useState('');
    const [stage, setStage] = useState<'input' | 'loading' | 'success'>('input');
    const [loadingStage, setLoadingStage] = useState(0);
    const [progress, setProgress] = useState(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStage('input');
            setLoadingStage(0);
            setProgress(0);
        }
    }, [isOpen]);

    // Loading animation
    useEffect(() => {
        if (stage !== 'loading') return;

        const totalDuration = LOADING_STAGES.reduce((sum, s) => sum + s.duration, 0);
        let elapsed = 0;

        // Progress animation
        const progressInterval = setInterval(() => {
            elapsed += 50;
            setProgress((elapsed / totalDuration) * 100);
        }, 50);

        // Stage progression
        let currentTime = 0;
        LOADING_STAGES.forEach((s, idx) => {
            setTimeout(() => {
                setLoadingStage(idx);
            }, currentTime);
            currentTime += s.duration;
        });

        // Complete after all stages
        setTimeout(() => {
            setStage('success');
            clearInterval(progressInterval);
            setProgress(100);
        }, totalDuration);

        return () => clearInterval(progressInterval);
    }, [stage]);

    // Auto-redirect to WhatsApp after success
    useEffect(() => {
        if (stage === 'success') {
            const timer = setTimeout(() => {
                handleWhatsAppRedirect();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    const handleSubmit = async () => {
        if (!phone || phone.length < 10) return;

        // Save lead to database
        try {
            await supabase.from('stay_leads').insert({
                customer_phone: phone,
                property_id: property.id,
                check_in: checkIn || null,
                status: 'new',
            });
        } catch (error) {
            console.error('Error saving lead:', error);
        }

        setStage('loading');
    };

    const handleWhatsAppRedirect = () => {
        const url = generateWhatsAppUrl(property.id, property.display_name, property.base_price, checkIn);
        window.open(url, '_blank');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold">
                            {stage === 'input' && 'Check Live Availability'}
                            {stage === 'loading' && 'We are checking live inventory...'}
                            {stage === 'success' && '✅ Property Available!'}
                        </h3>
                        <p className="text-white/80 text-sm mt-1">
                            {property.display_name} • {formatPrice(property.base_price)}/night
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {/* Input Stage */}
                        {stage === 'input' && (
                            <div className="space-y-4">
                                <p className="text-gray-600 text-sm">
                                    To get you the <span className="font-semibold text-primary">'Travel Agent Rate'</span> and
                                    ensure the room isn't double-booked, we need to verify with the owner.
                                </p>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Your WhatsApp Number
                                    </label>
                                    <Input
                                        type="tel"
                                        placeholder="Enter 10-digit mobile number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="text-lg"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={phone.length < 10}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                                >
                                    Check Now
                                </Button>

                                <p className="text-xs text-gray-400 text-center">
                                    We'll send availability details to this number via WhatsApp
                                </p>
                            </div>
                        )}

                        {/* Loading Stage */}
                        {stage === 'loading' && (
                            <div className="py-8">
                                {/* Progress bar */}
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary to-green-500"
                                        style={{ width: `${progress}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                </div>

                                {/* Loading stages */}
                                <div className="space-y-3">
                                    {LOADING_STAGES.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-3 transition-opacity duration-300 ${idx > loadingStage ? 'opacity-30' : 'opacity-100'
                                                }`}
                                        >
                                            {idx < loadingStage ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : idx === loadingStage ? (
                                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                            )}
                                            <span className={`text-sm ${idx <= loadingStage ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {s.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Success Stage */}
                        {stage === 'success' && (
                            <div className="py-6 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </motion.div>
                                <p className="text-gray-900 font-semibold mb-2">
                                    Our agent has locked this rate for 15 minutes.
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Opening WhatsApp to connect you...
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AvailabilityModal;
