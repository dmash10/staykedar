import { format } from "date-fns";
import { MapPin, Phone, Mail, Calendar, Users, CheckCircle, Clock, Shield, Info, CreditCard } from "lucide-react";

export interface VoucherData {
    bookingId: string;
    guestName: string;
    hotelName: string;
    hotelLocation: string;
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    roomType: string;
    plan: string;
    amountPaid?: number;
    balanceDue?: number;
    isHotelCopy: boolean;
    // New Fields
    inclusions?: string[];
    customNote?: string;
    showPrice?: boolean;
}

export function VoucherTemplate({ data }: { data: VoucherData }) {
    const nights = Math.ceil((data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-white text-slate-900 p-8 max-w-[800px] mx-auto shadow-none print:shadow-none print:p-0 font-sans" id="voucher-print-area">

            {/* HEADER */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">StayKedarnath</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Premium Yatra Services • Est. 2023</p>
                    <div className="flex items-center gap-3 mt-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-semibold">+91 90274 75042</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                            <span>support@staykedarnath.com</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-bold text-sm inline-flex items-center gap-2 border border-blue-100 shadow-sm">
                        <CheckCircle className="w-4 h-4" /> CONFIRMED
                    </div>
                    <div className="mt-4">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Booking ID</p>
                        <p className="text-xl font-mono font-bold text-slate-800 tracking-wide">{data.bookingId}</p>
                    </div>
                </div>
            </div>

            {/* HERO SECTION - HOTEL & DATES */}
            <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="col-span-2 space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Accommodation</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 leading-tight">{data.hotelName}</h3>
                        <div className="flex items-center text-slate-600 mt-2 text-sm font-medium">
                            <MapPin className="w-4 h-4 mr-1.5 text-blue-500" />
                            {data.hotelLocation}
                        </div>
                    </div>

                    {/* Date Cards */}
                    <div className="flex items-stretch gap-0 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="flex-1 p-4 bg-slate-50 border-r border-slate-200">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Check In</p>
                            <p className="font-bold text-xl text-slate-800">{format(data.checkIn, 'dd MMM')}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">{format(data.checkIn, 'EEEE')} • 12:00 PM</p>
                        </div>
                        <div className="flex items-center justify-center px-6 bg-white">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">{nights} Nights</span>
                                <div className="w-12 h-0.5 bg-slate-200 relative">
                                    <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 bg-slate-50 border-l border-slate-200">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Check Out</p>
                            <p className="font-bold text-xl text-slate-800">{format(data.checkOut, 'dd MMM')}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">{format(data.checkOut, 'EEEE')} • 10:00 AM</p>
                        </div>
                    </div>

                    {/* Inclusions (Dynamic) */}
                    {data.inclusions && data.inclusions.length > 0 && (
                        <div className="border border-green-100 bg-green-50/50 rounded-lg p-4">
                            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" /> Package Inclusions
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {data.inclusions.map((inc, i) => (
                                    <span key={i} className="text-xs font-medium bg-white text-green-800 px-2.5 py-1 rounded border border-green-200 shadow-sm">
                                        {inc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* GUEST DETAILS CARD */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <h4 className="font-bold text-blue-100 mb-5 flex items-center gap-2 border-b border-white/20 pb-3">
                        <Users className="w-4 h-4" /> Guest Details
                    </h4>

                    <div className="space-y-4 text-sm relative z-10">
                        <div>
                            <p className="text-blue-200 text-xs font-medium mb-0.5">Primary Guest</p>
                            <p className="font-bold text-lg tracking-wide">{data.guestName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-blue-200 text-xs font-medium mb-0.5">Guests</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-bold text-base">{data.adults}</span> <span className="text-blue-200 text-xs">Adults</span>
                                    {data.children > 0 && (
                                        <>
                                            <span className="font-bold text-base ml-1">{data.children}</span> <span className="text-blue-200 text-xs">Child</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-blue-200 text-xs font-medium mb-0.5">Meal Plan</p>
                                <p className="font-bold text-base bg-white/20 inline-block px-2 rounded">{data.plan}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-blue-200 text-xs font-medium mb-0.5">Room Type</p>
                            <p className="font-semibold text-white/95">{data.roomType}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" /> Hotel Policies
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2.5 ml-1">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Standard Check-in: <b>12:00 PM</b></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Standard Check-out: <b>10:00 AM</b></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Valid Govt. ID required for all guests.</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" /> Important Info
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2.5 ml-1">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Hot water timings may vary in hills.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Please inform 2 hrs prior for late arrival.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* CUSTOM NOTES SECTION */}
            {data.customNote && (
                <div className="mt-8 bg-amber-50 border border-amber-100 p-4 rounded-lg">
                    <p className="text-xs font-bold text-amber-700 uppercase mb-1">Note from Agent</p>
                    <p className="text-sm text-amber-900 font-medium">{data.customNote}</p>
                </div>
            )}

            {/* FINANCIAL SECTION (High Contrast) */}
            {(data.isHotelCopy || data.showPrice) && (
                <div className="mt-8 pt-6 border-t font-mono">
                    {data.isHotelCopy ? (
                        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
                            <div>
                                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">INSTRUCTION TO HOTEL</p>
                                <p className="font-bold text-lg">Collect Balance Amount</p>
                                <p className="text-sm text-slate-400">Please collect this amount from guest upon check-in.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase mb-1">Amount Due</p>
                                <p className="text-3xl font-bold text-white">₹{data.balanceDue?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-lg">Booking Fully Paid</p>
                                    <p className="text-sm text-slate-500">No payment required at property.</p>
                                </div>
                            </div>
                            {/* Only show Total if explicitly requested, otherwise handled by isHotelCopy logic usually */}
                        </div>
                    )}
                </div>
            )}

            {/* FOOTER */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-xs mb-2">This is a computer generated voucher and acts as a confirmation of your booking.</p>
                <div className="inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                    <span>StayKedarnath Yatra Services</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>Regd. Office: Guptkashi, Uttarakhand</span>
                </div>
            </div>
        </div>
    );
}
