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
import { Search, Filter, MoreHorizontal, Plus, MapPin, Star, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
                    customer_details (
                        name
                    ),
                    rooms (count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const getStatusBadge = (status: string) => {
        // Assuming status is not currently in the DB schema based on types.ts, 
        // but we'll default to 'Active' for now or use a placeholder if we add it later.
        // For now, let's assume all properties are active as there's no status column in the schema provided.
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    };

    const filteredProperties = properties?.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <AdminLayout title="Property Management">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-4 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-200 text-lg font-medium">All Properties</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search properties..."
                                    className="pl-9 bg-slate-800 border-slate-700 text-slate-200 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => navigate('/property/new')}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Property
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
                                    <TableHead className="text-slate-400">Property Name</TableHead>
                                    <TableHead className="text-slate-400">Location</TableHead>
                                    <TableHead className="text-slate-400">Owner</TableHead>
                                    <TableHead className="text-slate-400">Rooms</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProperties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                                            No properties found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProperties.map((property) => (
                                        <TableRow key={property.id} className="border-slate-800 hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-slate-200">
                                                <div className="flex flex-col">
                                                    <span>{property.name}</span>
                                                    <span className="text-xs text-slate-500">ID: {property.id.slice(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                                                    {property.address || 'No address'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {property.customer_details?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {property.rooms?.[0]?.count || 0}
                                            </TableCell>
                                            <TableCell>{getStatusBadge('active')}</TableCell>
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
                                                        <DropdownMenuItem
                                                            className="hover:bg-slate-800 cursor-pointer"
                                                            onClick={() => navigate(`/property/edit/${property.id}`)}
                                                        >
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">Manage Rooms</DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-red-500">
                                                            Deactivate
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
