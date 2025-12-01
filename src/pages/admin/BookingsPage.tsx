import { useState } from 'react';
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
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, CheckCircle, XCircle, Clock, MoreVertical, User, Home } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function BookingsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: bookings, isLoading } = useQuery({
        queryKey: ['admin-bookings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    customer_details (name, email),
                    rooms (
                        name,
                        room_type,
                        properties (name)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const { error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            toast({
                title: "Success",
                description: "Booking status updated successfully.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to update: " + error.message,
                variant: "destructive",
            });
        }
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
            completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
        return (
            <Badge className={`${styles[status as keyof typeof styles] || styles.pending} hover:opacity-80`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredBookings = bookings?.filter(booking =>
        booking.customer_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.rooms?.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const stats = {
        total: bookings?.length || 0,
        confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
        pending: bookings?.filter(b => b.status === 'pending').length || 0,
        cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
    };

    return (
        <AdminLayout title="Booking Management">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Total Bookings</p>
                                <h3 className="text-3xl font-bold">{stats.total}</h3>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Confirmed</p>
                                <h3 className="text-3xl font-bold text-white">{stats.confirmed}</h3>
                            </div>
                            <div className="bg-green-500/10 p-3 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Pending</p>
                                <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
                            </div>
                            <div className="bg-amber-500/10 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Cancelled</p>
                                <h3 className="text-3xl font-bold text-white">{stats.cancelled}</h3>
                            </div>
                            <div className="bg-red-500/10 p-3 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bookings Table */}
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-xl font-semibold">All Bookings</CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                placeholder="Search bookings..."
                                className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#2A2A2A] hover:bg-[#0A0A0A]">
                                        <TableHead className="text-gray-400 font-semibold">Booking ID</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Customer</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Property</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Check In/Out</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Amount</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                                        <TableHead className="text-gray-400 font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No bookings found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredBookings.map((booking) => (
                                            <TableRow key={booking.id} className="border-[#2A2A2A] hover:bg-[#0A0A0A] transition">
                                                <TableCell className="font-mono text-sm text-gray-300">
                                                    #{booking.id.slice(0, 8)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <User className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{booking.customer_details?.name || 'Guest'}</p>
                                                            <p className="text-xs text-gray-400">{booking.customer_details?.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Home className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-medium text-white truncate max-w-xs">
                                                                {booking.rooms?.properties?.name || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{booking.rooms?.name}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3 h-3 text-gray-500" />
                                                            {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400">
                                                            <Calendar className="w-3 h-3 text-gray-500" />
                                                            {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-white">
                                                    ₹{booking.total_price?.toLocaleString()}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#1A1A1A]">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer">
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                                                            <DropdownMenuItem
                                                                className="text-green-400 hover:text-green-300 hover:bg-[#2A2A2A] cursor-pointer"
                                                                onSelect={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Confirm
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] cursor-pointer"
                                                                onSelect={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
