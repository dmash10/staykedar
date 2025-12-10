
import { forwardRef } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

export interface VoucherData {
    id: string;
    customer_name: string;
    customer_phone: string;
    check_in: string;
    check_out: string;
    guests: number;
    property_name: string;
    room_type: string; // e.g., 'Deluxe Room'
    rooms_count: number;
    total_amount: number;
    advance_paid: number;
    payment_status: 'paid' | 'partial' | 'pending';
    booking_id: string; // generated ID
}

interface VoucherTemplateProps {
    data: VoucherData | null;
}

export const VoucherTemplate = forwardRef<HTMLDivElement, VoucherTemplateProps>(({ data }, ref) => {
    if (!data) return null;

    return (
        <div ref={ref} className="bg-white text-slate-900 p-8 w-[210mm] min-h-[297mm] mx-auto relative print:w-full print:h-full print:m-0 print:p-8">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                <h1 className="text-[150px] font-black -rotate-45 text-slate-900 whitespace-nowrap">STAYKEDARNATH</h1>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-6 relative z-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">BOOKING VOUCHER</h1>
                    <p className="text-sm text-slate-500 font-medium">Official Confirmation</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-900">StayKedarnath</h2>
                    <p className="text-xs text-slate-500 mt-1">Yatra Management Services</p>
                    <p className="text-xs text-slate-500">support@staykedarnath.com</p>
                    <p className="text-xs text-slate-500">+91 9027475042</p>
                </div>
            </div>

            {/* Booking ID & Key Details */}
            <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100 relative z-10">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Booking Reference</p>
                    <p className="text-lg font-mono font-bold text-slate-900">#{data.booking_id}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase ${data.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            data.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {data.payment_status}
                    </span>
                </div>
            </div>

            {/* Guest & Hotel Info */}
            <div className="grid grid-cols-2 gap-12 mb-8 relative z-10">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Guest Details</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Guest Name</p>
                            <p className="font-semibold text-slate-800">{data.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Phone</p>
                            <p className="font-semibold text-slate-800">{data.customer_phone}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Guests</p>
                            <p className="font-semibold text-slate-800">{data.guests} PAX</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Accommodation</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Property</p>
                            <p className="font-semibold text-emerald-700 text-lg">{data.property_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Check In</p>
                                <p className="font-semibold text-slate-800">{format(new Date(data.check_in), 'PPP')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Check Out</p>
                                <p className="font-semibold text-slate-800">{format(new Date(data.check_out), 'PPP')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Room Type</p>
                                <p className="font-semibold text-slate-800">{data.room_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Rooms</p>
                                <p className="font-semibold text-slate-800">{data.rooms_count} Units</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-12 relative z-10">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Payment Information</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Total Booking Amount</span>
                        <span className="text-sm font-bold text-slate-900">₹{data.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Advance Paid</span>
                        <span className="text-sm font-bold text-emerald-600">-₹{data.advance_paid.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                        <span className="text-base font-bold text-slate-900">Balance Due at Hotel</span>
                        <span className="text-base font-black text-slate-900">₹{(data.total_amount - data.advance_paid).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Policies & Footer */}
            <div className="mt-auto border-t-2 border-slate-100 pt-6 relative z-10">
                <div className="grid grid-cols-2 gap-8 text-xs text-slate-500">
                    <div>
                        <h4 className="font-bold text-slate-700 mb-2">Important Instructions</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Please present this voucher along with a valid Government ID proof upon check-in.</li>
                            <li>Check-in Time: 12:00 PM | Check-out Time: 11:00 AM.</li>
                            <li>Balance amount must be cleared upon arrival.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-700 mb-2">Cancellation Policy</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Cancellations made 48 hours prior to check-in are eligible for a partial refund.</li>
                            <li>No-shows will be charged the full booking amount.</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-8 pt-8 border-t border-slate-100">
                    <p className="font-black text-slate-300 text-3xl tracking-widest uppercase mb-2">STAYKEDARNATH</p>
                    <p className="text-[10px] text-slate-400">© 2024 StayKedarnath. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
});

VoucherTemplate.displayName = "VoucherTemplate";
