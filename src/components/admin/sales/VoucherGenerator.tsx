
import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, FileText, Loader2 } from "lucide-react";
import { VoucherTemplate, VoucherData } from "./VoucherTemplate";
import { Lead } from "@/components/admin/crm/LeadCard";

interface VoucherGeneratorProps {
    lead: Lead | null;
}

export function VoucherGenerator({ lead }: VoucherGeneratorProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [advancePaid, setAdvancePaid] = useState(0);
    const [roomsCount, setRoomsCount] = useState(1);
    const [roomType, setRoomType] = useState("Standard Room");

    // Initialize with Lead Data if available
    useEffect(() => {
        if (lead) {
            // Try to parse lead for pre-fill data if available
            // For now, we only have basic lead info
        }
    }, [lead]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Voucher-${lead?.customer_name || 'Guest'}`,
    });

    const voucherData: VoucherData | null = lead ? {
        id: "v_" + Date.now(),
        booking_id: `SK-${Math.floor(Math.random() * 10000)}`,
        customer_name: lead.customer_name || "Guest",
        customer_phone: lead.customer_phone || "",
        guests: lead.guests,
        check_in: checkIn || new Date().toISOString(),
        check_out: checkOut || new Date().toISOString(),
        property_name: propertyName || "Select Property",
        room_type: roomType,
        rooms_count: roomsCount,
        total_amount: totalAmount,
        advance_paid: advancePaid,
        payment_status: advancePaid >= totalAmount ? 'paid' : advancePaid > 0 ? 'partial' : 'pending',
    } : null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full bg-slate-800 border-white/10 hover:bg-slate-700 text-slate-300">
                    <FileText className="w-4 h-4 mr-2" /> Generate Voucher
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-[#0b1015] border-white/10 text-white h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 border-b border-white/10">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        Generate Booking Voucher
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Controls */}
                    <div className="w-1/3 p-6 border-r border-white/10 overflow-y-auto space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Booking Details</h3>

                            <div className="space-y-2">
                                <Label>Property Name</Label>
                                <Input
                                    placeholder="e.g. Hotel Shiva"
                                    className="bg-black/20 border-white/10"
                                    value={propertyName}
                                    onChange={(e) => setPropertyName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Check In</Label>
                                    <Input
                                        type="date"
                                        className="bg-black/20 border-white/10"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Check Out</Label>
                                    <Input
                                        type="date"
                                        className="bg-black/20 border-white/10"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Room Type</Label>
                                    <Select value={roomType} onValueChange={setRoomType}>
                                        <SelectTrigger className="bg-black/20 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Standard Room">Standard Room</SelectItem>
                                            <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                                            <SelectItem value="Family Suite">Family Suite</SelectItem>
                                            <SelectItem value="Dormitory">Dormitory</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>No. of Rooms</Label>
                                    <Input
                                        type="number"
                                        className="bg-black/20 border-white/10"
                                        value={roomsCount}
                                        onChange={(e) => setRoomsCount(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Payment</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        className="bg-black/20 border-white/10"
                                        value={totalAmount}
                                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Advance Paid (₹)</Label>
                                    <Input
                                        type="number"
                                        className="bg-black/20 border-white/10"
                                        value={advancePaid}
                                        onChange={(e) => setAdvancePaid(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 mt-8"
                            onClick={() => handlePrint && handlePrint()}
                            disabled={!propertyName || !checkIn || !checkOut}
                        >
                            <Printer className="w-4 h-4 mr-2" /> Print / Download PDF
                        </Button>
                    </div>

                    {/* Right: Preview */}
                    <div className="w-2/3 bg-slate-900/50 p-8 overflow-y-auto flex items-start justify-center">
                        <div className="scale-[0.6] origin-top shadow-2xl">
                            <VoucherTemplate ref={componentRef} data={voucherData} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
