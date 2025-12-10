import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Phone,
    MessageCircle,
    Calendar,
    MapPin,
    Search,
    Users,
    Clock,
    CheckCircle,
    AlertTriangle,
    MoreVertical,
    ExternalLink,
    Trash2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StayLead } from '@/types/stays';

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { value: 'paid', label: 'Paid', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function StayLeadsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch leads with property details
    const { data: leads, isLoading } = useQuery({
        queryKey: ['admin-stay-leads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('stay_leads')
                .select(`
                    *,
                    blind_properties (
                        display_name,
                        internal_name,
                        location_slug
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('stay_leads')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stay-leads'] });
            toast({ title: 'Updated', description: 'Lead status updated.' });
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('stay_leads').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stay-leads'] });
            toast({ title: 'Deleted', description: 'Lead removed.' });
        }
    });

    const filteredLeads = leads?.filter(lead => {
        const matchesSearch =
            lead.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.blind_properties?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    const stats = {
        total: leads?.length || 0,
        new: leads?.filter(l => l.status === 'new').length || 0,
        confirmed: leads?.filter(l => l.status === 'confirmed' || l.status === 'paid').length || 0,
        urgent: leads?.filter(l => l.is_urgent).length || 0,
    };

    const openWhatsApp = (phone: string, propertyName?: string) => {
        const message = `Hi! I'm following up on your stay enquiry${propertyName ? ` for ${propertyName}` : ''}. How can I help you today?`;
        window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        return (
            <Badge className={statusOption?.color || 'bg-gray-500/10 text-gray-400'}>
                {statusOption?.label || status}
            </Badge>
        );
    };

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Total Leads</p>
                                <h3 className="text-3xl font-bold">{stats.total}</h3>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">New / Pending</p>
                                <h3 className="text-3xl font-bold text-white">{stats.new}</h3>
                            </div>
                            <div className="bg-blue-500/10 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Confirmed / Paid</p>
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
                                <p className="text-gray-400 text-sm font-medium mb-1">Urgent Requests</p>
                                <h3 className="text-3xl font-bold text-white">{stats.urgent}</h3>
                            </div>
                            <div className="bg-red-500/10 p-3 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Table */}
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-xl font-semibold">All Leads</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <Input
                                    placeholder="Search phone or property..."
                                    className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                    <SelectItem value="all">All Status</SelectItem>
                                    {STATUS_OPTIONS.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                        <TableHead className="text-gray-400 font-semibold">Customer</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Property</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Dates</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Received</TableHead>
                                        <TableHead className="text-gray-400 font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No leads found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLeads.map((lead) => (
                                            <TableRow key={lead.id} className="border-[#2A2A2A] hover:bg-[#0A0A0A] transition">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${lead.is_urgent
                                                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                                                : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                            }`}>
                                                            <Phone className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white flex items-center gap-2">
                                                                {lead.customer_phone}
                                                                {lead.is_urgent && (
                                                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                                                        URGENT
                                                                    </Badge>
                                                                )}
                                                            </p>
                                                            {lead.customer_name && (
                                                                <p className="text-xs text-gray-500">{lead.customer_name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {lead.blind_properties ? (
                                                        <div>
                                                            <p className="text-white text-sm">{lead.blind_properties.display_name}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {lead.blind_properties.location_slug || lead.location_slug}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">
                                                            {lead.location_slug || 'Not specified'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {lead.check_in ? (
                                                        <div className="flex items-center gap-1 text-gray-300 text-sm">
                                                            <Calendar className="w-3 h-3 text-gray-500" />
                                                            {format(new Date(lead.check_in), 'MMM dd')}
                                                            {lead.check_out && ` - ${format(new Date(lead.check_out), 'MMM dd')}`}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">Not set</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={lead.status}
                                                        onValueChange={(v) => updateStatusMutation.mutate({ id: lead.id, status: v })}
                                                    >
                                                        <SelectTrigger className="w-32 h-8 bg-transparent border-none p-0">
                                                            {getStatusBadge(lead.status)}
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                            {STATUS_OPTIONS.map(s => (
                                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-gray-400 text-sm">
                                                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openWhatsApp(lead.customer_phone, lead.blind_properties?.display_name)}
                                                            className="bg-green-600 hover:bg-green-700 h-8"
                                                        >
                                                            <MessageCircle className="w-4 h-4 mr-1" />
                                                            WhatsApp
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#1A1A1A] h-8 w-8 p-0">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                                <DropdownMenuItem
                                                                    className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                                                    onSelect={() => window.open(`tel:${lead.customer_phone}`, '_self')}
                                                                >
                                                                    <Phone className="w-4 h-4 mr-2" />
                                                                    Call
                                                                </DropdownMenuItem>
                                                                {lead.property_id && (
                                                                    <DropdownMenuItem
                                                                        className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                                                        onSelect={() => window.open(`/stays/view/${lead.property_id}`, '_blank')}
                                                                    >
                                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                                        View Property
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] cursor-pointer"
                                                                    onSelect={() => deleteMutation.mutate(lead.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
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
        </>
    );
}
