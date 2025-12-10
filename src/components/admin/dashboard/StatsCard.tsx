
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon: LucideIcon;
    colorClass: string; // e.g. "text-emerald-500" logic will be derived or passed
    sparkData?: number[];
    variant?: 'default' | 'glowing';
}

export const StatsCard = ({
    title,
    value,
    subValue,
    trend,
    trendValue,
    icon: Icon,
    colorClass,
    sparkData,
    variant = 'default'
}: StatsCardProps) => {

    // Helper to extract base color for backgrounds
    const getColorBase = (cls: string) => {
        if (cls.includes('emerald') || cls.includes('green')) return 'emerald';
        if (cls.includes('amber') || cls.includes('orange')) return 'amber';
        if (cls.includes('rose') || cls.includes('red')) return 'rose';
        if (cls.includes('blue') || cls.includes('indigo')) return 'blue';
        if (cls.includes('purple')) return 'purple';
        return 'slate';
    };

    const baseColor = getColorBase(colorClass);

    const getBadgeStyles = () => {
        switch (baseColor) {
            case 'emerald': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'amber': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case 'rose': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            case 'blue': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case 'purple': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const getIconBgStyles = () => {
        switch (baseColor) {
            case 'emerald': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'amber': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case 'rose': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            case 'blue': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case 'purple': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const badgeStyle = getBadgeStyles();
    const iconBgStyle = getIconBgStyles();
    const sparkColor = baseColor === 'emerald' ? '#10B981' : baseColor === 'amber' ? '#F59E0B' : baseColor === 'rose' ? '#F43F5E' : baseColor === 'purple' ? '#8B5CF6' : '#3B82F6';

    return (
        <GlassCard className="relative group hover:border-white/20 transition-colors duration-300">
            {/* Background Glow */}
            <div className={cn(
                "absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none",
                `text-${baseColor}-500`
            )}>
                <Icon className="w-24 h-24" />
            </div>

            <div className="p-6 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{title}</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                    </div>
                    <div className={cn("p-2.5 rounded-xl border", iconBgStyle)}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    {subValue && (
                        <p className="text-xs text-slate-500 font-medium">{subValue}</p>
                    )}

                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            {trend !== 'neutral' ? (
                                <Badge className={cn("px-2 py-0.5 text-[10px] font-medium transition-colors border", badgeStyle)}>
                                    {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {trendValue}
                                </Badge>
                            ) : (
                                <span className="text-slate-500 text-xs">{trendValue}</span>
                            )}
                        </div>

                        {/* Sparkline */}
                        <div className="w-24 h-10 -mb-2">
                            {sparkData && sparkData.length > 0 && (
                                <Sparkline
                                    data={sparkData}
                                    color={sparkColor}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
