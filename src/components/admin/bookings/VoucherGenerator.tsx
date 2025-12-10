import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Printer, User, Building2, Eye, MapPin, FileCheck, Banknote } from "lucide-react";
import { VoucherData } from "./VoucherTemplate";

interface VoucherGeneratorProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
}

export function VoucherGenerator({ booking, isOpen, onClose }: VoucherGeneratorProps) {
    const navigate = useNavigate();

    // Core State
    const [mode, setMode] = useState<"customer" | "hotel">("customer");
    const [guestName, setGuestName] = useState("");
    const [hotelName, setHotelName] = useState("");
    const [location, setLocation] = useState("Guptkashi, Uttarakhand");

    // Advanced State
    const [customNote, setCustomNote] = useState("");
    const [showPrice, setShowPrice] = useState(false);
    const [inclusions, setInclusions] = useState<string>("Breakfast, Dinner, Parking");

    // Initialize
    useEffect(() => {
        if (booking) {
            setGuestName(booking.customer_name || "Guest");
            setHotelName(booking.property_name || "Premium Property");
            // Determine if we should default to 'blind' name if mapping exists? 
            // For now, user manually edits.
        }
    }, [booking]);

    const handlePrint = () => {
        if (!booking) return;

        const voucherData: VoucherData = {
            bookingId: booking.id.slice(0, 8).toUpperCase(),
            guestName,
            hotelName,
            hotelLocation: location,
            checkIn: new Date(booking.check_in_date || booking.travel_date || new Date()),
            checkOut: new Date(booking.check_out_date || booking.travel_date || new Date()),
            adults: booking.guests_count || 2,
            children: 0,
            roomType: booking.room_name || "Standard Room",
            plan: "MAP (Breakfast + Dinner)", // Can be made dynamic later
            amountPaid: booking.amount,
            balanceDue: mode === 'hotel' ? booking.amount : 0, // Mock logic: assume full amount is due for hotel collection if hotel copy
            isHotelCopy: mode === 'hotel',
            showPrice,
            customNote,
            inclusions: inclusions.split(',').map(s => s.trim()).filter(Boolean)
        };

        navigate('/admin/print/voucher', { state: { data: voucherData } });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Printer className="w-5 h-5 text-blue-500" />
                        Generate Booking Voucher
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* MODE SELECTOR */}
                    <div className="space-y-3">
                        <Label className="text-gray-400 text-xs uppercase tracking-wider font-bold">Voucher Type</Label>
                        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-[#1A1A1A]">
                                <TabsTrigger value="customer" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Customer Copy</TabsTrigger>
                                <TabsTrigger value="hotel" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Hotel Copy</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <p className="text-xs text-gray-500">
                            {mode === 'customer'
                                ? "Hides net rates. Uses 'Display Name' for property to protect vendor identity."
                                : "Shows 'Internal Name' and 'Net Rates' for hotel owner settlement."}
                        </p>
                    </div>

                    {/* HOTEL DETAILS */}
                    <div className="space-y-4 border-t border-[#222] pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">Voucher Hotel Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        value={hotelName}
                                        onChange={(e) => setHotelName(e.target.value)}
                                        className="pl-9 bg-[#1A1A1A] border-[#333] focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="pl-9 bg-[#1A1A1A] border-[#333] focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Guest Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="pl-9 bg-[#1A1A1A] border-[#333] focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ADVANCED OPTIONS */}
                    <div className="space-y-4 border-t border-[#222] pt-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Inclusions (Separate by comma)</Label>
                            <div className="relative">
                                <FileCheck className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    value={inclusions}
                                    onChange={(e) => setInclusions(e.target.value)}
                                    className="pl-9 bg-[#1A1A1A] border-[#333] focus:border-blue-500"
                                    placeholder="Breakfast, Dinner, WiFi"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Custom Note (Optional)</Label>
                            <Textarea
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                className="bg-[#1A1A1A] border-[#333] focus:border-blue-500 min-h-[60px]"
                                placeholder="e.g. Happy Anniversary! / Payment pending at reception."
                            />
                        </div>

                        {mode === 'hotel' && (
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="showPrice"
                                    checked={showPrice}
                                    onCheckedChange={(c) => setShowPrice(c as boolean)}
                                    className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label htmlFor="showPrice" className="text-gray-300 font-normal">
                                    Show <b>Price/Balance</b> on Voucher?
                                </Label>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-[#333] text-gray-300 hover:bg-[#1A1A1A]">
                        Cancel
                    </Button>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                        <Eye className="w-4 h-4 mr-2" />
                        Generate PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
