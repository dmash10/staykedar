import { useState } from 'react';
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
    MessageSquare,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Phone,
    Send,
    RefreshCw,
    Loader2,
    User,
    ArrowUpRight,
    Eye,
    AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, subDays, differenceInHours } from 'date-fns';

// Message Types
const MESSAGE_TYPES = {
    booking_confirmation: { label: 'Booking Confirmed', color: 'text-green-400', bg: 'bg-green-500/10' },
    quote_sent: { label: 'Quote Sent', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    payment_reminder: { label: 'Payment Reminder', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    checkin_reminder: { label: 'Check-in Reminder', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    welcome: { label: 'Welcome', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    custom: { label: 'Custom', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const DELIVERY_STATUS = {
    sent: { label: 'Sent', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Send },
    delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
    read: { label: 'Read', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Eye },
    failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
    pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
};

export default function WhatsAppLogsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Fetch WhatsApp logs from stay_leads (simulating message logs based on status changes)
    const { data: logs, isLoading, refetch } = useQuery({
        queryKey: ['admin-whatsapp-logs', typeFilter, statusFilter],
        queryFn: async () => {
            // Fetch leads with their activity
            const { data: leads, error } = await supabase
                .from('stay_leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            // Generate simulated message logs from lead activity
            const messageLogs: any[] = [];

            (leads || []).forEach(lead => {
                // Generate messages based on lead status
                if (lead.status === 'contacted' || lead.status === 'quote_sent' || lead.status === 'confirmed' || lead.status === 'paid') {
                    messageLogs.push({
                        id: `${lead.id}-welcome`,
                        leadId: lead.id,
                        customerName: lead.name || 'Guest',
                        customerPhone: lead.phone || '',
                        type: 'welcome',
                        message: `Hello ${lead.name || 'Guest'}! Thank you for your inquiry about ${lead.property_name || 'our properties'}. We'll get back to you shortly.`,
                        status: 'delivered',
                        sentAt: lead.created_at,
                        respondedAt: null,
                    });
                }

                if (lead.status === 'quote_sent' || lead.status === 'confirmed' || lead.status === 'paid') {
                    messageLogs.push({
                        id: `${lead.id}-quote`,
                        leadId: lead.id,
                        customerName: lead.name || 'Guest',
                        customerPhone: lead.phone || '',
                        type: 'quote_sent',
                        message: `Your quote for ${lead.property_name || 'stay'} is ready! Please check and confirm.`,
                        status: 'read',
                        sentAt: lead.updated_at || lead.created_at,
                        respondedAt: lead.updated_at,
                    });
                }

                if (lead.status === 'confirmed' || lead.status === 'paid') {
                    messageLogs.push({
                        id: `${lead.id}-confirm`,
                        leadId: lead.id,
                        customerName: lead.name || 'Guest',
                        customerPhone: lead.phone || '',
                        type: 'booking_confirmation',
                        message: `Booking confirmed! Your stay at ${lead.property_name || 'property'} is confirmed. Check-in details will follow.`,
                        status: 'delivered',
                        sentAt: lead.updated_at || lead.created_at,
                        respondedAt: null,
                    });
                }

                // Flag unresponsive leads (no response in 24h after initial contact)
                if (lead.status === 'new') {
                    const hoursSinceCreated = differenceInHours(new Date(), parseISO(lead.created_at));
                    if (hoursSinceCreated > 24) {
                        messageLogs.push({
                            id: `${lead.id}-noresponse`,
                            leadId: lead.id,
                            customerName: lead.name || 'Guest',
                            customerPhone: lead.phone || '',
                            type: 'custom',
                            message: `Initial inquiry - No response in ${Math.floor(hoursSinceCreated / 24)} days`,
                            status: 'pending',
                            sentAt: lead.created_at,
                            respondedAt: null,
                            unresponsive: true,
                        });
                    }
                }
            });

            // Sort by sentAt descending
            return messageLogs.sort((a, b) =>
                new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
            );
        },
        staleTime: 30000,
    });

    // Filter logs
    const filteredLogs = logs?.filter(log => {
        const matchesSearch = searchQuery === '' ||
            log.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.customerPhone?.includes(searchQuery);

        const matchesType = typeFilter === 'all' || log.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    }) || [];

    // Stats
    const stats = {
        total: logs?.length || 0,
        delivered: logs?.filter(l => l.status === 'delivered').length || 0,
        read: logs?.filter(l => l.status === 'read').length || 0,
        unresponsive: logs?.filter(l => l.unresponsive).length || 0,
    };

    return (
        <>
            <div className="space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Messages</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-green-400 uppercase font-semibold">Delivered</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">{stats.delivered}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-emerald-400 uppercase font-semibold">Read</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.read}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                <p className="text-xs text-orange-400 uppercase font-semibold">Unresponsive</p>
                            </div>
                            <p className="text-2xl font-bold text-orange-400 mt-1">{stats.unresponsive}</p>
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
                                    placeholder="Search by name or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full md:w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Message Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="welcome">Welcome</SelectItem>
                                    <SelectItem value="quote_sent">Quote Sent</SelectItem>
                                    <SelectItem value="booking_confirmation">Booking Confirmed</SelectItem>
                                    <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                                    <SelectItem value="checkin_reminder">Check-in Reminder</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[150px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => refetch()}
                                className="border-[#2A2A2A] text-gray-400 hover:text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A]">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-green-400" />
                                    Message History
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    Track outgoing WhatsApp communications
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No message logs found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                            <TableHead className="text-gray-400">Customer</TableHead>
                                            <TableHead className="text-gray-400">Type</TableHead>
                                            <TableHead className="text-gray-400">Message</TableHead>
                                            <TableHead className="text-gray-400">Status</TableHead>
                                            <TableHead className="text-gray-400">Sent</TableHead>
                                            <TableHead className="text-gray-400 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map((log) => {
                                            const typeConfig = MESSAGE_TYPES[log.type as keyof typeof MESSAGE_TYPES] || MESSAGE_TYPES.custom;
                                            const statusConfig = DELIVERY_STATUS[log.status as keyof typeof DELIVERY_STATUS] || DELIVERY_STATUS.pending;
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <TableRow
                                                    key={log.id}
                                                    className={`border-[#2A2A2A] hover:bg-[#1A1A1A] ${log.unresponsive ? 'bg-orange-500/5' : ''}`}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                                                                {log.customerName?.charAt(0) || 'G'}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium text-sm">{log.customerName}</p>
                                                                <p className="text-gray-500 text-xs">{log.customerPhone}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${typeConfig.bg} ${typeConfig.color} border-transparent text-xs`}>
                                                            {typeConfig.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-gray-300 text-sm max-w-xs truncate">{log.message}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                                                            <span className={`text-sm ${statusConfig.color}`}>{statusConfig.label}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-gray-400 text-sm">
                                                            {log.sentAt ? format(parseISO(log.sentAt), 'MMM dd, HH:mm') : 'N/A'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <a
                                                            href={`https://wa.me/${log.customerPhone?.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                            Chat
                                                        </a>
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

                {/* Legend */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Status Legend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(DELIVERY_STATUS).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                        <span className="text-gray-400 text-sm">{config.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </>
    );
}
