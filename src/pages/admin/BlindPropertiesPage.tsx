import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
    Building2,
    MapPin,
    IndianRupee,
    Phone,
    Plus,
    Trash2,
    Edit,
    Eye,
    MoreVertical,
    Search,
    Shield,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { BlindProperty, LOCATION_GROUPS } from '@/types/stays';

const DEFAULT_FORM: Partial<BlindProperty> = {
    internal_name: '',
    display_name: '',
    location_slug: 'guptkashi',
    category: 'standard',
    base_price: 2500,
    surge_price: 4000,
    amenities: {
        geyser: 'gas',
        toilet: 'western',
        parking: true,
        restaurant: false,
        wifi: false,
        room_service: false,
        front_desk: false,
        non_smoking: false,
        free_cancellation: false,
        no_credit_card: false,
        no_prepayment: false,
        bedrooms: 1,
        bathrooms: 1,
        property_type: 'hotel',
        rating: 4.5
    },
    zone_description: '',
    pros: [],
    cons: [],
    audit_notes: '',
    owner_phone: '',
    images: [],
    is_active: true
};

export default function BlindPropertiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<BlindProperty>>(DEFAULT_FORM);
    const [prosText, setProsText] = useState('');
    const [consText, setConsText] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch properties
    const { data: properties, isLoading } = useQuery({
        queryKey: ['admin-blind-properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blind_properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as BlindProperty[];
        }
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data: Partial<BlindProperty>) => {
            const payload: any = {
                ...data,
                pros: prosText.split('\n').filter(Boolean),
                cons: consText.split('\n').filter(Boolean),
            };

            // Remove ID from payload for insert/update to avoid issues if it's undefined or partial
            delete payload.id;
            delete payload.created_at;
            delete payload.updated_at;

            if (editingId) {
                const { error } = await supabase
                    .from('blind_properties')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('blind_properties')
                    .insert(payload);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blind-properties'] });
            setIsModalOpen(false);
            resetForm();
            toast({ title: editingId ? 'Updated!' : 'Created!', description: 'Property saved successfully.' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('blind_properties').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blind-properties'] });
            toast({ title: 'Deleted', description: 'Property removed.' });
        }
    });

    // Toggle active mutation
    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await supabase.from('blind_properties').update({ is_active }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blind-properties'] });
        }
    });

    const resetForm = () => {
        setFormData(DEFAULT_FORM);
        setProsText('');
        setConsText('');
        setEditingId(null);
    };

    const openEditModal = (property: BlindProperty) => {
        setFormData(property);
        setProsText(property.pros?.join('\n') || '');
        setConsText(property.cons?.join('\n') || '');
        setEditingId(property.id);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.internal_name || !formData.display_name) {
            toast({ title: 'Missing Info', description: 'Internal name and Display name are required', variant: 'destructive' });
            return;
        }
        saveMutation.mutate(formData);
    };

    const filteredProperties = properties?.filter(p =>
        p.internal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location_slug.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const stats = {
        total: properties?.length || 0,
        active: properties?.filter(p => p.is_active).length || 0,
        premium: properties?.filter(p => p.category === 'premium').length || 0,
    };

    const allLocations = LOCATION_GROUPS.flatMap(g => g.options);

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-none text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium mb-1">Total Properties</p>
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
                                <p className="text-gray-400 text-sm font-medium mb-1">Active / Live</p>
                                <h3 className="text-3xl font-bold text-white">{stats.active}</h3>
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
                                <p className="text-gray-400 text-sm font-medium mb-1">Premium Stays</p>
                                <h3 className="text-3xl font-bold text-white">{stats.premium}</h3>
                            </div>
                            <div className="bg-yellow-500/10 p-3 rounded-lg">
                                <Shield className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Properties Table */}
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-xl font-semibold">All Blind Properties</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <Input
                                    placeholder="Search properties..."
                                    className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => { resetForm(); setIsModalOpen(true); }}
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
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#2A2A2A] hover:bg-[#0A0A0A]">
                                        <TableHead className="text-gray-400 font-semibold">Property</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Location</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Type & Rating</TableHead>
                                        <TableHead className="text-gray-400 font-semibold">Price</TableHead>
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
                                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Building2 className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white">{property.display_name}</p>
                                                            <p className="text-xs text-gray-500">{property.internal_name}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-gray-300">
                                                        <MapPin className="w-4 h-4 mr-1.5 text-gray-500 flex-shrink-0" />
                                                        <span className="capitalize">{property.location_slug}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="w-fit text-xs border-gray-700 text-gray-400 capitalize">
                                                            {(property.amenities as any)?.property_type || 'hotel'}
                                                        </Badge>
                                                        <div className="flex items-center text-xs text-yellow-500">
                                                            <span className="font-bold mr-1">{(property.amenities as any)?.rating || 4.5}</span>
                                                            <Shield className="w-3 h-3 fill-yellow-500" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-green-400 font-semibold">
                                                        <IndianRupee className="w-3 h-3" />
                                                        {property.base_price}
                                                    </div>
                                                    {property.surge_price && (
                                                        <p className="text-xs text-gray-500">Peak: ₹{property.surge_price}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={property.is_active}
                                                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: property.id, is_active: checked })}
                                                    />
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
                                                                onSelect={() => navigate(`/stays/view/${property.id}`)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Public
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                                                onSelect={() => openEditModal(property)}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] cursor-pointer"
                                                                onSelect={() => deleteMutation.mutate(property.id)}
                                                            >
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

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Property' : 'Add New Blind Property'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Names */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Internal Name (Admin Only)</Label>
                                <Input
                                    value={formData.internal_name}
                                    onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                                    placeholder="Hotel Shiva Palace"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Display Name (User Sees)</Label>
                                <Input
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                                    placeholder="Premium Valley View Stay"
                                />
                            </div>
                        </div>

                        {/* Location, Type & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Select
                                    value={formData.location_slug}
                                    onValueChange={(v) => setFormData({ ...formData, location_slug: v })}
                                >
                                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                        {allLocations.map(loc => (
                                            <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Property Type</Label>
                                <Select
                                    value={(formData.amenities as any)?.property_type || 'hotel'}
                                    onValueChange={(v) => setFormData({ ...formData, amenities: { ...formData.amenities, property_type: v } })}
                                >
                                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                        <SelectItem value="hotel">Hotel</SelectItem>
                                        <SelectItem value="resort">Resort</SelectItem>
                                        <SelectItem value="homestay">Homestay</SelectItem>
                                        <SelectItem value="tent">Tent/Camp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category (Pricing Tier)</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v as any })}
                                >
                                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                        <SelectItem value="budget">Budget</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Base Price (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.base_price}
                                    onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) })}
                                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Surge Price (Peak Season ₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.surge_price || ''}
                                    onChange={(e) => setFormData({ ...formData, surge_price: parseInt(e.target.value) || undefined })}
                                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                                />
                            </div>
                        </div>

                        {/* Contact & Zone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Owner Phone</Label>
                                <Input
                                    value={formData.owner_phone || ''}
                                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                                    placeholder="+91 98..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Zone Description</Label>
                                <Input
                                    value={formData.zone_description || ''}
                                    onChange={(e) => setFormData({ ...formData, zone_description: e.target.value })}
                                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                                    placeholder="200m from Temple"
                                />
                            </div>
                        </div>

                        {/* Amenities & Config */}
                        <div className="space-y-4">
                            <Label>Amenities & Configuration</Label>

                            {/* Room Config & Rating */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-[#0A0A0A] rounded-lg">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Bedrooms</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={(formData.amenities as any)?.bedrooms ?? 1}
                                        onChange={(e) => setFormData({ ...formData, amenities: { ...formData.amenities, bedrooms: parseInt(e.target.value) } })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A] h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Bathrooms</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={(formData.amenities as any)?.bathrooms ?? 1}
                                        onChange={(e) => setFormData({ ...formData, amenities: { ...formData.amenities, bathrooms: parseInt(e.target.value) } })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A] h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Rating (0.0 - 5.0)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        value={(formData.amenities as any)?.rating ?? 4.5}
                                        onChange={(e) => setFormData({ ...formData, amenities: { ...formData.amenities, rating: parseFloat(e.target.value) } })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A] h-8 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Policies */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 bg-[#0A0A0A] rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={(formData.amenities as any)?.free_cancellation || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, free_cancellation: c } })}
                                    />
                                    <span className="text-sm">Free Cancellation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={(formData.amenities as any)?.no_credit_card || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, no_credit_card: c } })}
                                    />
                                    <span className="text-sm">No Credit Card</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={(formData.amenities as any)?.no_prepayment || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, no_prepayment: c } })}
                                    />
                                    <span className="text-sm">No Prepayment</span>
                                </div>
                            </div>

                            {/* Facilities */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#0A0A0A] rounded-lg">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Geyser</Label>
                                    <Select
                                        value={(formData.amenities as any)?.geyser || 'gas'}
                                        onValueChange={(v) => setFormData({ ...formData, amenities: { ...formData.amenities, geyser: v } })}
                                    >
                                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                            <SelectItem value="gas">Gas</SelectItem>
                                            <SelectItem value="solar">Solar</SelectItem>
                                            <SelectItem value="electric">Electric</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Toilet</Label>
                                    <Select
                                        value={(formData.amenities as any)?.toilet || 'western'}
                                        onValueChange={(v) => setFormData({ ...formData, amenities: { ...formData.amenities, toilet: v } })}
                                    >
                                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                            <SelectItem value="western">Western</SelectItem>
                                            <SelectItem value="indian">Indian</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2 pt-5">
                                    <Switch
                                        checked={(formData.amenities as any)?.parking || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, parking: c } })}
                                    />
                                    <span className="text-sm">Parking</span>
                                </div>
                                <div className="flex items-center gap-2 pt-5">
                                    <Switch
                                        checked={(formData.amenities as any)?.wifi || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, wifi: c } })}
                                    />
                                    <span className="text-sm">WiFi</span>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <Switch
                                        checked={(formData.amenities as any)?.restaurant || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, restaurant: c } })}
                                    />
                                    <span className="text-sm">Restaurant</span>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <Switch
                                        checked={(formData.amenities as any)?.room_service || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, room_service: c } })}
                                    />
                                    <span className="text-sm">Room Service</span>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <Switch
                                        checked={(formData.amenities as any)?.front_desk || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, front_desk: c } })}
                                    />
                                    <span className="text-sm">24h Desk</span>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <Switch
                                        checked={(formData.amenities as any)?.non_smoking || false}
                                        onCheckedChange={(c) => setFormData({ ...formData, amenities: { ...formData.amenities, non_smoking: c } })}
                                    />
                                    <span className="text-sm">Non-Smoking</span>
                                </div>
                            </div>
                        </div>

                        {/* Pros & Cons */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    Pros (one per line)
                                </Label>
                                <Textarea
                                    value={prosText}
                                    onChange={(e) => setProsText(e.target.value)}
                                    className="bg-[#1A1A1A] border-[#2A2A2A] min-h-24"
                                    placeholder="Gas geyser 24/7&#10;Mountain view&#10;New beds"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    Cons (one per line)
                                </Label>
                                <Textarea
                                    value={consText}
                                    onChange={(e) => setConsText(e.target.value)}
                                    className="bg-[#1A1A1A] border-[#2A2A2A] min-h-24"
                                    placeholder="50 stairs&#10;Weak WiFi&#10;Road noise"
                                />
                            </div>
                        </div>

                        {/* Audit Notes */}
                        <div className="space-y-2">
                            <Label>Audit Notes (Internal)</Label>
                            <Textarea
                                value={formData.audit_notes || ''}
                                onChange={(e) => setFormData({ ...formData, audit_notes: e.target.value })}
                                className="bg-[#1A1A1A] border-[#2A2A2A]"
                                placeholder="Your notes after visiting the property..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-[#2A2A2A] text-gray-300">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="bg-orange-600 hover:bg-orange-700">
                            {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Property' : 'Add Property'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
