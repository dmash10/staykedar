
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Lead } from "./LeadMasterTable"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MapPin, Calendar, CreditCard, User, History, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LeadDetailsSheetProps {
    lead: Lead | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LeadDetailsSheet({ lead, open, onOpenChange }: LeadDetailsSheetProps) {
    if (!lead) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-slate-950 border-l border-white/10 text-white sm:max-w-[540px] px-0">
                <ScrollArea className="h-full px-6">
                    <SheetHeader className="pb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                    {lead.customerName}
                                    <Badge variant="outline" className="text-xs font-normal border-white/20 text-slate-400">{lead.source}</Badge>
                                </SheetTitle>
                                <SheetDescription className="text-slate-400 mt-1">
                                    Lead ID: {lead.id}
                                </SheetDescription>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${lead.status === 'New' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    lead.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        'bg-slate-800 text-slate-300 border-slate-700'
                                }`}>
                                {lead.status}
                            </div>
                        </div>
                    </SheetHeader>

                    <Separator className="bg-white/10 mb-6" />

                    <div className="space-y-6">
                        {/* Contact Info */}
                        <section>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Contact Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Phone</p>
                                        <p className="text-sm font-medium">{lead.contact}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Email</p>
                                        <p className="text-sm font-medium truncate max-w-[150px]" title={lead.email}>{lead.email}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Trip Details */}
                        <section>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Trip Details</h4>
                            <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm">Travel Date</span>
                                    </div>
                                    <span className="font-medium">{lead.travelDate.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm">Pax</span>
                                    </div>
                                    <span className="font-medium">{lead.pax} People</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <CreditCard className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm">Budget</span>
                                    </div>
                                    <span className="font-bold text-emerald-400">₹{lead.budget.toLocaleString()}</span>
                                </div>
                            </div>
                        </section>

                        {/* Activity Feed (Mock) */}
                        <section>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Activity Log</h4>
                            <div className="space-y-4 relative pl-4 border-l border-white/10">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-950"></div>
                                    <p className="text-sm text-slate-300">{lead.lastAction}</p>
                                    <p className="text-xs text-slate-500">Today, 2:30 PM</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-700 ring-4 ring-slate-950"></div>
                                    <p className="text-sm text-slate-300">Lead Created</p>
                                    <p className="text-xs text-slate-500">Yesterday, 10:00 AM</p>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <div className="pt-4">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Send className="w-4 h-4 mr-2" /> Send WhatsApp Proposal
                            </Button>
                        </div>
                    </div>

                    <div className="h-10" />
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
