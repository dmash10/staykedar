import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    RotateCcw,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    IndianRupee,
    Calendar,
    User,
    MessageSquare,
    ArrowUpRight,
    Loader2,
    RefreshCw,
    Wallet
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, differenceInHours } from 'date-fns';

// Refund Policy Tiers
const REFUND_POLICY = {
    moreThan48Hours: { percent: 100, label: 'Full Refund (48h+ before)' },
    between24And48Hours: { percent: 50, label: 'Partial Refund (24-48h)' },
    lessThan24Hours: { percent: 0, label: 'No Refund (<24h)' },
};

const STATUS_CONFIG: Record<string, any> = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Pending Review' },
    approved: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Approved' },
    processing: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Processing' },
    completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', label: 'Completed' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Rejected' },
    refund_completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', label: 'Refunded (Wallet)' },
};

const CANCELLATION_REASONS = [
    'Change of travel plans',
    'Medical emergency',
    'Weather conditions',
    'Route closure',
    'Property issue',
    'Booking error',
    'Other',
];

export default function RefundDashboardPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [processDialogOpen, setProcessDialogOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [refundMethod, setRefundMethod] = useState<'wallet' | 'original'>('wallet');

    // Fetch refund requests (from package_bookings)
    const { data: refundRequests, isLoading } = useQuery({
        queryKey: ['admin-refund-requests', statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('package_bookings')
                .select('*, packages(name)')
                .in('status', ['cancelled', 'refund_requested', 'refund_approved', 'refund_processing', 'refund_completed', 'refund_rejected'])
                .order('updated_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            // Calculate refund amounts based on policy
            return (data || []).map(booking => {
                const checkIn = booking.check_in ? parseISO(booking.check_in) : null;
                const cancelledAt = booking.updated_at ? parseISO(booking.updated_at) : new Date();

                let refundPercent = 0;
                let refundTier = 'lessThan24Hours';

                if (checkIn) {
                    const hoursBeforeCheckIn = differenceInHours(checkIn, cancelledAt);
                    if (hoursBeforeCheckIn >= 48) {
                        refundPercent = REFUND_POLICY.moreThan48Hours.percent;
                        refundTier = 'moreThan48Hours';
                    } else if (hoursBeforeCheckIn >= 24) {
                        refundPercent = REFUND_POLICY.between24And48Hours.percent;
                        refundTier = 'between24And48Hours';
                    }
                }

                const refundAmount = Math.round((booking.amount || 0) * (refundPercent / 100));

                return {
                    ...booking,
                    refundPercent,
                    refundAmount,
                    refundTier,
                    refundStatus: booking.status?.includes('refund_')
                        ? booking.status.replace('refund_', '')
                        : booking.status
                };
            });
        },
        staleTime: 30000,
    });

    // Handle Approval logic
    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            if (refundMethod === 'wallet') {
                // Call RPC for Wallet Refund
                const { error } = await supabase.rpc('process_wallet_refund', {
                    p_booking_id: selectedRequest.id,
                    p_refund_amount: selectedRequest.refundAmount,
                    p_admin_notes: adminNotes || 'Refund via Admin Dashboard'
                });

                if (error) throw error;

                toast({
                    title: 'Refund Processed Successfuly',
                    description: `₹${selectedRequest.refundAmount} credited to user wallet.`,
                    className: 'bg-green-500 border-green-600 text-white',
                });
            } else {
                // Manual Original Payment Refund (Update status only)
                const { error } = await supabase
                    .from('package_bookings')
                    .update({
                        status: 'refund_approved',
                        updated_at: new Date().toISOString()
                        // In a real app, you'd trigger Razorpay refund API here or store a flag for manual processing
                    })
                    .eq('id', selectedRequest.id);

                if (error) throw error;

                toast({
                    title: 'Refund Approved',
                    description: 'Status updated. Please process the bank refund manually.',
                });
            }

            queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] });
            setProcessDialogOpen(false);
            setSelectedRequest(null);
            setAdminNotes('');
        } catch (error: any) {
            console.error('Refund Error:', error);
            toast({
                title: 'Error Processing Refund',
                description: error.message || 'Failed to update status',
                variant: 'destructive',
            });
        }
    };

    // Generic status update (Reject, Complete manually)
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('package_bookings')
                .update({ status: `refund_${status}`, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] });
            toast({ title: 'Status updated successfully' });
            setProcessDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    });


    const handleProcessRefund = (request: any) => {
        setSelectedRequest(request);
        setProcessDialogOpen(true);
    };

    // Filter requests
    const filteredRequests = refundRequests?.filter(req => {
        const matchesSearch = searchQuery === '' ||
            req.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (req.status === statusFilter) ||
            (req.refundStatus === statusFilter);
        return matchesSearch && matchesStatus;
    }) || [];

    // Stats
    const stats = {
        total: refundRequests?.length || 0,
        pending: refundRequests?.filter(r => r.refundStatus === 'pending' || r.refundStatus === 'requested').length || 0,
        completed: refundRequests?.filter(r => r.refundStatus === 'completed' || r.status === 'refund_completed').length || 0,
        totalAmount: refundRequests?.reduce((sum, r) => sum + (r.refundAmount || 0), 0) || 0,
    };

    const isProcessing = updateStatusMutation.isPending;

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Requests</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-yellow-500/10 border-yellow-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-yellow-400 uppercase font-semibold">Action Required</p>
                            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-green-400 uppercase font-semibold">Completed Refunds</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Refund Value</p>
                            <p className="text-2xl font-bold text-white mt-1">₹{stats.totalAmount.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search by name, email, or booking ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[200px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="refund_requested">Requested</SelectItem>
                                    <SelectItem value="refund_approved">Approved (Pending Bank)</SelectItem>
                                    <SelectItem value="refund_completed">Completed (Wallet/Bank)</SelectItem>
                                    <SelectItem value="refund_rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Refund Requests Table */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A] py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <RotateCcw className="w-5 h-5 text-orange-400" />
                                Refund Requests
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] })}
                                className="border-[#2A2A2A] text-gray-400 hover:text-white h-8"
                            >
                                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No refund requests matching filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                            <TableHead className="text-gray-400">Customer</TableHead>
                                            <TableHead className="text-gray-400">Booking / Amount</TableHead>
                                            <TableHead className="text-gray-400">Refund Eligible</TableHead>
                                            <TableHead className="text-gray-400">Status</TableHead>
                                            <TableHead className="text-gray-400 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRequests.map((request) => {
                                            const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                                            return (
                                                <TableRow key={request.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-white font-medium text-sm">{request.customer_name || 'Guest'}</p>
                                                            <p className="text-gray-500 text-xs">{request.customer_email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-white text-sm">{request.packages?.name}</p>
                                                            <p className="text-gray-500 text-xs">Paid: ₹{request.amount?.toLocaleString()}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <span className="text-green-400 font-medium">₹{request.refundAmount.toLocaleString()}</span>
                                                            <span className="text-gray-500 text-xs ml-2">({request.refundPercent}%)</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border}`}>
                                                            {config.label || request.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleProcessRefund(request)}
                                                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                        >
                                                            Manage
                                                        </Button>
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

            {/* Process Refund Dialog */}
            <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
                <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Process Refund</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Booking ID: {selectedRequest?.id?.slice(0, 8)}...
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 py-2">
                            {/* Amount Calculation */}
                            <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#2A2A2A] space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Booking Amount</span>
                                    <span className="text-white">₹{selectedRequest.amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Refund Policy ({selectedRequest.refundPercent}%)</span>
                                    <span className="text-green-400 font-medium">+ ₹{selectedRequest.refundAmount?.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-[#2A2A2A] my-2 pt-2 flex justify-between font-bold">
                                    <span className="text-white">Refund Total</span>
                                    <span className="text-green-500">₹{selectedRequest.refundAmount?.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Refund Method Selection */}
                            {(selectedRequest.status.includes('requested') || selectedRequest.status.includes('cancelled')) && (
                                <div className="space-y-3">
                                    <Label className="text-gray-300">Refund Method</Label>
                                    <RadioGroup value={refundMethod} onValueChange={(v: any) => setRefundMethod(v)} className="gap-3">
                                        <div className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer ${refundMethod === 'wallet' ? 'border-blue-500 bg-blue-500/10' : 'border-[#2A2A2A] hover:border-gray-700'}`}>
                                            <RadioGroupItem value="wallet" id="wallet" className="border-gray-500 text-blue-500" />
                                            <Label htmlFor="wallet" className="flex-1 cursor-pointer flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <Wallet className="w-4 h-4 text-blue-400" />
                                                    Credit to Wallet (Instant)
                                                </span>
                                                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] bg-blue-500/10" >Recommended</Badge>
                                            </Label>
                                        </div>
                                        <div className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer ${refundMethod === 'original' ? 'border-orange-500 bg-orange-500/10' : 'border-[#2A2A2A] hover:border-gray-700'}`}>
                                            <RadioGroupItem value="original" id="original" className="border-gray-500 text-orange-500" />
                                            <Label htmlFor="original" className="flex-1 cursor-pointer flex items-center gap-2">
                                                <IndianRupee className="w-4 h-4 text-orange-400" />
                                                Original Payment Source (3-5 Days)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="text-gray-300">Admin Notes</Label>
                                <Textarea
                                    placeholder="Reason for refund..."
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white h-20"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <div className="flex w-full justify-between items-center">
                            {(selectedRequest?.status.includes('requested') || selectedRequest?.status.includes('cancelled')) ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: 'rejected' })}
                                        disabled={isProcessing}
                                    >
                                        Reject Request
                                    </Button>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        {refundMethod === 'wallet' ? 'Credit Wallet' : 'Approve Refund'}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className="w-full bg-[#2A2A2A] hover:bg-[#333] text-white"
                                    onClick={() => setProcessDialogOpen(false)}
                                >
                                    Close
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
