
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, Calendar, Users, Calculator, FileText, Globe, MessageCircle, Clock, Loader2, IndianRupee } from "lucide-react";
import { Lead } from "./LeadCard";
import { useState, useEffect } from "react";
import { QuoteGenerator } from "@/components/admin/sales/QuoteGenerator";
import { VoucherGenerator } from "@/components/admin/sales/VoucherGenerator";
import { ItineraryBuilder } from "@/components/admin/sales/ItineraryBuilder";
import { GuestManifest } from "@/components/admin/operations/GuestManifest";
import { PaymentLinkGenerator } from "@/components/admin/sales/PaymentLinkGenerator";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface LeadDetailsDrawerProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
}

export function LeadDetailsDrawer({ lead, isOpen, onClose }: LeadDetailsDrawerProps) {
    const [activeTab, setActiveTab] = useState("details");
    const [followUpDate, setFollowUpDate] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Initialize date when lead opens
    useEffect(() => {
        if (lead?.follow_up_date) {
            // Format for datetime-local: YYYY-MM-DDThh:mm
            const date = new Date(lead.follow_up_date);
            // Adjust to local ISO string roughly or use a lib. 
            // Simple hack: new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
            // But let's trust standard ISO if stored correctly, or just empty if complex.
            // Let's try to parse safely.
            try {
                const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                setFollowUpDate(localIso);
            } catch (e) {
                setFollowUpDate("");
            }
        } else {
            setFollowUpDate("");
        }
    }, [lead]);

    const handleUpdateReminder = async () => {
        if (!lead) return;
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('stay_leads')
                .update({ follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null } as any)
                .eq('id', lead.id);

            if (error) throw error;

            toast({ title: "Reminder Set", description: followUpDate ? `Follow up on ${format(new Date(followUpDate), 'PP p')}` : "Reminder cleared." });
            queryClient.invalidateQueries({ queryKey: ['stay_leads'] });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    if (!lead) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:w-[700px] sm:max-w-[100vw] p-0 bg-[#0b1015] border-l border-white/10 text-white flex flex-col h-full shadow-2xl shadow-black">
                {/* Header */}
                <div className="p-6 bg-slate-900 border-b border-white/5 flex flex-col gap-4 z-10 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-blue-500/5 opacity-20 pointer-events-none" />

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16 border-2 border-white/10 shadow-xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.customer_name}`} />
                                <AvatarFallback className="text-xl bg-slate-800">{lead.customer_name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-bold text-white leading-tight">
                                    {lead.customer_name || 'Anonymous'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                    <Badge variant="outline" className="bg-slate-800/50 border-white/10 text-slate-400 font-normal capitalize">
                                        {lead.status?.replace('_', ' ')}
                                    </Badge>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {lead.guests} Pax</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
                        <Button
                            className="bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white border border-green-600/30 h-10"
                            onClick={() => window.open(`https://wa.me/${lead.customer_phone?.replace(/\D/g, '')}`, '_blank')}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                        </Button>
                        <Button
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/30 h-10"
                            onClick={() => window.location.href = `tel:${lead.customer_phone}`}
                        >
                            <Phone className="w-4 h-4 mr-2" /> Call
                        </Button>
                        <VoucherGenerator lead={lead} />
                        <ItineraryBuilder lead={lead} />
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="px-6 pt-2 bg-slate-900 border-b border-white/5">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent p-0 h-auto gap-6 justify-start w-full border-b border-transparent">
                            <TabsTrigger
                                value="details"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 px-0 pb-3 transition-all"
                            >
                                <FileText className="w-4 h-4 mr-2" /> Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="quote"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 px-0 pb-3 transition-all"
                            >
                                <Calculator className="w-4 h-4 mr-2" /> Quote Generator
                            </TabsTrigger>
                            <TabsTrigger
                                value="manifest"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 px-0 pb-3 transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Manifest
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="finance"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 px-0 pb-3 transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" /> Payments
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-[#0b1015] relative">
                    {/* DETAILS TAB */}
                    <div className={`absolute inset-0 p-6 overflow-y-auto transition-opacity duration-300 ${activeTab === 'details' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <div className="space-y-6">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Information</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="p-2 bg-blue-500/20 rounded text-blue-400"><Phone className="w-4 h-4" /></div>
                                        <div>
                                            <div className="text-xs text-slate-400">Phone Number</div>
                                            <div className="text-sm font-medium text-white">{lead.customer_phone}</div>
                                        </div>
                                    </div>
                                    {/* Email Field - Placeholder if missing */}
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="p-2 bg-purple-500/20 rounded text-purple-400"><Mail className="w-4 h-4" /></div>
                                        <div>
                                            <div className="text-xs text-slate-400">Email Address</div>
                                            <div className="text-sm font-medium text-white">{(lead as any).customer_email || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trip Requirements</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Users className="w-3 h-3" /> Guests</div>
                                        <div className="font-medium text-white">{lead.guests} People</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Globe className="w-3 h-3" /> Source</div>
                                        <div className="font-medium text-white capitalize">{lead.source?.replace('_', ' ') || 'Manual'}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 col-span-2">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Calendar className="w-3 h-3" /> Created On</div>
                                        <div className="font-medium text-white">{format(new Date(lead.created_at), 'PPP p')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Follow Up Reminder */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Follow Up</h4>
                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-end gap-3">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs text-blue-300">Set Reminder Date & Time</label>
                                        <Input
                                            type="datetime-local"
                                            className="bg-black/40 border-white/10 text-white h-9"
                                            value={followUpDate}
                                            onChange={(e) => setFollowUpDate(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleUpdateReminder}
                                        disabled={isUpdating}
                                        className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                                    >
                                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</h4>
                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-sm text-yellow-200/80 leading-relaxed">
                                    {lead.notes || 'No notes added for this lead.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QUOTE TAB */}
                    <div className={`absolute inset-0 p-4 overflow-y-auto bg-slate-950 transition-opacity duration-300 ${activeTab === 'quote' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <QuoteGenerator />
                    </div>

                    {/* MANIFEST TAB */}
                    <div className={`absolute inset-0 p-0 overflow-y-auto bg-slate-950 transition-opacity duration-300 ${activeTab === 'manifest' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <GuestManifest lead={lead} />
                    </div>

                    {/* FINANCE TAB */}
                    <div className={`absolute inset-0 p-4 overflow-y-auto bg-slate-950 transition-opacity duration-300 ${activeTab === 'finance' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <div className="h-full max-w-sm mx-auto pt-4">
                            <PaymentLinkGenerator lead={lead} />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
