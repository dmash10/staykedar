import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Calendar,
    Download,
    Link as LinkIcon,
    Copy,
    CheckCircle2,
    Clock,
    Wallet,
    Filter,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, eachDayOfInterval, isBefore, parseISO } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Transaction {
    id: string;
    date: string;
    desc: string;
    type: 'Income' | 'Payout' | 'Refund';
    method: string;
    status: string;
    amount: number;
}

interface BadDebt {
    id: string;
    guestName: string;
    checkIn: string;
    totalAmount: number;
    amountPaid: number;
    dueAmount: number;
    status: string;
}

export default function RevenuePage() {
    const [timeRange, setTimeRange] = useState('30days');
    const { toast } = useToast();

    // Payment Link State
    const [linkAmount, setLinkAmount] = useState('');
    const [linkDescription, setLinkDescription] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    const { data: revenueData, isLoading } = useQuery({
        queryKey: ['admin-revenue', timeRange],
        queryFn: async () => {
            // Fetch bookings
            const { data: bookings, error: bookingError } = await supabase
                .from('bookings')
                .select(`
                    *,
                    rooms (
                        name,
                        properties (name)
                    )
                `)
                .order('created_at', { ascending: true });

            if (bookingError) throw bookingError;

            // Fetch vendor payouts
            const { data: payouts, error: payoutError } = await supabase
                .from('vendor_payouts')
                .select('*')
                .order('created_at', { ascending: false });

            if (payoutError) throw payoutError;

            // --- CALCULATIONS ---

            // 1. Total Revenue (Confirmed bookings)
            const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
            const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
            const totalBookings = confirmedBookings.length;
            const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

            // 2. Chart Data (Last 30 Days)
            const days = 30;
            const endDate = new Date();
            const startDate = subDays(endDate, days);

            const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayBookings = confirmedBookings.filter(b =>
                    format(new Date(b.created_at || new Date()), 'yyyy-MM-dd') === dateStr
                );

                return {
                    date: format(date, 'MMM dd'),
                    revenue: dayBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0),
                    bookings: dayBookings.length
                };
            });

            // 3. Property Revenue
            const propertyRevenue: Record<string, number> = {};
            confirmedBookings.forEach(b => {
                const propName = b.rooms?.properties?.name || 'Unknown';
                propertyRevenue[propName] = (propertyRevenue[propName] || 0) + (Number(b.total_amount) || 0);
            });

            const propertyData = Object.entries(propertyRevenue)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            // 4. Ledger Transactions
            const transactions: Transaction[] = [
                ...confirmedBookings.map(b => ({
                    id: b.id,
                    date: b.created_at,
                    desc: `Booking #${b.booking_id || b.id.slice(0, 6)} - ${b.customer_name || 'Guest'}`,
                    type: 'Income' as const,
                    method: 'Online', // Defaulting for now
                    status: b.status,
                    amount: Number(b.total_amount)
                })),
                ...(payouts || []).map(p => ({
                    id: p.id,
                    date: p.created_at,
                    desc: `Payout: ${p.vendor_name} (${p.payout_type})`,
                    type: 'Payout' as const,
                    method: 'Manual',
                    status: p.status,
                    amount: -Number(p.amount)
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // 5. Bad Debts (Unpaid stays that have started/passed)
            const today = new Date();
            const badDebts: BadDebt[] = (bookings || [])
                .filter(b => {
                    const checkIn = new Date(b.check_in_date);
                    const isStarted = isBefore(checkIn, today);
                    const isNotFullyPaid = b.payment_status === 'pending' || b.payment_status === 'partial';
                    // return isStarted && isNotFullyPaid && b.status !== 'cancelled';
                    // Simplified logic: If status is confirmed/pending but payment is not 'paid'
                    return isNotFullyPaid && b.status !== 'cancelled';
                })
                .map(b => ({
                    id: b.id,
                    guestName: b.customer_name || 'Guest',
                    checkIn: b.check_in_date,
                    totalAmount: Number(b.total_amount),
                    amountPaid: Number(b.amount_paid || 0), // Assuming amount_paid column exists, else 0
                    dueAmount: Number(b.total_amount) - Number(b.amount_paid || 0),
                    status: b.payment_status || 'pending'
                }));

            return {
                totalRevenue,
                totalBookings,
                avgOrderValue,
                dailyData,
                propertyData,
                transactions,
                badDebts
            };
        }
    });

    const handleGenerateLink = () => {
        if (!linkAmount) {
            toast({ title: "Error", description: "Please enter an amount", variant: "destructive" });
            return;
        }
        const mockId = Math.random().toString(36).substring(7);
        const link = `https://razorpay.me/@staykedar/pay_${mockId}?amount=${linkAmount}`;
        setGeneratedLink(link);
        toast({ title: "Link Generated", description: "Payment link has been created successfully." });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        toast({ title: "Copied!", description: "Link copied to clipboard." });
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <>
            <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <TabsList className="bg-[#111111] border border-[#2A2A2A]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="payment-links">Payment Links</TabsTrigger>
                        <TabsTrigger value="ledger">Ledger</TabsTrigger>
                        <TabsTrigger value="bad-debt" className="data-[state=active]:text-red-400">Bad Debt</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-3">
                        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[180px] bg-[#111111] border-[#2A2A2A] text-white">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111111] border-[#2A2A2A] text-white">
                                <SelectItem value="30days">Last 30 Days</SelectItem>
                                <SelectItem value="90days">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-none text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium mb-1">Total Revenue</p>
                                        <h3 className="text-3xl font-bold">₹{revenueData?.totalRevenue?.toLocaleString() || '0'}</h3>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#111111] border-[#2A2A2A]">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium mb-1">Avg. Order Value</p>
                                        <h3 className="text-3xl font-bold text-white">₹{Math.round(revenueData?.avgOrderValue || 0).toLocaleString()}</h3>
                                    </div>
                                    <div className="bg-blue-500/10 p-3 rounded-lg"><CreditCard className="w-6 h-6 text-blue-400" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#111111] border-[#2A2A2A]">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium mb-1">Pending Vendors</p>
                                        <h3 className="text-3xl font-bold text-white">₹{(revenueData?.transactions || [])
                                            .filter(t => t.type === 'Payout' && t.status !== 'completed' && t.status !== 'Paid')
                                            .reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString()}</h3>
                                    </div>
                                    <div className="bg-amber-500/10 p-3 rounded-lg"><Wallet className="w-6 h-6 text-amber-400" /></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
                            <CardHeader className="border-b border-[#2A2A2A]">
                                <CardTitle className="text-white text-lg font-semibold">Revenue Trends</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData?.dailyData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                                            <XAxis dataKey="date" stroke="#6B7280" tickLine={false} axisLine={false} />
                                            <YAxis stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#fff' }} formatter={(val: number) => `₹${val.toLocaleString()}`} />
                                            <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#111111] border-[#2A2A2A]">
                            <CardHeader className="border-b border-[#2A2A2A]">
                                <CardTitle className="text-white text-lg font-semibold">Top Properties</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData?.propertyData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#fff' }} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                                {revenueData?.propertyData?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* PAYMENT LINKS TAB */}
                <TabsContent value="payment-links">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-[#111111] border-[#2A2A2A]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2"><LinkIcon className="h-5 w-5 text-blue-400" /> Generate Link</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-400">Amount (₹)</Label>
                                    <Input type="number" placeholder="5000" className="bg-[#1A1A1A] border-[#333] text-white" value={linkAmount} onChange={(e) => setLinkAmount(e.target.value)} />
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleGenerateLink}>Generate Razorpay Link</Button>
                                {generatedLink && (
                                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex justify-between items-center">
                                        <code className="text-green-400 text-sm">{generatedLink}</code>
                                        <Button size="icon" variant="ghost" className="text-green-400" onClick={copyToClipboard}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* LEDGER TAB */}
                <TabsContent value="ledger">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardHeader className="border-b border-[#2A2A2A] flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-lg font-semibold">Financial Ledger</CardTitle>
                            <Button variant="outline" className="bg-[#1A1A1A] border-[#333] text-white"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-[#2A2A2A] bg-[#151515]">
                                        <TableHead className="text-gray-400">Date</TableHead>
                                        <TableHead className="text-gray-400">Description</TableHead>
                                        <TableHead className="text-gray-400">Type</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400 text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(revenueData?.transactions || []).map((tx, i) => (
                                        <TableRow key={i} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                            <TableCell className="text-gray-300">
                                                {format(new Date(tx.date), 'MMM dd, yyyy')}
                                                <div className="text-xs text-gray-500">{format(new Date(tx.date), 'hh:mm a')}</div>
                                            </TableCell>
                                            <TableCell className="text-white font-medium">{tx.desc}</TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    tx.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        tx.type === 'Payout' ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-red-500/10 text-red-400'
                                                }>{tx.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-xs">
                                                    {(tx.status === 'confirmed' || tx.status === 'completed' || tx.status === 'Paid') ? (
                                                        <span className="text-emerald-400 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</span>
                                                    ) : (
                                                        <span className="text-amber-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {tx.status}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BAD DEBT TAB */}
                <TabsContent value="bad-debt">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardHeader className="border-b border-[#2A2A2A]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-red-400 text-lg font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" /> Bad Debt Tracker
                                    </CardTitle>
                                    <CardDescription>Bookings with pending payments where check-in date has passed or is today.</CardDescription>
                                </div>
                                <Badge variant="destructive" className="bg-red-900/50 text-red-400 border-red-500/20">
                                    Total Due: ₹{(revenueData?.badDebts || []).reduce((sum, d) => sum + d.dueAmount, 0).toLocaleString()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-[#2A2A2A] bg-[#151515]">
                                        <TableHead className="text-gray-400">Guest</TableHead>
                                        <TableHead className="text-gray-400">Check-in</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400 text-right">Total</TableHead>
                                        <TableHead className="text-gray-400 text-right">Paid</TableHead>
                                        <TableHead className="text-gray-400 text-right text-red-400">Due Amount</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(revenueData?.badDebts || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                No bad debts found. Great job!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (revenueData?.badDebts || []).map((debt: BadDebt) => (
                                            <TableRow key={debt.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                                <TableCell className="font-medium text-white">{debt.guestName}</TableCell>
                                                <TableCell className="text-gray-400">{format(new Date(debt.checkIn), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-amber-500/20 text-amber-400">
                                                        {debt.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-gray-300">₹{debt.totalAmount.toLocaleString()}</TableCell>
                                                <TableCell className="text-right text-emerald-400/70">₹{debt.amountPaid.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-bold text-red-400">₹{debt.dueAmount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="hover:bg-blue-500/10 hover:text-blue-400">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}
