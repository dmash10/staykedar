import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, DollarSign, Bell, Info } from 'lucide-react';

interface MarqueeItem {
    id: string;
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time?: string;
}

const MOCK_TICKER_ITEMS: MarqueeItem[] = [
    { id: '1', text: "New booking received from Rajesh Kumar (₹12,500)", type: 'success', time: '2m ago' },
    { id: '2', text: "Server load at 45% - Normal operation", type: 'info', time: 'Live' },
    { id: '3', text: "Urgent: 3 Check-ins pending at Hotel Kedar Heights", type: 'warning', time: '10m ago' },
    { id: '4', text: "Payment gateway discrepancy resolved", type: 'success', time: '1h ago' },
    { id: '5', text: "Weather Alert: Heavy rain predicted in Sonprayag zone tomorrow", type: 'error', time: 'Just now' },
];

export const DashboardMarquee = () => {
    return (
        <div className="w-full h-10 bg-black/40 border-y border-cyan-500/20 backdrop-blur-md flex items-center overflow-hidden relative mb-6">
            {/* Label */}
            <div className="h-full px-4 bg-cyan-950/50 border-r border-cyan-500/20 flex items-center gap-2 z-20 shrink-0">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgb(34,211,238)]" />
                <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">LIVE UPDATES</span>
                {/* Decorative skew */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-black/0 translate-x-full" />
            </div>

            {/* Gradient Masks */}
            <div className="absolute left-[130px] top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

            {/* Scrolling Content */}
            <div className="flex gap-8 animate-marquee whitespace-nowrap items-center hover:pause-animation pl-4">
                {[...MOCK_TICKER_ITEMS, ...MOCK_TICKER_ITEMS].map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-2 group cursor-pointer decoration-slate-400">
                        {item.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {item.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                        {item.type === 'error' && <Bell className="w-3.5 h-3.5 text-rose-400" />}
                        {item.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400" />}

                        <span className={cn(
                            "text-xs font-medium tracking-wide transition-colors duration-300",
                            item.type === 'success' ? "text-emerald-100 group-hover:text-emerald-300" :
                                item.type === 'warning' ? "text-amber-100 group-hover:text-amber-300" :
                                    item.type === 'error' ? "text-rose-100 group-hover:text-rose-300" :
                                        "text-blue-100 group-hover:text-blue-300"
                        )}>
                            {item.text}
                        </span>

                        {item.time && (
                            <span className="text-[10px] text-slate-500 font-mono border border-slate-700 px-1 rounded bg-black/20">
                                {item.time}
                            </span>
                        )}

                        {/* Separator */}
                        <div className="w-1 h-1 rounded-full bg-slate-700 mx-2" />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .hover\\:pause-animation:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};
