import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Lead } from "@/components/admin/crm/LeadCard";
import { format } from "date-fns";

interface PaymentRecoveryProps {
    leads?: Lead[];
}

export function PaymentRecovery({ leads = [] }: PaymentRecoveryProps) {
    // Filter leads that have unpaid dues
    const pendingLeads = leads
        .filter(lead => {
            const total = lead.total_amount || 0;
            const paid = lead.amount_paid || 0;
            return total > 0 && paid < total && lead.status !== 'cancelled' && lead.status !== 'archived';
        })
        .map(lead => ({
            ...lead,
            due: (lead.total_amount || 0) - (lead.amount_paid || 0),
            percentPaid: Math.round(((lead.amount_paid || 0) / (lead.total_amount || 1)) * 100)
        }))
        .sort((a, b) => b.due - a.due) // Sort by highest due amount
        .slice(0, 5); // Show top 5

    return (
        <GlassCard className="p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-white">Pending Payments</h3>
                <Badge variant="outline" className="ml-auto border-emerald-500/20 text-emerald-400 bg-emerald-500/10">
                    {pendingLeads.length} Pending
                </Badge>
            </div>

            <div className="space-y-4">
                {pendingLeads.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No pending payments found.
                    </div>
                ) : (
                    pendingLeads.map((lead) => {
                        const isCritical = lead.due > 10000;

                        return (
                            <div key={lead.id} className="space-y-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white font-medium truncate max-w-[120px]" title={lead.customer_name || ''}>
                                        {lead.customer_name || 'Guest'}
                                    </span>
                                    <span className={isCritical ? "text-red-400 font-bold" : "text-amber-400"}>
                                        Due: ₹{lead.due.toLocaleString()}
                                    </span>
                                </div>
                                <Progress
                                    value={lead.percentPaid}
                                    className="h-1.5 bg-slate-800"
                                    indicatorClassName={isCritical ? "bg-red-500" : "bg-emerald-500"}
                                />
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>Paid: ₹{(lead.amount_paid || 0).toLocaleString()}</span>
                                    {lead.follow_up_date && (
                                        <span className="flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                                            Target: {format(new Date(lead.follow_up_date), 'MMM d')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </GlassCard>
    );
}
