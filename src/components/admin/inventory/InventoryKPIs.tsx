
import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import { Building2, Home, AlertCircle, IndianRupee, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface StatProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string; // e.g., "text-blue-400"
    bgClass: string; // e.g., "bg-blue-500/10"
}

const StatCard = ({ title, value, subtitle, icon, colorClass, bgClass }: StatProps) => (
    <GlassCard className="p-4 flex items-start justify-between relative overflow-hidden group">
        <div className="z-10">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{title}</p>
            <h3 className={`text-2xl font-bold ${colorClass} mb-1 drop-shadow-sm`}>{value}</h3>
            <p className="text-slate-500 text-[10px] font-medium">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>

        {/* Neon Glow Effect */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 ${bgClass} rounded-full blur-3xl opacity-20`}></div>
    </GlassCard>
);

export function InventoryKPIs() {
    // Fetch aggregated stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['blind_properties_stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blind_properties')
                .select('*');
            if (error) throw error;

            const typedData = data as any[]; // Cast as needed or use DB Types if strict
            const active = typedData.filter(p => p.is_active).length;
            const liveInventory = active * 10; // Assumption: avg 10 rooms per active hotel
            const avgMargin = typedData.reduce((acc, curr) => acc + ((curr.surge_price || 0) - (curr.base_price || 0)), 0) / (typedData.length || 1);

            const occupancy = data && data.length > 0 ? (active / data.length) * 100 : 0;

            return {
                active,
                liveInventory,
                avgMargin: Math.round(avgMargin),
                total: typedData.length,
                occupancy: Math.round(occupancy)
            };
        }
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard
                title="Active Partners"
                value={isLoading ? "..." : stats?.active || 0}
                subtitle="Verified hotels online"
                icon={<Building2 className="w-6 h-6" />}
                colorClass="text-cyan-400"
                bgClass="bg-cyan-500/10"
            />
            <StatCard
                title="Live Inventory"
                value={isLoading ? "..." : `~${stats?.liveInventory || 0} Rooms`}
                subtitle="Estimated capacity"
                icon={<Home className="w-6 h-6" />}
                colorClass="text-emerald-400"
                bgClass="bg-emerald-500/10"
            />
            <StatCard
                title="Total Database"
                value={isLoading ? "..." : stats?.total || 0}
                subtitle="All listed properties"
                icon={<AlertCircle className="w-6 h-6" />}
                colorClass="text-rose-500"
                bgClass="bg-rose-500/10"
            />
            <StatCard
                title="Avg Net Margin"
                value={isLoading ? "..." : `₹${stats?.avgMargin || 0}`}
                subtitle="Avg profit per room night"
                icon={<IndianRupee className="w-6 h-6" />}
                colorClass="text-amber-400"
                bgClass="bg-amber-500/10"
            />
            <StatCard
                title="Occupancy"
                value={isLoading ? "..." : `${stats?.occupancy || 0}%`}
                subtitle="Overall Utilization"
                icon={<PieChart className="w-6 h-6" />}
                colorClass="text-violet-400"
                bgClass="bg-violet-500/10"
            />
        </div>
    );
}
