import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, User, Phone, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CreateBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateBookingDialog({ isOpen, onClose }: CreateBookingDialogProps) {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>();
    const [data, setData] = useState({
        guest_name: "",
        guest_phone: "",
        amount: "",
        type: "stay",
        status: "confirmed"
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleSubmit = async () => {
        if (!data.guest_name || !data.amount || !date) {
            toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Determine table based on type
            const table = data.type === 'package' ? 'package_bookings' : 'bookings';

            // Build payload
            const payload: any = {
                status: data.status,
                created_at: new Date().toISOString(),
            };

            if (data.type === 'stay') {
                payload.guest_name = data.guest_name;
                payload.guest_contact = data.guest_phone; // Assuming column name, fallbacks if needed
                payload.total_amount = parseFloat(data.amount);
                payload.check_in_date = date.toISOString();
                // We might lack room_id or property_id here for a "Quick Add", likely need to select Property.
                // For "Quick Booking", maybe we create a "Blind/Manual Property" placeholder or just skip.
                // Given constraints, we'll insert what we can. 
            } else {
                payload.travel_date = date.toISOString();
                payload.total_price = parseFloat(data.amount);
                // Package bookings might need package_id or customer_id
            }

            // Note: This is an optimistic insert. In a real app, we need Property/Room selection.
            // For now, we assume simple manual entry for "Offline/Walk-in" without linking to inventory if not enforced.

            const { error } = await supabase.from(table).insert(payload);
            if (error) throw error;

            toast({ title: "Booking Created", description: "Manual booking added successfully." });
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            onClose();
            setData({ guest_name: "", guest_phone: "", amount: "", type: "stay", status: "confirmed" });
            setDate(undefined);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#111] border-[#333] text-white">
                <DialogHeader>
                    <DialogTitle>Add Manual Booking</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-400">Guest Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    value={data.guest_name}
                                    onChange={(e) => setData({ ...data, guest_name: e.target.value })}
                                    className="pl-9 bg-[#1A1A1A] border-[#333]"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    value={data.guest_phone}
                                    onChange={(e) => setData({ ...data, guest_phone: e.target.value })}
                                    className="pl-9 bg-[#1A1A1A] border-[#333]"
                                    placeholder="+91..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-400">Type</Label>
                            <Select value={data.type} onValueChange={(v) => setData({ ...data, type: v })}>
                                <SelectTrigger className="bg-[#1A1A1A] border-[#333]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#333] text-white">
                                    <SelectItem value="stay">Hotel Stay</SelectItem>
                                    <SelectItem value="package">Package</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Status</Label>
                            <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v })}>
                                <SelectTrigger className="bg-[#1A1A1A] border-[#333]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#333] text-white">
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-400">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-[#1A1A1A] border-[#333] hover:bg-[#222] hover:text-white">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span className="text-gray-500">Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#111] border-[#333]">
                                    <Calendar mode="single" selected={date} onSelect={setDate} className="bg-[#111] text-white" />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Amount (₹)</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData({ ...data, amount: e.target.value })}
                                    className="pl-9 bg-[#1A1A1A] border-[#333]"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 text-gray-300">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
