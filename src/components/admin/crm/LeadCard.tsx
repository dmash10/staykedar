
import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, MessageCircle, MoreHorizontal, Clock, AlertCircle, Trash2, Globe, User, Megaphone, Calculator } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";

export interface Lead {
    id: string;
    customer_name: string;
    created_at: string;
    guests: number;
    budget_category: string;
    status: string;
    is_urgent: boolean | null;
    notes: string | null;
    customer_phone: string;
    source: string;
    customer_email?: string;
    follow_up_date?: string;
    total_amount?: number;
    amount_paid?: number;
}

interface LeadCardProps {
    lead: Lead;
    index: number;
    onClick: () => void;
    onArchive: (id: string) => void;
}

export function LeadCard({ lead, index, onClick, onArchive }: LeadCardProps) {
    // Urgency Logic
    const isUrgent = lead.is_urgent;
    const urgencyColor = isUrgent ? "text-red-500 animate-pulse" : "text-slate-500";
    const dateColor = isUrgent ? "text-red-400 font-bold" : "text-slate-400";

    return (
        <Draggable draggableId={lead.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className="mb-3"
                    onClick={onClick}
                >
                    <GlassCard
                        className={`p-3 relative group transition-all duration-200 border-l-4 ${snapshot.isDragging ? "shadow-2xl scale-105 border-l-blue-500 rotate-2 z-50" :
                            "hover:border-l-blue-500 hover:bg-white/5 border-l-transparent"
                            }`}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8 border border-white/10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.customer_name}`} />
                                    <AvatarFallback>{lead.customer_name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-sm font-bold text-white leading-tight">{lead.customer_name || 'Anonymous'}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <span className={dateColor}>{format(new Date(lead.created_at), 'MMM d')}</span>
                                        <span>•</span>
                                        <span>{lead.guests} Pax</span>
                                        {lead.follow_up_date && (
                                            <>
                                                <span>•</span>
                                                <span className="text-amber-400 flex items-center gap-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(lead.follow_up_date), 'MMM d, h:mm a')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-2 top-2 flex items-center gap-2">
                                {/* Source Icon */}
                                {lead.source === 'website' && <Globe className="w-3 h-3 text-blue-400" />}
                                {lead.source === 'walk_in' && <User className="w-3 h-3 text-orange-400" />}
                                {(lead.source === 'referral' || lead.source === 'ota') && <Megaphone className="w-3 h-3 text-purple-400" />}

                                {isUrgent && (
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* AI Summary / Notes */}
                        <div className="bg-slate-900/60 rounded-lg p-2 mb-3 border border-white/5 hover:bg-slate-900/80 transition-colors">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[10px] uppercase font-bold text-purple-400">Note</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                                {lead.notes || 'No notes available.'}
                            </p>
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px] bg-slate-800/50 border-white/10 text-slate-400 font-normal capitalize">
                                {lead.budget_category || 'N/A'}
                            </Badge>

                            {/* Hover Actions - High Contrast Buttons */}
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    className="h-7 w-7 bg-green-500/10 hover:bg-green-600 text-green-500 hover:text-white border border-green-500/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://wa.me/${lead.customer_phone?.replace(/\D/g, '')}?text=Hi ${lead.customer_name}, regarding your stay inquiry...`, '_blank');
                                    }}
                                    title="Open WhatsApp"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    className="h-7 w-7 bg-blue-500/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `tel:${lead.customer_phone}`;
                                    }}
                                    title="Call Customer"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    className="h-7 w-7 bg-purple-500/10 hover:bg-purple-600 text-purple-500 hover:text-white border border-purple-500/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClick(); // Opens the drawer (which now defaults to details/calculator)
                                    }}
                                    title="Open Calculator/Details"
                                >
                                    <Calculator className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onArchive(lead.id);
                                    }}
                                    title="Archive Lead"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </Draggable>
    );
}
