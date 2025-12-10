
import AdminLayout from '@/components/admin/AdminLayout';
import { QuoteGenerator } from '@/components/admin/sales/QuoteGenerator';
import { FollowUpRadar } from '@/components/admin/sales/FollowUpRadar';
import { PaymentRecovery } from '@/components/admin/sales/PaymentRecovery';
import { GlassCard } from '@/components/admin/dashboard/GlassCard';
import { TrendingUp, CreditCard, DollarSign, CalendarCheck, Filter, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/components/admin/crm/LeadCard';

export function SalesDashboardContent() {
    // Fetch Leads for Analytics
    const { data: leads = [] } = useQuery({
        queryKey: ['stay_leads'],
        queryFn: async () => {
            const { data } = await supabase
                .from('stay_leads')
                .select('*');
            return (data || []) as Lead[];
        }
    });

    // Calculate Stats
    const totalSales = leads.reduce((sum, lead) => sum + (lead.amount_paid || 0), 0);
    const pendingAmount = leads.reduce((sum, lead) => {
        const total = lead.total_amount || 0;
        const paid = lead.amount_paid || 0;
        return total > paid ? sum + (total - paid) : sum;
    }, 0);
    const quotesSent = leads.filter(l => l.status === 'quote_sent' || l.status === 'negotiation').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Total Collections</p>
                        <h3 className="text-xl font-bold text-white">₹{(totalSales / 1000).toFixed(1)}k</h3>
                    </div>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Pending Payment</p>
                        <h3 className="text-xl font-bold text-white">₹{(pendingAmount / 1000).toFixed(1)}k</h3>
                    </div>
                    <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Active Quotes</p>
                        <h3 className="text-xl font-bold text-white">{quotesSent}</h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Avg Margin</p>
                        <h3 className="text-xl font-bold text-amber-400">~15%</h3>
                    </div>
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <CreditCard className="w-5 h-5" />
                    </div>
                </GlassCard>
            </div>

            {/* Pipeline Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-3 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Filter className="w-5 h-5 text-orange-500" />
                            Lead Pipeline Summary
                        </h3>
                        <div className="flex gap-2">
                            {['Leads', 'Quotes', 'Negotiation', 'Won'].map((s, i) => (
                                <div key={s} className="flex items-center gap-1 text-xs text-slate-400">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#ea580c', '#f97316', '#fb923c', '#22c55e'][i] }}></div>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Funnel
                                    data={[
                                        { "value": leads.length || 50, "name": "Total Leads", "fill": "#ea580c" },
                                        { "value": leads.filter(l => l.status !== 'new').length || 30, "name": "Qualified", "fill": "#f97316" },
                                        { "value": quotesSent || 15, "name": "Quotes Sent", "fill": "#fb923c" },
                                        { "value": leads.filter(l => l.status === 'confirmed').length || 5, "name": "Closed Won", "fill": "#22c55e" }
                                    ]}
                                    dataKey="value"
                                >
                                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Monthly Target & Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Target Tracker */}
                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">December Target</h3>
                            <p className="text-sm text-slate-400">Monthly sales goal</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                            On Track
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-white font-bold">₹{(totalSales / 1000).toFixed(0)}k / ₹500k</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((totalSales / 500000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{Math.round((totalSales / 500000) * 100)}%</p>
                                <p className="text-xs text-slate-500">Achieved</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-400">21</p>
                                <p className="text-xs text-slate-500">Days Left</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Conversion Metrics */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Conversion Metrics</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Lead → Quote', from: leads.length || 50, to: quotesSent || 15, color: 'blue' },
                            { label: 'Quote → Negotiation', from: quotesSent || 15, to: leads.filter(l => l.status === 'negotiation').length || 8, color: 'purple' },
                            { label: 'Negotiation → Won', from: leads.filter(l => l.status === 'negotiation').length || 8, to: leads.filter(l => l.status === 'confirmed').length || 5, color: 'emerald' },
                        ].map(({ label, from, to, color }) => {
                            const rate = from > 0 ? Math.round((to / from) * 100) : 0;
                            return (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                                        <span className="text-sm text-slate-300">{label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold text-${color}-400`}>{rate}%</span>
                                        <ArrowRight className="w-3 h-3 text-slate-600" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Overall Conversion</span>
                            <span className="text-lg font-bold text-emerald-400">
                                {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'confirmed').length / leads.length) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* Top Performers */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Rahul K.', deals: 12, revenue: '₹1.8L', rank: 1 },
                            { name: 'Priya S.', deals: 9, revenue: '₹1.4L', rank: 2 },
                            { name: 'Amit R.', deals: 7, revenue: '₹1.1L', rank: 3 },
                        ].map(({ name, deals, revenue, rank }) => (
                            <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                                            rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                                                'bg-orange-600/20 text-orange-400'
                                        }`}>
                                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{name}</p>
                                        <p className="text-xs text-slate-500">{deals} deals closed</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-emerald-400">{revenue}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Left: Quote Generator */}
                <div className="lg:col-span-2 h-full">
                    <QuoteGenerator />
                </div>

                {/* Right: Tactics */}
                <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                    <div className="flex-1">
                        <FollowUpRadar />
                    </div>
                    <div className="flex-1">
                        <PaymentRecovery leads={leads} />
                    </div>
                </div>
            </div>
        </div >
    );
}

function SendIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
    )
}

export default function SalesDashboard() {
    return (
        <>
            <SalesDashboardContent />
        </>
    );
}
