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
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
                    customer_details (
                        name,
                        email
                    ),
                    rooms (
                        name,
                        room_type,
                        properties (
                            name
                        )
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
                title: "Status Updated",
                description: "Booking status has been updated successfully.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to update booking status: " + error.message,
                variant: "destructive",
            });
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed': return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
            case 'pending': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
            case 'completed': return <Badge variant="secondary">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredBookings = bookings?.filter(booking =>
        booking.customer_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.rooms?.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <AdminLayout title="Booking Management">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-4 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-200 text-lg font-medium">All Bookings</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search bookings..."
                                    className="pl-9 bg-slate-800 border-slate-700 text-slate-200 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
                                <Filter className="h-4 w-4 mr-2" /> Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-900">
                                <TableRow className="border-slate-800 hover:bg-slate-900">
                                    <TableHead className="text-slate-400">Booking ID</TableHead>
                                    <TableHead className="text-slate-400">Customer</TableHead>
                                    <TableHead className="text-slate-400">Property</TableHead>
                                    <TableHead className="text-slate-400">Dates</TableHead>
                                    <TableHead className="text-slate-400">Amount</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.id} className="border-slate-800 hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-slate-200 text-xs">{booking.id.slice(0, 8)}...</TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex flex-col">
                                                    <span>{booking.customer_details?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-slate-500">{booking.customer_details?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex flex-col">
                                                    <span>{booking.rooms?.properties?.name || 'Unknown Property'}</span>
                                                    <span className="text-xs text-slate-500">{booking.rooms?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex flex-col text-sm">
                                                    <span>In: {new Date(booking.check_in_date).toLocaleDateString()}</span>
                                                    <span>Out: {new Date(booking.check_out_date).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-200 font-medium">₹{booking.total_price?.toLocaleString()}</TableCell>
                                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">View Details</DropdownMenuItem>
                                                        <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">Contact Customer</DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem
                                                            className="hover:bg-slate-800 cursor-pointer text-green-500"
                                                            onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="hover:bg-slate-800 cursor-pointer text-red-500"
                                                            onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
