import { useState, useMemo } from 'react';
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
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Building2,
    Package,
    Search,
    Filter,
    Download,
    RefreshCw,
    Loader2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    Calendar,
    Wallet,
    PieChart as PieChartIcon,
    Receipt
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

// Status configuration
const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    collected: { label: 'Collected', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    processing: { label: 'Processing', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    settled: { label: 'Settled', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    disputed: { label: 'Disputed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function CommissionsDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('30');
    const [settleDialogOpen, setSettleDialogOpen] = useState(false);
    const [selectedCommission, setSelectedCommission] = useState<any>(null);
    const [settlementRef, setSettlementRef] = useState('');
    const [settlementMethod, setSettlementMethod] = useState('bank_transfer');

    // Calculate date range
    const dateStart = useMemo(() => {
        if (dateRange === 'this_month') return startOfMonth(new Date());
        if (dateRange === 'last_month') return startOfMonth(subDays(new Date(), 30));
        return subDays(new Date(), parseInt(dateRange));
    }, [dateRange]);

    // Fetch commissions
    const { data: commissions, isLoading, refetch } = useQuery({
        queryKey: ['admin-commissions', dateRange, statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('commissions')
                .select(`
          *,
          package_bookings (
            id,
            customer_name,
            customer_email,
            customer_phone
          )
        `)
                .gte('created_at', dateStart.toISOString())
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        staleTime: 30000,
    });

    // Filter commissions
    const filteredCommissions = commissions?.filter(c => {
        if (searchQuery === '') return true;
        const bookingName = c.package_bookings?.customer_name?.toLowerCase() || '';
        const bookingEmail = c.package_bookings?.customer_email?.toLowerCase() || '';
        return bookingName.includes(searchQuery.toLowerCase()) ||
            bookingEmail.includes(searchQuery.toLowerCase()) ||
            c.razorpay_payment_id?.includes(searchQuery);
    }) || [];

    // Calculate stats
    const stats = useMemo(() => {
        if (!commissions) return null;

        const totalGross = commissions.reduce((sum, c) => sum + (c.gross_amount || 0), 0);
        const totalCommission = commissions.reduce((sum, c) => sum + (c.platform_commission || 0), 0);
        const totalNetCommission = commissions.reduce((sum, c) => sum + (c.net_commission || 0), 0);
        const totalHostShare = commissions.reduce((sum, c) => sum + (c.host_share || 0), 0);
        const pendingSettlement = commissions
            .filter(c => c.status !== 'settled')
            .reduce((sum, c) => sum + (c.host_share || 0), 0);
        const settledAmount = commissions
            .filter(c => c.status === 'settled')
            .reduce((sum, c) => sum + (c.host_share || 0), 0);

        // Revenue split for pie chart
        const revenueSplit = [
            { name: 'Platform Commission', value: totalCommission },
            { name: 'GST (18%)', value: totalCommission - totalNetCommission },
            { name: 'Host Share', value: totalHostShare },
        ];

        return {
            totalGross,
            totalCommission,
            totalNetCommission,
            totalHostShare,
            pendingSettlement,
            settledAmount,
            revenueSplit,
            count: commissions.length,
        };
    }, [commissions]);

    // Mark as settled mutation
    const settleMutation = useMutation({
        mutationFn: async () => {
            if (!selectedCommission) return;

            const { error } = await supabase
                .from('commissions')
                .update({
                    status: 'settled',
                    settlement_reference: settlementRef,
                    settlement_method: settlementMethod,
                    settled_to_host_at: new Date().toISOString(),
                })
                .eq('id', selectedCommission.id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'Settlement Recorded', description: 'Host payment marked as settled.' });
            setSettleDialogOpen(false);
            setSelectedCommission(null);
            setSettlementRef('');
            queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to update settlement status.', variant: 'destructive' });
        },
    });

    // Export CSV
    const exportCSV = () => {
        if (!filteredCommissions.length) return;

        const headers = ['Date', 'Customer', 'Gross Amount', 'Commission', 'Net Commission', 'Host Share', 'Status', 'Razorpay ID'];
        const rows = filteredCommissions.map(c => [
            format(parseISO(c.created_at), 'yyyy-MM-dd HH:mm'),
            c.package_bookings?.customer_name || 'N/A',
            c.gross_amount,
            c.platform_commission,
            c.net_commission,
            c.host_share,
            c.status,
            c.razorpay_payment_id || 'N/A',
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-transparent">
                        <CardContent className="p-5">
                            <p className="text-blue-200 text-xs uppercase font-semibold">Total Collected</p>
                            <p className="text-3xl font-bold text-white mt-1">
                                ₹{(stats?.totalGross || 0).toLocaleString()}
                            </p>
                            <p className="text-blue-200 text-sm mt-2">{stats?.count || 0} bookings</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-600 to-green-700 border-transparent">
                        <CardContent className="p-5">
                            <p className="text-green-200 text-xs uppercase font-semibold">Platform Commission</p>
                            <p className="text-3xl font-bold text-white mt-1">
                                ₹{(stats?.totalNetCommission || 0).toLocaleString()}
                            </p>
                            <p className="text-green-200 text-sm mt-2">After GST deduction</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-transparent">
                        <CardContent className="p-5">
                            <p className="text-orange-200 text-xs uppercase font-semibold">Pending Settlement</p>
                            <p className="text-3xl font-bold text-white mt-1">
                                ₹{(stats?.pendingSettlement || 0).toLocaleString()}
                            </p>
                            <p className="text-orange-200 text-sm mt-2">Due to hosts</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-transparent">
                        <CardContent className="p-5">
                            <p className="text-purple-200 text-xs uppercase font-semibold">Settled to Hosts</p>
                            <p className="text-3xl font-bold text-white mt-1">
                                ₹{(stats?.settledAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-purple-200 text-sm mt-2">All time</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Split Chart + Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Split */}
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-blue-400" />
                                Revenue Split
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={stats?.revenueSplit || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {(stats?.revenueSplit || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px' }}
                                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {stats?.revenueSplit?.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                            <span className="text-gray-400">{item.name}</span>
                                        </div>
                                        <span className="text-white font-medium">₹{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        placeholder="Search by name, email, or payment ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                    />
                                </div>
                                <Select value={dateRange} onValueChange={setDateRange}>
                                    <SelectTrigger className="w-full md:w-[150px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                        <SelectItem value="7">Last 7 Days</SelectItem>
                                        <SelectItem value="30">Last 30 Days</SelectItem>
                                        <SelectItem value="90">Last 90 Days</SelectItem>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[150px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="collected">Collected</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="settled">Settled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    onClick={exportCSV}
                                    className="border-[#2A2A2A] text-gray-400 hover:text-white"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Commissions Table */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A]">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-green-400" />
                                    Commission Records
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    Track platform earnings and host settlements
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="border-[#2A2A2A] text-gray-400 hover:text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                            </div>
                        ) : filteredCommissions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No commission records found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                            <TableHead className="text-gray-400">Date</TableHead>
                                            <TableHead className="text-gray-400">Customer</TableHead>
                                            <TableHead className="text-gray-400 text-right">Gross</TableHead>
                                            <TableHead className="text-gray-400 text-right">Commission</TableHead>
                                            <TableHead className="text-gray-400 text-right">Host Share</TableHead>
                                            <TableHead className="text-gray-400">Status</TableHead>
                                            <TableHead className="text-gray-400 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCommissions.map((commission) => {
                                            const statusConfig = STATUS_CONFIG[commission.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                                            return (
                                                <TableRow key={commission.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                                    <TableCell>
                                                        <p className="text-white text-sm">
                                                            {format(parseISO(commission.created_at), 'MMM dd, yyyy')}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            {format(parseISO(commission.created_at), 'HH:mm')}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-white font-medium text-sm">
                                                            {commission.package_bookings?.customer_name || 'N/A'}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            {commission.razorpay_payment_id?.slice(0, 18) || 'No payment ID'}...
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <p className="text-white font-semibold">
                                                            ₹{commission.gross_amount?.toLocaleString()}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <p className="text-green-400 font-semibold">
                                                            ₹{commission.net_commission?.toLocaleString()}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            {commission.commission_rate}% - GST
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <p className="text-blue-400 font-semibold">
                                                            ₹{commission.host_share?.toLocaleString()}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {commission.status !== 'settled' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCommission(commission);
                                                                    setSettleDialogOpen(true);
                                                                }}
                                                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                Settle
                                                            </Button>
                                                        )}
                                                        {commission.status === 'settled' && (
                                                            <span className="text-green-400 text-xs flex items-center gap-1 justify-end">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Settled
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* Settle Dialog */}
            <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
                <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-400" />
                            Mark Settlement
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Record host payment for ₹{selectedCommission?.host_share?.toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Settlement Method</label>
                            <Select value={settlementMethod} onValueChange={setSettlementMethod}>
                                <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Reference Number (Optional)</label>
                            <Input
                                placeholder="Transaction ID or reference..."
                                value={settlementRef}
                                onChange={(e) => setSettlementRef(e.target.value)}
                                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSettleDialogOpen(false)}
                            className="border-[#2A2A2A] text-gray-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => settleMutation.mutate()}
                            disabled={settleMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {settleMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            Confirm Settlement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
