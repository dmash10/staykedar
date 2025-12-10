import { useMemo } from 'react';
import { Flame, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { differenceInHours, parseISO } from 'date-fns';

interface LastMinuteBadgeProps {
    checkInDate?: string | Date;
    className?: string;
    discountPercent?: number;
}

export default function LastMinuteBadge({
    checkInDate,
    className,
    discountPercent = 15,
}: LastMinuteBadgeProps) {
    const dealType = useMemo(() => {
        if (!checkInDate) return null;

        const checkIn = typeof checkInDate === 'string' ? parseISO(checkInDate) : checkInDate;
        const now = new Date();
        const hoursUntilCheckIn = differenceInHours(checkIn, now);

        if (hoursUntilCheckIn <= 0) return null; // Past date
        if (hoursUntilCheckIn <= 24) return 'same-day';
        if (hoursUntilCheckIn <= 48) return 'last-minute';
        return null;
    }, [checkInDate]);

    if (!dealType) return null;

    if (dealType === 'same-day') {
        return (
            <Badge
                className={cn(
                    'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-semibold animate-pulse',
                    className
                )}
            >
                <Zap className="w-3 h-3 mr-1" />
                Same-Day Deal • 20% OFF
            </Badge>
        );
    }

    return (
        <Badge
            className={cn(
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-semibold',
                className
            )}
        >
            <Flame className="w-3 h-3 mr-1" />
            Last Minute • {discountPercent}% OFF
        </Badge>
    );
}

// Simplified version for static display
export function DealBadge({
    type,
    discount,
    className,
}: {
    type: 'last-minute' | 'early-bird' | 'flash-sale' | 'group';
    discount?: number;
    className?: string;
}) {
    const configs = {
        'last-minute': {
            icon: Flame,
            label: 'Last Minute',
            gradient: 'from-amber-500 to-orange-500',
        },
        'early-bird': {
            icon: Clock,
            label: 'Early Bird',
            gradient: 'from-green-500 to-emerald-500',
        },
        'flash-sale': {
            icon: Zap,
            label: 'Flash Sale',
            gradient: 'from-purple-500 to-pink-500',
        },
        'group': {
            icon: Flame,
            label: 'Group Discount',
            gradient: 'from-blue-500 to-cyan-500',
        },
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <Badge
            className={cn(
                `bg-gradient-to-r ${config.gradient} text-white border-0 font-semibold`,
                className
            )}
        >
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
            {discount && ` • ${discount}% OFF`}
        </Badge>
    );
}
