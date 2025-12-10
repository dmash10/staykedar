import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Wallet,
    Search,
    Filter,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Loader2,
    TrendingUp,
    BanknoteIcon,
    PiggyBank,
    Send
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Textarea } from '@/components/ui/textarea';

// Platform commission rate
const PLATFORM_COMMISSION = 0.20; // 20%

export default function PaymentSettlementPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [periodFilter, setPeriodFilter] = useState<string>('all_time');
    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState<string>('');
    const [payoutNotes, setPayoutNotes] = useState('');

    // Fetch comprehensive data
    const { data: settlementData, isLoading } = useQuery({
        queryKey: ['admin-settlements-real', periodFilter],
        queryFn: async () => {
            // 1. Fetch all confirmed revenue (Bookings)
            const { data: bookings, error: bookError } = await supabase
                .from('package_bookings')
                .select('amount, package_id, packages(title, id), created_at')
                .in('status', ['paid', 'confirmed', 'completed']);

            if (bookError) throw bookError;

            // 2. Fetch all payouts (Expenses)
            const { data: payouts, error: payoutError } = await supabase
                .from('vendor_payouts')
                .select('*');

            if (payoutError) throw payoutError;

            // 3. Aggregate data by Entity (Package/Property)
            // Note: Ideally we link to a 'vendors' or 'properties' table, but using package_id as proxy for now
            const entityMap: Record<string, any> = {};

            // Process Revenue
            bookings?.forEach(b => {
                const id = b.package_id || 'unknown';
                const name = b.packages?.title || 'Unknown Asset';

                if (!entityMap[id]) {
                    entityMap[id] = {
                        id,
                        name,
                        totalRevenue: 0,
                        hostShareTotal: 0,
                        paidToDate: 0,
                        bookingsCount: 0,
                        lastTransaction: b.created_at
                    };
                }

                const amount = Number(b.amount || 0);
                entityMap[id].totalRevenue += amount;
                entityMap[id].hostShareTotal += (amount * (1 - PLATFORM_COMMISSION)); // 80%
                entityMap[id].bookingsCount++;
            });

            // Process Payouts
            // We need to match payouts to entities. 
            // Assumption: vendor_payouts.reference_id might store package_id or property_id
            // For now, we attempt to match by ID.

            payouts?.forEach(p => {
                const id = p.reference_id || 'general';

                // If we found the entity in bookings
                if (entityMap[id]) {
                    entityMap[id].paidToDate += Number(p.amount || 0);
                } else {
                    // If payout exists but no bookings (or different ID), handle gracefully if possible
                    // Currently skipping or could add to a 'General Expenses' bucket
                }
            });

            // Calculate Balance
            return Object.values(entityMap).map(e => ({
                ...e,
                balanceDue: e.hostShareTotal - e.paidToDate
            })).sort((a, b) => b.balanceDue - a.balanceDue);
        }
    });

    const totals = {
        grossRevenue: settlementData?.reduce((acc, curr) => acc + curr.totalRevenue, 0) || 0,
        hostShare: settlementData?.reduce((acc, curr) => acc + curr.hostShareTotal, 0) || 0,
        paidOut: settlementData?.reduce((acc, curr) => acc + curr.paidToDate, 0) || 0,
        balanceOpen: settlementData?.reduce((acc, curr) => acc + (curr.balanceDue > 0 ? curr.balanceDue : 0), 0) || 0,
    };

    // Chart Data
    const pieData = [
        { name: 'Platform (20%)', value: totals.grossRevenue * 0.20, fill: '#3b82f6' },
        { name: 'Host Paid', value: totals.paidOut, fill: '#10b981' },
        { name: 'Host Pending', value: totals.balanceOpen, fill: '#f59e0b' }
    ];

    const handlePayout = (entity: any) => {
        setSelectedEntity(entity);
        setPayoutAmount(Math.round(entity.balanceDue).toString());
        setPayoutDialogOpen(true);
    };

    const payoutMutation = useMutation({
        mutationFn: async () => {
            if (!selectedEntity || !payoutAmount) return;

            const { error } = await supabase.from('vendor_payouts').insert({
                vendor_name: selectedEntity.name,
                amount: Number(payoutAmount),
                payout_type: 'other', // Default
                status: 'completed',
                reference_id: selectedEntity.id,
                notes: payoutNotes || 'Settlement via Admin Panel'
            });

            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: "Payout Recorded", description: "Ledger updated successfully." });
            setPayoutDialogOpen(false);
            setPayoutAmount('');
            setPayoutNotes('');
            queryClient.invalidateQueries({ queryKey: ['admin-settlements-real'] });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const filteredData = settlementData?.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ? true :
                statusFilter === 'pending' ? item.balanceDue > 100 :
                    item.balanceDue <= 100;
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="space-y-6">

                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/30">
                        <CardContent className="p-4 pt-6">
                            <p className="text-indigo-300 text-xs uppercase font-bold tracking-wider">Total Revenue (Gross)</p>
                            <p className="text-2xl font-bold text-white mt-1">₹{totals.grossRevenue.toLocaleString()}</p>
                            <div className="mt-2 text-xs text-indigo-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> All bookings
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4 pt-6">
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Host Share (80%)</p>
                            <p className="text-2xl font-bold text-white mt-1">₹{Math.round(totals.hostShare).toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-2">Target payout</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4 pt-6">
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Actually Paid</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">₹{Math.round(totals.paidOut).toLocaleString()}</p>
                            <div className="mt-2 text-xs text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Disbursed
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-950/20 border-amber-500/20">
                        <CardContent className="p-4 pt-6">
                            <p className="text-amber-500 text-xs uppercase font-bold tracking-wider">Balance Due</p>
                            <p className="text-2xl font-bold text-amber-400 mt-1">₹{Math.round(totals.balanceOpen).toLocaleString()}</p>
                            <div className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Needs Attention
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-gray-200">Payment Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                            itemStyle={{ color: '#f3f4f6' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 text-xs mt-2">
                                <div className="flex items-center gap-1 text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Platform
                                </div>
                                <div className="flex items-center gap-1 text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Paid
                                </div>
                                <div className="flex items-center gap-1 text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div> Due
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-2 space-y-4">
                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#111111] p-4 rounded-xl border border-[#2A2A2A]">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        placeholder="Search hosts or packages..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                        <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                        <SelectItem value="all">All Vendors</SelectItem>
                                        <SelectItem value="pending">Pending Only</SelectItem>
                                        <SelectItem value="settled">Settled Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" className="border-[#2A2A2A] text-gray-400 hover:text-white" onClick={() => exportToCSV(filteredData)}>
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Ledger Table */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Partner Ledger</CardTitle>
                        <CardDescription>Real-time calculation of revenue vs payouts per entity.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                    <TableHead className="text-gray-400">Partner / Entity</TableHead>
                                    <TableHead className="text-gray-400 text-right">Revenue Generated</TableHead>
                                    <TableHead className="text-gray-400 text-right">Host Share (80%)</TableHead>
                                    <TableHead className="text-gray-400 text-right">Paid to Date</TableHead>
                                    <TableHead className="text-gray-400 text-right">Balance Due</TableHead>
                                    <TableHead className="text-gray-400 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredData?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                            No records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData?.map((item) => (
                                        <TableRow key={item.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                            <TableCell>
                                                <div>
                                                    <p className="text-white font-medium">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.bookingsCount} bookings</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-gray-300">
                                                ₹{item.totalRevenue.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-indigo-300">
                                                ₹{Math.round(item.hostShareTotal).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-400 font-medium">
                                                ₹{Math.round(item.paidToDate).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={item.balanceDue > 100
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono"
                                                    : "bg-green-500/10 text-green-400 border-green-500/30 font-mono"}>
                                                    ₹{Math.round(item.balanceDue).toLocaleString()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.balanceDue > 100 ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePayout(item)}
                                                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        Pay
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-green-500 flex items-center justify-end gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Settled
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Payout Dialog */}
                <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
                    <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white">
                        <DialogHeader>
                            <DialogTitle>Record Payout</DialogTitle>
                            <DialogDescription>
                                Mark a payment as sent to <b>{selectedEntity?.name}</b>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">Current Balance Due</p>
                                <p className="text-2xl font-bold text-amber-400">₹{Math.round(selectedEntity?.balanceDue || 0).toLocaleString()}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Amount Paid (₹)</label>
                                <Input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={e => setPayoutAmount(e.target.value)}
                                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Notes / Transaction ID</label>
                                <Textarea
                                    value={payoutNotes}
                                    onChange={e => setPayoutNotes(e.target.value)}
                                    placeholder="e.g. UPI Ref 123456"
                                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white resize-none h-20"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setPayoutDialogOpen(false)} className="text-gray-400">Cancel</Button>
                            <Button
                                onClick={() => payoutMutation.mutate()}
                                disabled={payoutMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {payoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payout'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );

    function exportToCSV(data: any[]) {
        const headers = ['Partner', 'Revenue', 'Host Share', 'Paid', 'Balance'];
        const rows = data.map(d => [d.name, d.totalRevenue, d.hostShareTotal, d.paidToDate, d.balanceDue]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "settlements.csv");
        document.body.appendChild(link);
        link.click();
    }
}
