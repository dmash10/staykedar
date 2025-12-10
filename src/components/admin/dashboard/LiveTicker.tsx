import { Link } from "react-router-dom";
import { GlassCard } from "./GlassCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle2, AlertCircle, Banknote, User, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Type definitions for feed items
export type FeedItemType = 'booking' | 'payment' | 'alert' | 'lead';
export interface FeedItem {
    id: string;
    type: FeedItemType;
    title: string;
    description: string;
    timestamp: Date;
    actionUrl?: string; // Optional path to navigate to
}

interface LiveTickerProps {
    items: FeedItem[];
}

export const LiveTicker = ({ items }: LiveTickerProps) => {
    const getIcon = (type: FeedItemType) => {
        switch (type) {
            case 'booking': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'payment': return <Banknote className="w-4 h-4 text-amber-400" />;
            case 'alert': return <AlertCircle className="w-4 h-4 text-rose-400" />;
            case 'lead': return <User className="w-4 h-4 text-blue-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    const getBgStyle = (type: FeedItemType) => {
        switch (type) {
            case 'booking': return "bg-emerald-500/10 border-emerald-500/20";
            case 'payment': return "bg-amber-500/10 border-amber-500/20";
            case 'alert': return "bg-rose-500/10 border-rose-500/20";
            case 'lead': return "bg-blue-500/10 border-blue-500/20";
            default: return "bg-slate-500/10 border-slate-500/20";
        }
    };

    return (
        <GlassCard className="h-full flex flex-col border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]">
            <div className="p-4 border-b border-emerald-500/10 bg-emerald-950/10 flex justify-between items-center">
                <h3 className="text-emerald-100 font-bold tracking-wide flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Pulse
                </h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono tracking-wider">REAL-TIME</span>
                </div>
            </div>
            <ScrollArea className="flex-1 p-0">
                <div className="p-4 space-y-5">
                    {items.map((item, idx) => (
                        <Link
                            to={item.actionUrl || '#'}
                            key={item.id}
                            className={cn(
                                "flex gap-4 relative group cursor-pointer",
                                !item.actionUrl && "pointer-events-none"
                            )}
                        >
                            {/* Animated Timeline Line */}
                            {idx !== items.length - 1 && (
                                <div className="absolute left-[15px] top-8 bottom-[-20px] w-px bg-gradient-to-b from-emerald-500/30 to-transparent group-hover:from-emerald-400/50 transition-colors" />
                            )}

                            <div className="flex flex-col items-center relative z-10">
                                <div
                                    className={`p-1.5 rounded-full border bg-[#020617] transition-all duration-300 group-hover:scale-110 ${getBgStyle(item.type)}`}
                                    style={{
                                        boxShadow: `0 0 10px ${item.type === 'booking' ? 'rgba(52,211,153,0.2)' :
                                            item.type === 'payment' ? 'rgba(251,191,36,0.2)' :
                                                item.type === 'alert' ? 'rgba(244,63,94,0.2)' :
                                                    'rgba(96,165,250,0.2)'
                                            }`
                                    }}
                                >
                                    {getIcon(item.type)}
                                </div>
                            </div>

                            <div className="flex-1 pb-1 pr-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                                        {item.title}
                                        {item.actionUrl && <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />}
                                    </p>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2 font-mono">
                                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 group-hover:text-slate-300 transition-colors">{item.description}</p>
                            </div>
                        </Link>
                    ))}
                    {items.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>}
                </div>
            </ScrollArea>
        </GlassCard>
    );
};
