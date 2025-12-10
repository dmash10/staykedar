import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { User, Mail, Phone, Calendar, CreditCard, Building2, MapPin, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookingDetailSheetProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function BookingDetailSheet({ booking, isOpen, onClose, onUpdate }: BookingDetailSheetProps) {
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (booking) {
            setNotes(booking.notes || "");
        }
    }, [booking]);

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            const table = booking.type === 'package' ? 'package_bookings' : 'bookings';
            const { error } = await supabase
                .from(table)
                .update({ notes })
                .eq('id', booking.id);

            if (error) throw error;

            toast({ title: "Success", description: "Notes updated successfully." });
            onUpdate();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleWhatsApp = () => {
        if (booking?.customer_phone) {
            window.open(`https://wa.me/${booking.customer_phone.replace(/\D/g, '')}`, '_blank');
        } else {
            toast({ title: "Error", description: "No phone number available.", variant: "destructive" });
        }
    };

    if (!booking) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] bg-[#111] border-l border-[#333] text-white overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900/50 uppercase tracking-widest text-[10px]">
                            {booking.type}
                        </Badge>
                        <span className="text-xs font-mono text-gray-500">ID: {booking.id.slice(0, 8)}</span>
                    </div>
                    <SheetTitle className="text-xl text-white mt-2">{booking.display_title}</SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Created on {format(new Date(booking.date), 'PPP p')}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* CUSTOMER INFO */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" /> Customer
                        </h4>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333] space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-lg font-bold">
                                    {booking.customer_name?.charAt(0) || 'G'}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{booking.customer_name}</p>
                                    <p className="text-sm text-gray-500">Customer</p>
                                </div>
                            </div>
                            <Separator className="bg-[#333]" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</p>
                                    <p className="text-gray-300">{booking.customer_email || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1 flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</p>
                                    <p className="text-gray-300">{booking.customer_phone || '—'}</p>
                                </div>
                            </div>
                            {booking.customer_phone && (
                                <Button size="sm" variant="outline" className="w-full border-[#333] bg-[#222] hover:bg-[#333] mt-2 text-green-400" onClick={handleWhatsApp}>
                                    Chat on WhatsApp
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* BOOKING DETAILS */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" /> Stay Details
                        </h4>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333] space-y-4">
                            <div className="flex justify-between items-center bg-[#111] p-3 rounded border border-[#333]">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Check In</p>
                                    <p className="text-white font-medium">
                                        {booking.check_in_date ? format(new Date(booking.check_in_date), 'PPP') : 'TBD'}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-[#333]"></div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Amount</p>
                                    <p className="text-emerald-400 font-bold text-lg">₹{booking.amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Guests</p>
                                    <p className="text-white">{booking.guests_count || booking.adults || 2} Adults</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Room/Plan</p>
                                    <p className="text-white">{booking.room_name || 'Standard'}</p>
                                </div>
                                {booking.location && (
                                    <div className="col-span-2">
                                        <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</p>
                                        <p className="text-white">{booking.location}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ADMIN NOTES */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-500" /> Admin Notes
                        </h4>
                        <div className="space-y-2">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add private notes ensuring follow-up..."
                                className="bg-[#1A1A1A] border-[#333] focus:border-purple-500 min-h-[100px]"
                            />
                            <Button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="w-full bg-purple-900/50 hover:bg-purple-900 text-purple-200"
                            >
                                {saving ? "Saving..." : "Save Internal Note"}
                            </Button>
                        </div>
                    </div>
                </div>

                <SheetFooter className="mt-8">
                    {/* Add specific actions like Cancel/Refund here later */}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
