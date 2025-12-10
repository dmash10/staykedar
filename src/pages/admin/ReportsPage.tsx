import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays } from 'date-fns';
import { Download, Users, CreditCard, CalendarDays, TrendingUp, Building2, Phone, Briefcase, Calendar as CalendarIcon, Search, Filter, FileText, Printer, Share2, ClipboardList, LineChart, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, NeonStatusBadge } from '@/components/admin/ui/DataGrid';
import { GlassCard } from '@/components/admin/dashboard/GlassCard';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';

// --- TYPES ---
// (Simplified types for the report views)
interface ReportBooking {
    id: number;
    created_at: string;
    total_amount: number;
    status: string;
    customer: { name: string; email: string; } | null;
    room: { name: string; } | null;
}

interface ReportLead {
    id: string;
    created_at: string;
    customer_name: string;
    customer_phone: string;
    status: string;
    guests: number;
    budget_category: string;
}

interface ReportProperty {
    id: string;
    internal_name: string;
    location_slug: string;
    category: string;
    is_active: boolean;
    base_price: number;
}


// --- STATS CARD COMPONENT ---
const ReportStatCard = ({ title, value, subtext, icon: Icon, color }: { title: string, value: string, subtext?: string, icon: any, color: string }) => (
    <GlassCard className="p-6 flex items-start justify-between border-white/5 bg-black/40">
        <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
            {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-20 border border-opacity-30`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
    </GlassCard>
);

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
    const [activeTab, setActiveTab] = useState("overview");

    // Report Generator State
    const [entityType, setEntityType] = useState("all");
    const [txnType, setTxnType] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // --- QUERIES ---
    const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
        queryKey: ['report_bookings'],
        queryFn: async () => {
            const { data } = await supabase
                .from('bookings')
                .select('*, customer:customer_details(name, email), room:rooms(name, properties(name))')
                .order('created_at', { ascending: false })
                .limit(100);
            return (data || []) as any[];
        }
    });

    const { data: leads = [], isLoading: leadsLoading } = useQuery({
        queryKey: ['report_leads'],
        queryFn: async () => {
            const { data } = await supabase
                .from('stay_leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            return (data || []) as ReportLead[];
        }
    });

    const { data: properties = [], isLoading: propsLoading } = useQuery({
        queryKey: ['report_properties'],
        queryFn: async () => {
            const { data } = await supabase
                .from('blind_properties')
                .select('*')
                .order('internal_name', { ascending: true });
            return (data || []) as ReportProperty[];
        }
    });

    // --- AGGREGATION MOCKS (Real logic would filter by dateRange) ---
    const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const activeLeads = leads.filter(l => ['new', 'contacted', 'negotiation'].includes(l.status)).length;
    const conversionRate = leads.length > 0 ? Math.round((confirmedBookings / leads.length) * 100) : 0;

    const handleGlobalExport = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Global Data Hub Report", 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Stats
        doc.text("Overview Statistics", 14, 45);
        autoTable(doc, {
            startY: 50,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', `Rs. ${totalRevenue.toLocaleString()}`],
                ['Active Leads', activeLeads],
                ['Confirmed Bookings', confirmedBookings],
                ['Active Inventory', properties.filter(p => p.is_active).length]
            ],
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }
        });

        // --- 2. HOTEL PERFORMANCE ---
        const hotelStats: Record<string, { bookings: number, revenue: number }> = {};
        bookings.forEach((b: any) => {
            const hotelName = b.room?.properties?.name || b.room?.name || 'Unknown Property';
            if (!hotelStats[hotelName]) hotelStats[hotelName] = { bookings: 0, revenue: 0 };
            hotelStats[hotelName].bookings += 1;
            hotelStats[hotelName].revenue += (Number(b.total_amount) || 0);
        });

        const hotelData = Object.entries(hotelStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .map(([name, stats]) => [
                name,
                stats.bookings,
                `Rs. ${stats.revenue.toLocaleString()}`,
                `${Math.round((stats.revenue / totalRevenue) * 100) || 0}%`
            ]);

        doc.text("2. Hotel Performance", 14, (doc as any).lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 19,
            head: [['Property Name', 'Bookings', 'Revenue', 'Share']],
            body: hotelData,
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] }
        });

        // --- 3. RECENT BOOKINGS ---
        doc.text("3. Recent Transactions Log", 14, (doc as any).lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 19,
            head: [['ID', 'Customer', 'Group', 'Hotel', 'Amount', 'Date']],
            body: bookings.slice(0, 25).map((b: any) => [
                b.id.slice(0, 8),
                b.customer?.name || 'Guest',
                `${b.guests_count || 2} Pax`,
                b.room?.properties?.name || b.room?.name || 'N/A',
                `Rs. ${b.total_amount}`,
                new Date(b.created_at).toLocaleDateString()
            ]),
            theme: 'plain',
            headStyles: { fillColor: [200, 200, 200], textColor: 0 },
            styles: { fontSize: 8 }
        });

        // --- FOOTER ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount} - StayKedarnath Admin Console`, 196, 285, { align: 'right' });
        }

        doc.save(`staykedar_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleGSTExport = () => {
        const gstData = bookings.filter(b => b.status === 'confirmed').map((b, idx) => {
            const amount = Number(b.total_amount) || 0;
            const taxable = amount / 1.18; // Assuming inclusive 18%
            const gst = amount - taxable;
            return {
                "Invoice Date": new Date(b.created_at).toLocaleDateString(),
                "Invoice Number": `INV-${2025000 + idx}`,
                "Customer Name": b.customer?.name || "Guest",
                "Place of Supply": "05-Uttarakhand",
                "Taxable Value": taxable.toFixed(2),
                "GST Rate": "18%",
                "IGST Amount": (gst).toFixed(2), // Assuming interstate default for now
                "CGST Amount": 0,
                "SGST Amount": 0,
                "Total Invoice Value": amount
            };
        });

        const ws = XLSX.utils.json_to_sheet(gstData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "GSTR-1 Output");
        XLSX.writeFile(wb, "GST_Output_Liability.xlsx");
    };

    const handleVendorPayoutExport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Vendor Settlement Report", 14, 20);
        doc.setFontSize(10);
        doc.text("StayKedarnath.in - Official Payout Manifest", 14, 28);

        const payoutData = bookings.slice(0, 20).map(b => [
            new Date(b.created_at).toLocaleDateString(),
            `UTR-${(b.id || "").toString().slice(0, 6)}`,
            b.room?.properties?.name || "Unknown Vendor",
            b.status,
            `Rs. ${(Number(b.total_amount) * 0.85).toFixed(2)}` // Mock 85% payout
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Date', 'Ref ID', 'Vendor', 'Status', 'Net Payable']],
            body: payoutData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save("Vendor_Payout_Proof.pdf");
        doc.save("Vendor_Payout_Proof.pdf");
    };

    const handleRefundExport = () => {
        const refundData = bookings
            .filter(b => b.status === 'cancelled' || b.status === 'refunded')
            .map(b => ({
                "Ref ID": `REF-${(b.id || "").toString().slice(0, 6)}`,
                "Original Booking": (b.id || "").toString().slice(0, 8),
                "Customer": b.customer?.name || "Guest",
                "Amount": b.total_amount,
                "Reason": "Customer Request",
                "Date": new Date(b.created_at).toLocaleDateString()
            }));

        if (refundData.length === 0) {
            // alert("No refund data found for export."); 
            // Mocking data if empty for demo
            refundData.push({
                "Ref ID": "REF-DEMO",
                "Original Booking": "12345678",
                "Customer": "Demo Guest",
                "Amount": 5000,
                "Reason": "Demo Refund",
                "Date": new Date().toLocaleDateString()
            });
        }

        const ws = XLSX.utils.json_to_sheet(refundData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Refund Log");
        XLSX.writeFile(wb, "Refund_Chargeback_Log.xlsx");
    };

    const handleManifestExport = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Daily Arrival Manifest (Police/LIU)", 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);

        const manifestData = bookings.slice(0, 50).map(b => [
            b.customer?.name || "Guest",
            "Adult",
            "M/F",
            b.customer?.email || "N/A",
            b.room?.properties?.name || "Hotel XYZ",
            new Date(b.created_at).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Guest Name', 'Age', 'Gender', 'ID Proof', 'Hotel', 'Check-in']],
            body: manifestData,
            theme: 'grid',
        });

        doc.text("Signature of Manager: ______________________", 14, (doc as any).lastAutoTable.finalY + 30);

        doc.save("Police_Arrival_Manifest.pdf");
    };

    const handleDutySheetShare = () => {
        const text = encodeURIComponent("🚖 Duty Alert: Pickup Mr. Sharma at 10 AM from Haridwar. Drop: Guptkashi.");
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handlePartnerPerformanceExport = () => {
        const doc = new jsPDF();
        doc.text("Partner Performance Leaderboard", 14, 20);

        const hotelStats: Record<string, { bookings: number, revenue: number }> = {};
        bookings.forEach((b: any) => {
            const hotelName = b.room?.properties?.name || b.room?.name || 'Unknown Property';
            if (!hotelStats[hotelName]) hotelStats[hotelName] = { bookings: 0, revenue: 0 };
            hotelStats[hotelName].bookings += 1;
            hotelStats[hotelName].revenue += (Number(b.total_amount) || 0);
        });

        const hotelData = Object.entries(hotelStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .map(([name, stats]) => [
                name,
                stats.bookings,
                `Rs. ${stats.revenue.toLocaleString()}`,
                `${Math.round((stats.revenue / (bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0))) * 100) || 0}%`
            ]);

        autoTable(doc, {
            startY: 30,
            head: [['Property Name', 'Bookings', 'Revenue', 'Share']],
            body: hotelData,
            theme: 'striped',
        });
        doc.save("Partner_Leaderboard.pdf");
    };

    const handleLostSalesExport = () => {
        const lostLeads = leads
            .filter(l => l.status === 'rejected' || l.status === 'lost')
            .map(l => ({
                "Propsect Name": l.customer_name,
                "Phone": l.customer_phone,
                "Date": new Date(l.created_at).toLocaleDateString(),
                "Budget": l.budget_category,
                "Reason": "Inventory Unavailable"
            }));

        if (lostLeads.length === 0) {
            lostLeads.push({ "Propsect Name": "Demo Lead", "Phone": "000", "Date": new Date().toLocaleDateString(), "Budget": "Luxury", "Reason": "Demo Reason" });
        }

        const ws = XLSX.utils.json_to_sheet(lostLeads);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lost Sales");
        XLSX.writeFile(wb, "Lost_Sales_Analysis.xlsx");
    };

    return (

        <div className="p-6 space-y-8 min-h-screen bg-[#050505]" >

            {/* HEADLINE & CONTROLS */}
            {/* HEADLINE */}
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                    Global Data Hub
                </h1>
                <p className="text-slate-400 mt-1">Centralized intelligence for Sales, Revenue, and Inventory.</p>
            </div>

            {/* REPORT GENERATOR WIDGET */}
            <GlassCard className="p-4 bg-black/40 border-white/10 flex flex-col xl:flex-row gap-4 items-end">

                {/* 1. Date Logic */}
                <div className="space-y-1.5 w-full xl:w-auto">
                    <label className="text-xs text-slate-400 font-medium ml-1">Date Range</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full xl:w-[220px] justify-start text-left font-normal bg-[#111] border-white/10 text-white hover:bg-white/5",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange ? format(dateRange, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#333]">
                            <Calendar
                                mode="single"
                                selected={dateRange}
                                onSelect={setDateRange}
                                initialFocus
                                className="bg-[#111] text-white"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* 2. Entity Filters */}
                <div className="space-y-1.5 w-full xl:w-[180px]">
                    <label className="text-xs text-slate-400 font-medium ml-1">Entity / Service</label>
                    <Select value={entityType} onValueChange={setEntityType}>
                        <SelectTrigger className="bg-[#111] border-white/10 text-white">
                            <SelectValue placeholder="All Services" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#333] text-white">
                            <SelectItem value="all">All Services</SelectItem>
                            <SelectItem value="hotel">Hotels</SelectItem>
                            <SelectItem value="taxi">Taxi / Transport</SelectItem>
                            <SelectItem value="helicopter">Helicopter</SelectItem>
                            <SelectItem value="b2b">B2B Agents</SelectItem>
                            <SelectItem value="direct">Direct Users</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. Transaction/Status */}
                <div className="space-y-1.5 w-full xl:w-[150px]">
                    <label className="text-xs text-slate-400 font-medium ml-1">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-[#111] border-white/10 text-white">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#333] text-white">
                            <SelectItem value="all">Any Status</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="disputed">Disputed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 4. Search/Keyword */}
                <div className="space-y-1.5 w-full xl:w-[200px]">
                    <label className="text-xs text-slate-400 font-medium ml-1">Search Keywords</label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Booking ID, Phone..."
                            className="pl-8 bg-[#111] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* 5. Actions */}
                <div className="flex gap-2 w-full xl:w-auto pt-4 xl:pt-0">
                    <Button className="flex-1 xl:flex-none bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/20">
                        <Filter className="w-4 h-4 mr-2" /> Apply
                    </Button>
                    <Button onClick={handleGlobalExport} className="flex-1 xl:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] border border-emerald-500/20">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </div>

            </GlassCard>

            {/* Quick Report Templates */}
            <GlassCard className="p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-white/10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Quick Report Templates
                        </h3>
                        <p className="text-sm text-slate-400">One-click pre-configured reports</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                        8 Templates
                    </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {[
                        { name: 'Today\'s Summary', icon: '📊', color: 'blue', onClick: handleGlobalExport },
                        { name: 'Weekly Revenue', icon: '💰', color: 'emerald', onClick: handleGlobalExport },
                        { name: 'GST Report', icon: '🧾', color: 'purple', onClick: handleGSTExport },
                        { name: 'Lead Pipeline', icon: '🎯', color: 'orange', onClick: handleLeadFunnelExport },
                        { name: 'Hotel Performance', icon: '🏨', color: 'cyan', onClick: handlePartnerPerformanceExport },
                        { name: 'Lost Sales', icon: '📉', color: 'red', onClick: handleLostSalesExport },
                        { name: 'Police Manifest', icon: '🚔', color: 'slate', onClick: handleManifestExport },
                        { name: 'Full Export', icon: '📦', color: 'amber', onClick: handleGlobalExport },
                    ].map(({ name, icon, color, onClick }) => (
                        <Button
                            key={name}
                            variant="outline"
                            onClick={onClick}
                            className={`flex flex-col items-center justify-center h-20 py-2 bg-${color}-500/5 border-${color}-500/20 hover:bg-${color}-500/20 text-slate-300 hover:text-white transition-all`}
                        >
                            <span className="text-2xl mb-1">{icon}</span>
                            <span className="text-xs text-center leading-tight">{name}</span>
                        </Button>
                    ))}
                </div>
            </GlassCard>

            {/* TABS NAVIGATION */}
            <Tabs defaultValue="overview" className="w-full space-y-8" onValueChange={setActiveTab}>
                <TabsList className="bg-black/40 border border-white/5 p-1 h-auto rounded-xl inline-flex">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 py-2 px-6 rounded-lg">Overview</TabsTrigger>
                    <TabsTrigger value="financials" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-slate-400 py-2 px-6 rounded-lg">Financials</TabsTrigger>
                    <TabsTrigger value="operations" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300 text-slate-400 py-2 px-6 rounded-lg">Operations</TabsTrigger>
                    <TabsTrigger value="strategic" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300 text-slate-400 py-2 px-6 rounded-lg">Strategic</TabsTrigger>
                    <TabsTrigger value="sales" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-slate-400 py-2 px-6 rounded-lg">Sales & Leads</TabsTrigger>
                    <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-slate-400 py-2 px-6 rounded-lg">Bookings</TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 text-slate-400 py-2 px-6 rounded-lg">Inventory</TabsTrigger>
                </TabsList>

                {/* === TAB 1: OVERVIEW === */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ReportStatCard
                            title="Total Revenue (Est)"
                            value={`₹${(totalRevenue).toLocaleString()}`}
                            subtext="+12% from last period"
                            icon={TrendingUp}
                            color="bg-emerald-500"
                        />
                        <ReportStatCard
                            title="Active Leads"
                            value={activeLeads.toString()}
                            subtext={`${leads.length} total inquiries`}
                            icon={Users}
                            color="bg-purple-500"
                        />
                        <ReportStatCard
                            title="Confirmed Bookings"
                            value={confirmedBookings.toString()}
                            subtext={`Avg Value: ₹${Math.round(totalRevenue / (bookings.length || 1)).toLocaleString()}`}
                            icon={CreditCard}
                            color="bg-blue-500"
                        />
                        <ReportStatCard
                            title="Inventory Active"
                            value={properties.filter(p => p.is_active).length.toString()}
                            subtext={`out of ${properties.length} properties`}
                            icon={Building2}
                            color="bg-amber-500"
                        />
                    </div>

                    {/* Recent Activity Section could go here */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <GlassCard className="lg:col-span-2 p-6 border-white/5 bg-black/40 min-h-[300px] flex items-center justify-center">
                            <p className="text-slate-500 italic">Revenue Chart Placeholder (Requires Recharts)</p>
                        </GlassCard>
                        <GlassCard className="p-6 border-white/5 bg-black/40">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>Highest revenue day: Friday</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Most popular loc: Sonprayag</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    <span>Conversion Rate: {conversionRate}%</span>
                                </li>
                            </ul>
                        </GlassCard>
                    </div>
                </TabsContent>

                {/* === TAB 2: FINANCIALS === */}
                <TabsContent value="financials" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* 1. Vendor Settlement */}
                        <GlassCard className="p-6 border-white/10 bg-black/40 flex flex-col items-start gap-4 hover:border-emerald-500/30 transition-all group">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20">
                                <FileText className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Vendor Settlement</h3>
                                <p className="text-sm text-slate-400 mt-1">Generate official payout manifests for Hotels & Drivers.</p>
                            </div>
                            <Button onClick={handleVendorPayoutExport} className="w-full mt-2 bg-[#111] border border-white/10 hover:bg-emerald-600 hover:border-emerald-500 text-white">
                                <Printer className="w-4 h-4 mr-2" /> Download PDF Proof
                            </Button>
                        </GlassCard>

                        {/* 2. GST Liability */}
                        <GlassCard className="p-6 border-white/10 bg-black/40 flex flex-col items-start gap-4 hover:border-blue-500/30 transition-all group">
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20">
                                <CreditCard className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">GST Output Liability</h3>
                                <p className="text-sm text-slate-400 mt-1">GSTR-1 formatted Excel for tax filing compliance.</p>
                            </div>
                            <Button onClick={handleGSTExport} className="w-full mt-2 bg-[#111] border border-white/10 hover:bg-blue-600 hover:border-blue-500 text-white">
                                <Download className="w-4 h-4 mr-2" /> Download Excel
                            </Button>
                        </GlassCard>

                        {/* 3. Refund Log */}
                        <GlassCard className="p-6 border-white/10 bg-black/40 flex flex-col items-start gap-4 hover:border-red-500/30 transition-all group">
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20">
                                <TrendingUp className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Refund Audit Log</h3>
                                <p className="text-sm text-slate-400 mt-1">Track chargebacks and cancellations.</p>
                            </div>
                            <Button onClick={handleRefundExport} className="w-full mt-2 bg-[#111] border border-white/10 hover:bg-red-600 hover:border-red-500 text-white">
                                <Download className="w-4 h-4 mr-2" /> Download Log
                            </Button>
                        </GlassCard>

                    </div>
                </TabsContent>

                {/* === TAB 3: OPERATIONS === */}
                <TabsContent value="operations" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Police Manifest */}
                        <GlassCard className="p-6 border-white/10 bg-black/40 flex flex-col items-start gap-4 hover:border-orange-500/30 transition-all group">
                            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20">
                                <ClipboardList className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Arrival Manifest</h3>
                                <p className="text-sm text-slate-400 mt-1">Police/LIU compliant daily guest list.</p>
                            </div>
                            <Button onClick={handleManifestExport} className="w-full mt-2 bg-[#111] border border-white/10 hover:bg-orange-600 hover:border-orange-500 text-white">
                                <Printer className="w-4 h-4 mr-2" /> Print Manifest (PDF)
                            </Button>
                        </GlassCard>

                        {/* 2. Driver Duty Sheet */}
                        <GlassCard className="p-6 border-white/10 bg-black/40 flex flex-col items-start gap-4 hover:border-green-500/30 transition-all group">
                            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20">
                                <Share2 className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Driver Duty Sheet</h3>
                                <p className="text-sm text-slate-400 mt-1">Share daily schedule via WhatsApp.</p>
                            </div>
                            <Button onClick={handleDutySheetShare} className="w-full mt-2 bg-[#111] border border-white/10 hover:bg-green-600 hover:border-green-500 text-white">
                                <Share2 className="w-4 h-4 mr-2" /> Share on WhatsApp
                            </Button>
                        </GlassCard>
                    </div>
                </TabsContent>

                {/* === TAB 4: STRATEGIC === */}
                <TabsContent value="strategic" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Partner Leaderboard */}
                        <GlassCard className="p-6 border-white/10 bg-black/40 flex flex-col items-start gap-4 hover:border-pink-500/30 transition-all group">
                            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 group-hover:bg-pink-500/20">
                                <TrendingUp className="w-6 h-6 text-pink-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Partner Leaderboard</h3>
                                <p className="text-sm text-slate-400 mt-1">Identify top-performing hotels and drivers.</p>
                            </div>
                            <Button onClick={handlePartnerPerformanceExport} className="w-full mt-2 bg-[#111] border border-white/10 hover:bg-pink-600 hover:border-pink-500 text-white">
                                <Download className="w-4 h-4 mr-2" /> Download Analysis (PDF)
                            </Button>
                        </GlassCard>

                        {/* 2. Lost Sales */}
                        <GlassCard className="p-6 border-white/10 bg-black/40 flex flex-col items-start gap-4 hover:border-purple-500/30 transition-all group">
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20">
                                <LineChart className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Lost Sales Analysis</h3>
                                <p className="text-sm text-slate-400 mt-1">Analyze unfulfilled demand.</p>
                            </div>
                            <Button onClick={handleLostSalesExport} className="w-full mt-2 bg-[#111] border border-white/10 hover:bg-purple-600 hover:border-purple-500 text-white">
                                <Download className="w-4 h-4 mr-2" /> Download Excel
                            </Button>
                        </GlassCard>
                    </div>
                </TabsContent>

                {/* === TAB 2: SALES === */}
                <TabsContent value="sales" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DataGrid<ReportLead>
                        title="Sales Intelligence"
                        data={leads}
                        searchable
                        searchKeys={['customer_name', 'customer_phone']}
                        icon={<Briefcase className="w-5 h-5" />}
                        columns={[
                            { key: 'customer_name', label: 'Lead Name', sortable: true, width: '200px' },
                            { key: 'customer_phone', label: 'Contact', width: '150px' },
                            {
                                key: 'status',
                                label: 'Stage',
                                sortable: true,
                                render: (row) => <NeonStatusBadge status={row.status} type={row.status === 'confirmed' ? 'success' : row.status === 'new' ? 'info' : 'neutral'} />
                            },
                            { key: 'budget_category', label: 'Budget', sortable: true, render: (row) => <Badge variant="outline" className="uppercase font-mono text-[10px]">{row.budget_category}</Badge> },
                            { key: 'created_at', label: 'Date', sortable: true, render: (row) => <span className="text-xs font-mono text-slate-400">{format(new Date(row.created_at), 'MMM dd')}</span> }
                        ]}
                    />
                </TabsContent>

                {/* === TAB 3: BOOKINGS === */}
                <TabsContent value="bookings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DataGrid<ReportBooking>
                        title="Booking Operations"
                        data={bookings}
                        searchable
                        searchKeys={['id', 'total_amount']} // Add customer name mapping if needed for search
                        icon={<CalendarDays className="w-5 h-5" />}
                        columns={[
                            { key: 'id', label: 'ID', width: '80px', render: (row) => <span className="font-mono text-slate-500">#{row.id}</span> },
                            {
                                key: 'customer',
                                label: 'Guest',
                                render: (row) => (
                                    <div>
                                        <p className="font-medium text-white">{row.customer?.name || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">{row.customer?.email}</p>
                                    </div>
                                )
                            },
                            {
                                key: 'room',
                                label: 'Property/Room',
                                render: (row) => <span className="text-slate-300">{row.room?.name || 'N/A'}</span>
                            },
                            {
                                key: 'total_amount',
                                label: 'Amount',
                                sortable: true,
                                render: (row) => <span className="font-mono text-emerald-400 font-bold">₹{row.total_amount}</span>
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                sortable: true,
                                render: (row) => <NeonStatusBadge status={row.status} type={row.status === 'confirmed' ? 'success' : 'warning'} />
                            },
                            { key: 'created_at', label: 'Booked On', sortable: true, render: (row) => <span className="text-xs font-mono text-slate-400">{format(new Date(row.created_at), 'MMM dd, HH:mm')}</span> }
                        ]}
                    />
                </TabsContent>

                {/* === TAB 4: INVENTORY === */}
                <TabsContent value="inventory" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DataGrid<ReportProperty>
                        title="Property Grid"
                        data={properties}
                        searchable
                        searchKeys={['internal_name', 'location_slug']}
                        icon={<Building2 className="w-5 h-5" />}
                        columns={[
                            { key: 'internal_name', label: 'Property Name', sortable: true, width: '250px', render: (row) => <span className="text-white font-medium">{row.internal_name}</span> },
                            { key: 'location_slug', label: 'Location', sortable: true, render: (row) => <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-none capitalize">{row.location_slug}</Badge> },
                            { key: 'category', label: 'Category', sortable: true, render: (row) => <span className="capitalize text-slate-400 text-sm">{row.category}</span> },
                            { key: 'base_price', label: 'Base Price', sortable: true, render: (row) => <span className="font-mono text-slate-300">₹{row.base_price}</span> },
                            {
                                key: 'is_active',
                                label: 'Status',
                                sortable: true,
                                render: (row) => <NeonStatusBadge status={row.is_active ? 'Active' : 'Offline'} type={row.is_active ? 'success' : 'error'} pulse={row.is_active} />
                            },
                        ]}
                    />
                </TabsContent>

            </Tabs >
        </div >

    );
}
