import { GlassCard } from "./GlassCard";
import { AlertTriangle, Clock, AlertOctagon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, isBefore, isAfter, parseISO } from "date-fns";

interface AlertItem {
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
    timestamp?: string;
    link?: string;
}

export const UrgentAlertsWidget = () => {
    const { data: alerts = [], isLoading } = useQuery({
        queryKey: ['urgent-alerts'],
        queryFn: async () => {
            const now = new Date();
            const tomorrow = addDays(now, 1);

            // 1. Fetch Urgent Check-ins (< 24h)
            const { data: checkins } = await supabase
                .from('bookings')
                .select('id, guest_name, check_in_date, status')
                .eq('status', 'confirmed')
                .gte('check_in_date', now.toISOString())
                .lte('check_in_date', tomorrow.toISOString())
                .limit(5);

            // 2. Fetch Pending Payments / Failed
            const { data: pending } = await supabase
                .from('bookings')
                .select('id, customer_name, total_amount, status')
                .in('status', ['pending', 'failed'])
                .limit(5);

            // 3. Fetch Urgent Leads
            const { data: leads } = await supabase
                .from('stay_leads')
                .select('id, customer_name, budget_category, is_urgent')
                .eq('is_urgent', true)
                .limit(5);

            const newAlerts: AlertItem[] = [];

            (checkins || []).forEach(b => {
                newAlerts.push({
                    id: `b-${b.id}`,
                    text: `Arrival: ${b.guest_name?.split(' ')[0]} (Today/Tmrw)`,
                    priority: 'high',
                    link: '/admin/bookings'
                });
            });

            (pending || []).forEach(b => {
                newAlerts.push({
                    id: `p-${b.id}`,
                    text: `Payment Pending: ${b.customer_name?.split(' ')[0]} (#${b.id.slice(0, 4)})`,
                    priority: 'high', // Pending payment is high priority
                    link: '/admin/bookings'
                });
            });

            (leads || []).forEach(l => {
                newAlerts.push({
                    id: `l-${l.id}`,
                    text: `Urgent Lead: ${l.customer_name?.split(' ')[0]} (${l.budget_category})`,
                    priority: 'medium',
                    link: '/admin/leads'
                });
            });

            // Mock Inventory Alert if empty (placeholder for complex logic)
            if (newAlerts.length === 0) {
                newAlerts.push({ id: 'mock-1', text: "System Normal - No Urgent Actions", priority: 'low' });
            }

            return newAlerts.slice(0, 10); // Max 10
        },
        refetchInterval: 30000 // Refresh every 30s
    });

    return (
        <GlassCard className="p-0 overflow-hidden border-rose-500/30 shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)] h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-rose-500/20 bg-rose-950/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                    </div>
                    <h3 className="text-rose-100 font-bold tracking-wide">Urgent Alerts</h3>
                </div>
                <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                    {alerts.length} ACT
                </span>
            </div>

            {/* Alerts List */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center text-slate-500 text-sm py-4">Checking...</div>
                ) : (
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={cn(
                                "flex justify-between items-center p-3 rounded-lg border transition-all duration-300 group",
                                alert.priority === 'high'
                                    ? "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                                    : "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                                    alert.priority === 'high' ? "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "bg-orange-400"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium",
                                    alert.priority === 'high' ? "text-rose-100" : "text-slate-300"
                                )}>
                                    {alert.text}
                                </span>
                            </div>

                            <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                    "h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2",
                                    alert.priority === 'high'
                                        ? "text-rose-400 hover:text-rose-200 hover:bg-rose-500/20"
                                        : "text-orange-400 hover:text-orange-200 hover:bg-orange-500/20"
                                )}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t border-white/5 bg-black/20 text-center">
                <button className="text-xs text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-widest font-semibold flex items-center justify-center gap-2 w-full">
                    View All Issues <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </GlassCard>
    );
};
