import { useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { VoucherGenerator } from '@/components/admin/bookings/VoucherGenerator';
import { BookingDetailSheet } from '@/components/admin/bookings/BookingDetailSheet';
import { CreateBookingDialog } from '@/components/admin/bookings/CreateBookingDialog';
import {
    Printer, Search, Calendar, CheckCircle, XCircle, Clock,
    MoreVertical, User, Home, Filter, RefreshCcw, Download,
    Trash2, Mail, LayoutGrid, List,
    CreditCard, Star, Flag, Copy, Eye, FileText, Settings,
    Maximize2, Minimize2, AlertCircle, Tag, Check, ArrowRight,
    Info, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGrid, NeonStatusBadge } from '@/components/admin/ui/DataGrid';
import { Input } from '@/components/ui/input';

import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
    DropdownMenuCheckboxItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, addDays, isBefore, parseISO, differenceInDays, subDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- MOCK DATA FOR DEMONSTRATION ---
const MOCK_BOOKINGS = [
    {
        id: "BK-7829-XJ",
        created_at: new Date().toISOString(),
        customer_name: "Rahul Sharma",
        customer_email: "rahul.s@example.com",
        customer_phone: "+91 98765 43210",
        type: "stay",
        display_title: "Hotel Verdant Valley - Deluxe Room",
        status: "confirmed",
        amount: 12500,
        check_in_date: addDays(new Date(), 1).toISOString(), // Urgent (Tomorrow)
        guests_count: 2,
        notes: "Anniversary request: Flower bed decoration.",
        is_mock: true
    },
    {
        id: "BK-9921-AZ",
        created_at: subDays(new Date(), 2).toISOString(),
        customer_name: "Priya Singh",
        customer_email: "priya.singh@example.com",
        customer_phone: "+91 87654 32109",
        type: "package",
        display_title: "Kedarnath Yatra Premium Package",
        status: "pending",
        amount: 45000,
        check_in_date: addDays(new Date(), 15).toISOString(),
        duration: "5 Days",
        is_mock: true
    },
    {
        id: "BK-3321-MC",
        created_at: subDays(new Date(), 5).toISOString(),
        customer_name: "Amit Patel",
        customer_email: "amit.patel@example.com", // Recurring
        customer_phone: "+91 76543 21098",
        type: "stay",
        display_title: "Mountain View Resort - Suite",
        status: "cancelled",
        amount: 8200,
        check_in_date: subDays(new Date(), 1).toISOString(),
        guests_count: 4,
        is_mock: true
    },
    {
        id: "BK-1102-DL",
        created_at: subDays(new Date(), 10).toISOString(),
        customer_name: "Amit Patel",
        customer_email: "amit.patel@example.com", // Recurring
        customer_phone: "+91 76543 21098",
        type: "stay",
        display_title: "City Center Inn - Standard",
        status: "confirmed",
        amount: 3500,
        check_in_date: subDays(new Date(), 8).toISOString(),
        is_mock: true
    },
    {
        id: "BK-5543-KL",
        created_at: new Date().toISOString(),
        customer_name: "Sneha Gupta",
        customer_email: "sneha.g@example.com",
        customer_phone: "+91 99887 77665",
        type: "package",
        display_title: "Char Dham Heli Tour",
        status: "pending",
        amount: 120000,
        check_in_date: addDays(new Date(), 30).toISOString(),
        notes: "Needs wheelchair assistance.",
        is_mock: true
    }
];

export default function BookingsPage() {
    // -- 1. VIEW MODES & PREFERENCES --
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [density, setDensity] = useState<'compact' | 'normal'>('normal');
    const [visibleColumns, setVisibleColumns] = useState({
        id: true, customer: true, details: true, dates: true, amount: true, status: true, actions: true
    });

    // -- 2. FILTERS --
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // -- 3. SELECTION & ACTIONS --
    const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<any>(null);
    const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<any>(null);
    const [isVoucherOpen, setIsVoucherOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // -- 4. STARRING/FLAGGING (Local for demo, could be DB) --
    const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

    // PAGINATION
    // const [currentPage, setCurrentPage] = useState(1);
    // const itemsPerPage = density === 'compact' ? 15 : 10;

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // -- DATA FETCHING --
    const { data: realBookings = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-bookings'],
        queryFn: async () => {
            const [stayResult, packageResult] = await Promise.all([
                supabase.from('bookings').select(`*, customer_details (name, email, phone_number), rooms (name, room_type, properties (name, location_slug))`).order('created_at', { ascending: false }),
                supabase.from('package_bookings').select(`*, packages (title, duration_days)`).order('created_at', { ascending: false })
            ]);

            const stays = ((stayResult.data || []) as any[]).map((b: any) => ({
                ...b, type: 'stay',
                customer_name: b.customer_details?.name || 'Guest',
                customer_email: b.customer_details?.email,
                customer_phone: b.customer_details?.phone_number,
                display_title: `${b.rooms?.properties?.name || 'Property'} - ${b.rooms?.name || 'Room'}`,
                location: b.rooms?.properties?.location_slug,
                amount: b.total_amount,
                date: b.created_at,
                duration: `${b.guests_count || 2} Guests`
            }));
            const packages = ((packageResult.data || []) as any[]).map((b: any) => ({
                ...b, type: 'package',
                display_title: b.packages?.title || 'Package',
                amount: b.amount, date: b.created_at,
                check_in_date: b.travel_date,
                duration: b.packages?.duration_days ? `${b.packages.duration_days} Days` : 'N/A'
            }));
            return [...stays, ...packages];
        },
        refetchOnWindowFocus: false, // Prevent auto-reload on tab switch
        staleTime: 1000 * 60 * 5 // Data remains fresh for 5 minutes
    });

    const isUsingMock = realBookings.length === 0;
    const bookings = isUsingMock ? MOCK_BOOKINGS.map(b => ({ ...b, date: b.created_at })) : realBookings;

    // -- 5. LOYALTY CALCULATION --
    const customerHistory = useMemo(() => {
        const history: Record<string, number> = {};
        bookings.forEach(b => {
            if (b.customer_email) history[b.customer_email] = (history[b.customer_email] || 0) + 1;
        });
        return history;
    }, [bookings]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, type }: { id: string, status: string, type: string }) => {
            // @ts-ignore
            if (bookings[0]?.is_mock) { // Mock simulation
                toast({ title: "Simulation", description: `Status updated to ${status} (Demo Mode)` });
                return;
            }
            const table = type === 'package' ? 'package_bookings' : 'bookings';
            // @ts-ignore
            const { error } = await supabase.from(table).update({ status }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            if (!isUsingMock) {
                queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
                toast({ title: "Updated", description: "Booking status changed.", className: "bg-green-600 text-white" });
            }
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    // -- PROCESSING --
    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const matchesSearch =
                b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.display_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            const matchesType = typeFilter === 'all' || b.type === typeFilter;

            let matchesDate = true;
            if (dateRange?.from) {
                const bookingDate = new Date(b.date);
                matchesDate = isWithinInterval(bookingDate, {
                    start: dateRange.from,
                    end: dateRange.to || dateRange.from
                });
            }

            return matchesSearch && matchesStatus && matchesType && matchesDate;
        }).sort((a, b) => {
            if (starredIds.has(a.id) && !starredIds.has(b.id)) return -1;
            if (!starredIds.has(a.id) && starredIds.has(b.id)) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [bookings, searchTerm, statusFilter, typeFilter, dateRange, starredIds]);

    const stats = useMemo(() => ({
        total: bookings.length,
        revenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
    }), [bookings]);



    // -- HANDLERS --
    const toggleStar = (id: string, e: any) => {
        e.stopPropagation();
        const newSet = new Set(starredIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setStarredIds(newSet);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    };

    const isUrgent = (dateStr: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        const diff = differenceInDays(date, today);
        return diff >= 0 && diff <= 2;
    };

    const kanbanColumns = {
        pending: filteredBookings.filter(b => b.status === 'pending'),
        confirmed: filteredBookings.filter(b => b.status === 'confirmed'),
        cancelled: filteredBookings.filter(b => b.status === 'cancelled')
    };

    return (
        <>

            {/* DEMO ALERT */}
            {isUsingMock && (
                <Alert className="mb-6 bg-blue-900/20 border-blue-900/50 text-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Demo Mode Active</AlertTitle>
                    <AlertDescription>
                        No real bookings found in database. Showing 5 sample bookings to demonstrate features.
                    </AlertDescription>
                </Alert>
            )}

            {/* 1. ADVANCED KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Card className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-blue-900/30">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-200/50 text-xs font-bold uppercase tracking-wider">Revenue</p>
                                <h3 className="text-2xl font-bold text-white">₹{stats.revenue.toLocaleString()}</h3>
                            </div>
                            <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">+{isUsingMock ? '12.5' : '0'}%</Badge>
                        </div>
                        <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: '70%' }}></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#111] border-[#2A2A2A]">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase">Total Bookings</p>
                            <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                        </div>
                        <div className="h-10 w-10 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-[#333]">
                            <LayoutGrid className="w-5 h-5 text-gray-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#111] border-[#2A2A2A]">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-emerald-500/70 text-xs font-bold uppercase">Confirmed</p>
                            <h3 className="text-2xl font-bold text-white">{stats.confirmed}</h3>
                        </div>
                        <div className="h-10 w-10 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-[#333]">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#111] border-[#2A2A2A]">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-amber-500/70 text-xs font-bold uppercase">Pending</p>
                            <h3 className="text-2xl font-bold text-white">{stats.pending}</h3>
                        </div>
                        <div className="h-10 w-10 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-[#333]">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. MAIN TOOLBAR */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-4 bg-[#111] p-2 rounded-lg border border-[#222]">
                <div className="flex items-center gap-2 w-full xl:w-auto">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                        <TabsList className="bg-[#1A1A1A] border border-[#333]">
                            <TabsTrigger value="list"><List className="w-4 h-4 mr-2" /> List</TabsTrigger>
                            <TabsTrigger value="kanban"><LayoutGrid className="w-4 h-4 mr-2" /> Board</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="h-8 w-px bg-[#333] mx-2 hidden xl:block"></div>
                    <div className="relative flex-1 xl:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cmd+K to search..."
                            className="pl-9 bg-[#000] border-[#333] text-sm h-9"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto px-1">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[110px] h-9 bg-[#1A1A1A] border-[#333] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#333]"><SelectItem value="all">Status: All</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="pending">Pending</SelectItem></SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[110px] h-9 bg-[#1A1A1A] border-[#333] text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#333]"><SelectItem value="all">Type: All</SelectItem><SelectItem value="stay">Stays</SelectItem><SelectItem value="package">Packages</SelectItem></SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-3 bg-[#1A1A1A] border-[#333] text-gray-300">
                                <Calendar className="w-3.5 h-3.5 mr-2" />
                                {dateRange?.from ? "Filtered" : "Dates"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#111] border-[#333]" align="end">
                            <CalendarComponent mode="range" selected={dateRange} onSelect={setDateRange} className="bg-[#111] text-white" numberOfMonths={2} />
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 w-9 px-0 bg-[#1A1A1A] border-[#333]"><Settings className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#333] text-gray-300">
                            <DropdownMenuLabel>View Settings</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#333]" />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="cursor-pointer hover:bg-[#252525]">Density</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="bg-[#1A1A1A] border-[#333] text-gray-300">
                                    <DropdownMenuItem onClick={() => setDensity('compact')} className="hover:bg-[#252525]">Compact</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDensity('normal')} className="hover:bg-[#252525]">Comfortable</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="cursor-pointer hover:bg-[#252525]">Columns</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="bg-[#1A1A1A] border-[#333] text-gray-300">
                                    <DropdownMenuCheckboxItem checked={visibleColumns.customer} onCheckedChange={(b) => setVisibleColumns(p => ({ ...p, customer: b }))} className="hover:bg-[#252525]">Customer</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={visibleColumns.dates} onCheckedChange={(b) => setVisibleColumns(p => ({ ...p, dates: b }))} className="hover:bg-[#252525]">Dates</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={visibleColumns.amount} onCheckedChange={(b) => setVisibleColumns(p => ({ ...p, amount: b }))} className="hover:bg-[#252525]">Amount</DropdownMenuCheckboxItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" className="h-9 bg-[#1A1A1A] border-[#333] text-gray-300 hover:bg-[#222]"
                        onClick={() => {
                            const csv = [["ID", "Name", "Total"]].concat(filteredBookings.map(b => [b.id, b.customer_name, b.amount]));
                            const blob = new Blob([csv.map(e => e.join(",")).join("\n")], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
                        }}
                    >
                        <Download className="w-3.5 h-3.5 mr-2" /> Export
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Booking
                    </Button>
                </div>
            </div>

            {/* 4. CONTENT AREA */}
            {viewMode === 'list' ? (
                <DataGrid
                    title="All Bookings"
                    data={filteredBookings}
                    icon={<Calendar className="w-5 h-5" />}
                    columns={[
                        { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-xs text-gray-400">#{row.id.slice(0, 8)}</span> },
                        { key: 'customer', label: 'Customer', render: (row) => <div><div className="font-medium text-white">{row.customer_name}</div><div className="text-xs text-gray-500">{row.customer_email}</div></div> },
                        { key: 'display_title', label: 'Booking Details', render: (row) => <div><div className="text-sm text-gray-300">{row.display_title || 'N/A'}</div><Badge variant="outline" className="text-[10px] mt-1">{row.type}</Badge></div> },
                        { key: 'check_in_date', label: 'Check-In', render: (row) => <div className="text-xs text-gray-400">{row.check_in_date ? format(new Date(row.check_in_date), 'PPP') : 'N/A'}</div> },
                        { key: 'amount', label: 'Amount', sortable: true, render: (row) => <span className="font-mono text-emerald-400">₹{row.amount?.toLocaleString()}</span> },
                        { key: 'status', label: 'Status', render: (row) => <NeonStatusBadge status={row.status} /> }
                    ]}
                    actions={(row) => (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-400" onClick={() => window.open(`https://wa.me/${row.customer_phone?.replace(/\D/g, '')}`, '_blank')}><div className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center text-[8px] font-bold">W</div></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400" onClick={() => { setSelectedBookingForDetail(row); setIsDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400" onClick={() => { setSelectedBookingForVoucher(row); setIsVoucherOpen(true); }}><Printer className="w-4 h-4" /></Button>
                        </div>
                    )}
                    onExport={() => {
                        const csv = [["ID", "Name", "Total"]].concat(filteredBookings.map(b => [b.id, b.customer_name, b.amount]));
                        const blob = new Blob([csv.map(e => e.join(",")).join("\n")], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
                    }}
                />



            ) : (
                /* KANBAN VIEW */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto min-h-[500px]">
                    {Object.entries(kanbanColumns).map(([status, items]) => (
                        <div key={status} className="bg-[#111] border border-[#222] rounded-lg p-3 flex flex-col gap-3 min-w-[300px]">
                            <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                                <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status === 'confirmed' ? 'bg-green-500' : status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                    {status}
                                </h4>
                                <Badge variant="secondary" className="bg-[#222] text-gray-400">{items.length}</Badge>
                            </div>
                            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                                {items.map(b => (
                                    <Card key={b.id} className="bg-[#1A1A1A] border-[#333] hover:border-blue-700/50 cursor-move group transition-all">
                                        <CardContent className="p-3 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="text-[10px] border-[#333] text-gray-400">{b.type}</Badge>
                                                <Button variant="ghost" size="icon" className="h-4 w-4 text-gray-600 hover:text-white" onClick={() => { setSelectedBookingForDetail(b); setIsDetailOpen(true) }}><Maximize2 className="w-3 h-3" /></Button>
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium text-white truncate">{b.customer_name}</h5>
                                                <p className="text-xs text-gray-500 truncate">{b.display_title}</p>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-[#252525] mt-1">
                                                <span className="text-xs font-mono text-gray-400">{format(new Date(b.date), 'MMM dd')}</span>
                                                <span className="text-sm font-bold text-blue-400">₹{b.amount.toLocaleString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {items.length === 0 && <div className="text-center py-10 text-gray-600 text-xs italic">No bookings</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}



            <VoucherGenerator booking={selectedBookingForVoucher} isOpen={isVoucherOpen} onClose={() => { setIsVoucherOpen(false); setSelectedBookingForVoucher(null); }} />
            <BookingDetailSheet booking={selectedBookingForDetail} isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setSelectedBookingForDetail(null); }} onUpdate={refetch} />
            <CreateBookingDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </>
    );
}
