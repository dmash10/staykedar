
import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellRing, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STALLED_LEADS = [
    { id: 1, name: "Rahul S.", amount: 9600, sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3) }, // 3 hours ago
    { id: 2, name: "Priya M.", amount: 4500, sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5) }, // 5 hours ago
    { id: 3, name: "Arjun K.", amount: 12000, sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24) }, // 1 day ago
];

export function FollowUpRadar() {
    return (
        <GlassCard className="p-4 h-full bg-amber-950/10 border-amber-500/10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-white">Follow-Up Radar</h3>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    {STALLED_LEADS.length} Pending
                </Badge>
            </div>

            <div className="space-y-3">
                {STALLED_LEADS.map((lead) => (
                    <div key={lead.id} className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`} />
                                <AvatarFallback>{lead.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold text-white text-sm">₹{lead.amount.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-400">Sent {formatDistanceToNow(lead.sentAt)} ago</div>
                            </div>
                        </div>
                        <Button size="sm" variant="secondary" className="h-7 text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/10">
                            Nudge <Send className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                ))}

                {STALLED_LEADS.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        All quotes are active or closed. Good job!
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
