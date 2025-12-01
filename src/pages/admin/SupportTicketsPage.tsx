import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Search,
    MoreHorizontal,
    Eye,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Mail,
    Phone,
    User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SupportTicketsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['admin-tickets-profiles', statusFilter],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_tickets_with_profiles', {
                p_status: statusFilter === 'all' ? null : statusFilter,
                p_category: null
            });

            if (error) throw error;
            return data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ ticketNumber, newStatus }: { ticketNumber: string; newStatus: string }) => {
            const { error } = await supabase.rpc('update_ticket_status', {
                p_ticket_number: ticketNumber,
                p_new_status: newStatus
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets-profiles'] });
            toast.success('Ticket status updated');
        },
        onError: () => {
            toast.error('Failed to update status');
        }
    });

    const filteredTickets = tickets?.filter(ticket => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ticket.user_full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ticket.guest_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ticket.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-none">Open</Badge>;
            case 'in_progress':
                return <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-none">In Progress</Badge>;
            case 'closed':
                return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">Closed</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-400 border-slate-700">Unknown</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical':
                return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-none">Critical</Badge>;
            case 'high':
                return <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-none">High</Badge>;
            case 'medium':
                return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-none">Medium</Badge>;
            case 'low':
                return <Badge className="bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 border-none">Low</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-400 border-slate-700">{priority}</Badge>;
        }
    };

    const stats = {
        total: tickets?.length || 0,
        open: tickets?.filter(t => t.status === 'open').length || 0,
        inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
        closed: tickets?.filter(t => t.status === 'closed').length || 0,
    };

    return (
        <AdminLayout title="Support Tickets">
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-200">Total Tickets</CardTitle>
                            <MessageSquare className="h-4 w-4 text-gray-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-200">Open</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-100">{stats.open}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-500/20 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-200">In Progress</CardTitle>
                            <CheckCircle className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-100">{stats.inProgress}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/20 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-200">Closed</CardTitle>
                            <XCircle className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-100">{stats.closed}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('all')}
                            className={statusFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white'}
                        >
                            All
                        </Button>
                        <Button
                            variant={statusFilter === 'open' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('open')}
                            className={statusFilter === 'open' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white'}
                        >
                            Open
                        </Button>
                        <Button
                            variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('in_progress')}
                            className={statusFilter === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white'}
                        >
                            In Progress
                        </Button>
                        <Button
                            variant={statusFilter === 'closed' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('closed')}
                            className={statusFilter === 'closed' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white'}
                        >
                            Closed
                        </Button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Tickets Table */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-white font-semibold">Ticket</TableHead>
                                    <TableHead className="text-white font-semibold">Subject</TableHead>
                                    <TableHead className="text-white font-semibold">User</TableHead>
                                    <TableHead className="text-white font-semibold">Status</TableHead>
                                    <TableHead className="text-white font-semibold">Priority</TableHead>
                                    <TableHead className="text-white font-semibold">Date</TableHead>
                                    <TableHead className="text-white font-semibold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                                            Loading tickets...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTickets?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                                            No tickets found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTickets?.map((ticket) => (
                                        <TableRow key={ticket.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-mono text-sm text-blue-400 font-semibold">
                                                {ticket.ticket_number || `#${ticket.id.slice(0, 8)}`}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-white">
                                                {ticket.subject}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={ticket.user_avatar_url || ''} />
                                                        <AvatarFallback className="bg-blue-600 text-white">
                                                            {(ticket.user_full_name || ticket.guest_name || 'U').charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">
                                                            {ticket.user_full_name || ticket.guest_name || 'Unknown User'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {ticket.user_email || ticket.guest_email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                            <TableCell className="text-gray-300 text-sm">
                                                {ticket.created_at ? format(new Date(ticket.created_at), 'MMM dd, HH:mm') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-gray-900 border-white/20">
                                                        <DropdownMenuLabel className="text-gray-400">Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/admin/tickets/${ticket.ticket_number}`)}
                                                            className="text-white focus:bg-white/20 focus:text-white cursor-pointer"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuLabel className="text-gray-400">Update Status</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => updateStatusMutation.mutate({ ticketNumber: ticket.ticket_number!, newStatus: 'open' })}
                                                            className="text-white focus:bg-white/20 focus:text-white cursor-pointer"
                                                        >
                                                            <AlertTriangle className="mr-2 h-4 w-4 text-blue-400" />
                                                            Mark as Open
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => updateStatusMutation.mutate({ ticketNumber: ticket.ticket_number!, newStatus: 'in_progress' })}
                                                            className="text-white focus:bg-white/20 focus:text-white cursor-pointer"
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4 text-amber-400" />
                                                            Mark as In Progress
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => updateStatusMutation.mutate({ ticketNumber: ticket.ticket_number!, newStatus: 'closed' })}
                                                            className="text-white focus:bg-white/20 focus:text-white cursor-pointer"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4 text-green-400" />
                                                            Mark as Closed
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
