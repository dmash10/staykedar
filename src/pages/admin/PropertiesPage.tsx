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
import { Search, Plus, MapPin, Edit, Trash2, Eye, MoreVertical, Building2, Bed } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function PropertiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const { data: properties, isLoading } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    customer_details (name),
                    rooms (count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const filteredProperties = properties?.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const stats = {
        total: properties?.length || 0,
        active: properties?.length || 0, // Assuming all are active for now
        pending: 0,
    };

    return (
        <AdminLayout title="Property Management">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-none text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium mb-1">Total Properties</p>
                                <h3 className="text-3xl font-bold">{stats.total}</h3>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Active</p>
                                <h3 className="text-3xl font-bold text-white">{stats.active}</h3>
                            </div>
                            <div className="bg-green-500/10 p-3 rounded-lg">
                                <Building2 className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Pending Approval</p>
                                <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
                            </div>
                            <div className="bg-amber-500/10 p-3 rounded-lg">
                                <Building2 className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Properties Table */}
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-xl font-semibold">All Properties</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <Input
                                    placeholder="Search properties..."
                                    className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => navigate('/dashboard/list-property')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Property
                            </Button>
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
                                        <TableHead className="text-gray-400 font-semibold">Property</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Location</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Owner</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Rooms</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                                        <TableHead className="text-gray-400 font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProperties.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No properties found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProperties.map((property) => (
                                            <TableRow key={property.id} className="border-[#2A2A2A] hover:bg-[#0A0A0A] transition">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Building2 className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white">{property.name}</p>
                                                            <p className="text-xs text-gray-400">ID: {property.id.slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-gray-300">
                                                        <MapPin className="w-4 h-4 mr-1.5 text-gray-500 flex-shrink-0" />
                                                        <span className="truncate max-w-xs">{property.address || 'No address'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-300">
                                                    {property.customer_details?.name || 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-gray-300">
                                                        <Bed className="w-4 h-4 mr-1.5 text-gray-500" />
                                                        {property.rooms?.[0]?.count || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                                                        Active
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#1A1A1A]">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                            <DropdownMenuItem
                                                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                                                onSelect={() => navigate(`/stays/${property.id}`)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                                                onSelect={() => navigate(`/property/edit/${property.id}`)}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit Property
                                                            </DropdownMenuItem>
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
