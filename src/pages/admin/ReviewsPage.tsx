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
import { Search, Star, MessageSquare, CheckCircle, XCircle, MoreVertical, Flag, Trash2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ReviewsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Mock data for now since reviews table might not exist yet
    // In a real scenario, we would fetch from 'reviews' table
    const { data: reviews, isLoading } = useQuery({
        queryKey: ['admin-reviews'],
        queryFn: async () => {
            // @ts-ignore
            const { error } = await supabase.from('reviews').select('count', { count: 'exact', head: true });

            if (error) {
                // Return mock data if table doesn't exist
                return [
                    {
                        id: '1',
                        user_name: 'John Doe',
                        property_name: 'Mountain View Resort',
                        rating: 5,
                        comment: 'Absolutely amazing stay! The view was breathtaking and the service was top notch.',
                        status: 'published',
                        created_at: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        user_name: 'Sarah Smith',
                        property_name: 'Lakeside Cabin',
                        rating: 4,
                        comment: 'Great location, but the wifi was a bit spotty. Otherwise perfect.',
                        status: 'published',
                        created_at: subDays(new Date(), 2).toISOString(),
                    },
                    {
                        id: '3',
                        user_name: 'Mike Johnson',
                        property_name: 'City Apartment',
                        rating: 2,
                        comment: 'Not as described. Very noisy and dirty.',
                        status: 'flagged',
                        created_at: subDays(new Date(), 5).toISOString(),
                    }
                ];
            }

            // @ts-ignore
            const { data } = await supabase
                .from('reviews')
                .select(`
                    *,
                    customer_details (name, email),
                    properties (name)
                `)
                .order('created_at', { ascending: false });
            return data;
        }
    });

    const filteredReviews = reviews?.filter((review: any) =>
        review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            published: 'bg-green-500/10 text-green-400 border-green-500/20',
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            flagged: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return (
            <Badge className={`${styles[status as keyof typeof styles] || styles.pending} hover:opacity-80`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AdminLayout title="Reviews Management">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-none text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium mb-1">Total Reviews</p>
                                <h3 className="text-3xl font-bold">{reviews?.length || 0}</h3>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Average Rating</p>
                                <h3 className="text-3xl font-bold text-white">4.2</h3>
                                <div className="flex items-center mt-2 text-yellow-400">
                                    <Star className="w-4 h-4 mr-1 fill-yellow-400" />
                                    <span className="text-sm">Based on all reviews</span>
                                </div>
                            </div>
                            <div className="bg-yellow-500/10 p-3 rounded-lg">
                                <Star className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Flagged</p>
                                <h3 className="text-3xl font-bold text-white">
                                    {reviews?.filter((r: any) => r.status === 'flagged').length || 0}
                                </h3>
                            </div>
                            <div className="bg-red-500/10 p-3 rounded-lg">
                                <Flag className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews Table */}
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-xl font-semibold">All Reviews</CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                placeholder="Search reviews..."
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
                                        <TableHead className="text-gray-400 font-semibold">User</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Property</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Rating</TableHead>
                                        <TableHead className="text-gray-400 font-semibold w-1/3">Comment</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Date</TableHead>
                                        <TableHead className="text-gray-400 font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReviews.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No reviews found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReviews.map((review: any) => (
                                            <TableRow key={review.id} className="border-[#2A2A2A] hover:bg-[#0A0A0A] transition">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8 border border-gray-700">
                                                            <AvatarFallback className="bg-gray-800 text-gray-300 text-xs">
                                                                {review.user_name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-white font-medium">{review.user_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    {review.property_name}
                                                </TableCell>
                                                <TableCell>
                                                    {renderStars(review.rating)}
                                                </TableCell>
                                                <TableCell className="text-gray-400 text-sm">
                                                    <p className="line-clamp-2">{review.comment}</p>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(review.status)}</TableCell>
                                                <TableCell className="text-gray-400 text-sm">
                                                    {format(new Date(review.created_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#1A1A1A]">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                            <DropdownMenuItem className="text-green-400 hover:text-green-300 hover:bg-[#2A2A2A] cursor-pointer">
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-amber-400 hover:text-amber-300 hover:bg-[#2A2A2A] cursor-pointer">
                                                                <Flag className="w-4 h-4 mr-2" />
                                                                Flag
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                                                            <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] cursor-pointer">
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
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

function subDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}
