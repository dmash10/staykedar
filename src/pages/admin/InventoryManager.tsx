import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
    Building2,
    MapPin,
    IndianRupee,
    Clock,
    Phone,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar
} from 'lucide-react';
import { format, isPast, addHours } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InventoryListing {
    id: string;
    hotel_name: string;
    location: string;
    room_type: string;
    original_price: number;
    discounted_price: number;
    available_rooms: number;
    valid_for_date: string;
    expires_at: string;
    contact_phone: string;
    is_verified: boolean;
    created_at: string;
}

const DEFAULT_FORM: Partial<InventoryListing> = {
    hotel_name: '',
    location: 'Guptkashi',
    room_type: 'Double Room',
    original_price: 3000,
    discounted_price: 1500,
    available_rooms: 1,
    valid_for_date: new Date().toISOString().slice(0, 10),
    contact_phone: '',
    is_verified: true
};

export default function InventoryManager() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<InventoryListing>>(DEFAULT_FORM);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch listings
    const { data: listings, isLoading } = useQuery({
        queryKey: ['admin-inventory'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory_listings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as InventoryListing[];
        }
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: Partial<InventoryListing>) => {
            // Calculate expiry (default 12 hours from now for quick listing)
            const expires_at = addHours(new Date(), 12).toISOString();

            const { error } = await supabase
                .from('inventory_listings')
                .insert({
                    ...data,
                    expires_at,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
            setIsModalOpen(false);
            setFormData(DEFAULT_FORM);
            toast({ title: "Listed!", description: "Room inventory added successfully." });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    // Toggle Verification mutation
    const toggleVerifyMutation = useMutation({
        mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
            const { error } = await supabase
                .from('inventory_listings')
                .update({ is_verified })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('inventory_listings').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
            toast({ title: "Deleted", description: "Listing removed." });
        }
    });

    const handleSubmit = () => {
        if (!formData.hotel_name || !formData.contact_phone) {
            toast({ title: "Missing Info", description: "Hotel Name and Phone are required", variant: "destructive" });
            return;
        }
        createMutation.mutate(formData);
    };

    // Config Query
    const { data: config } = useQuery({
        queryKey: ['app-config', 'urgent_deals_enabled'],
        queryFn: async () => {
            const { data } = await supabase.from('app_config').select('value').eq('key', 'urgent_deals_enabled').single();
            return data?.value || false;
        }
    });

    // Config Mutation
    const configMutation = useMutation({
        mutationFn: async (enabled: boolean) => {
            const { error } = await supabase.from('app_config').upsert({ key: 'urgent_deals_enabled', value: enabled });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['app-config'] });
            toast({ title: "Updated", description: "Widget visibility updated." });
        }
    });

    return (
        <AdminLayout title="Urgent Inventory">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Clock className="w-6 h-6 text-red-500" />
                            Last Minute Inventory
                        </h2>
                        <p className="text-gray-400">Manage urgent room listings for immediate booking.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#1A1A1A] px-4 py-2 rounded-lg border border-[#333]">
                            <span className="text-sm text-gray-400">Show on Stays Page</span>
                            <Switch
                                checked={config === true}
                                onCheckedChange={(checked) => configMutation.mutate(checked)}
                            />
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Urgent Room
                        </Button>
                    </div>
                </div>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                    <TableHead className="text-gray-400">Hotel Details</TableHead>
                                    <TableHead className="text-gray-400">Price Deal</TableHead>
                                    <TableHead className="text-gray-400">Availability</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-right text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : listings?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No active listings.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listings?.map((item) => (
                                        <TableRow key={item.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                            <TableCell>
                                                <div>
                                                    <p className="font-bold text-white">{item.hotel_name}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <MapPin className="w-3 h-3" /> {item.location}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                        <Phone className="w-3 h-3" /> {item.contact_phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-green-400 font-bold flex items-center">
                                                        <IndianRupee className="w-3 h-3" /> {item.discounted_price}
                                                    </p>
                                                    <p className="text-gray-500 text-xs line-through">
                                                        ₹{item.original_price}
                                                    </p>
                                                    <Badge variant="outline" className="text-[10px] border-red-900 bg-red-900/10 text-red-400 mt-1">
                                                        {Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100)}% OFF
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-300">
                                                    {item.available_rooms} Rooms left
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    For: {format(new Date(item.valid_for_date), 'MMM dd')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    {isPast(new Date(item.expires_at)) ? (
                                                        <Badge variant="destructive" className="w-fit">Expired</Badge>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={item.is_verified}
                                                                onCheckedChange={(c) => toggleVerifyMutation.mutate({ id: item.id, is_verified: c })}
                                                            />
                                                            <span className={`text-xs ${item.is_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                                                                {item.is_verified ? 'Live' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteMutation.mutate(item.id)}
                                                    className="hover:bg-red-900/20 text-gray-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Create Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white">
                        <DialogHeader>
                            <DialogTitle>Post Urgent Inventory</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hotel Name</Label>
                                    <Input
                                        value={formData.hotel_name}
                                        onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                        placeholder="e.g. Kedarnath View"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                        placeholder="e.g. Rampur"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Original Price</Label>
                                    <Input
                                        type="number"
                                        value={formData.original_price}
                                        onChange={(e) => setFormData({ ...formData, original_price: parseInt(e.target.value) })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Discount Price</Label>
                                    <Input
                                        type="number"
                                        value={formData.discounted_price}
                                        onChange={(e) => setFormData({ ...formData, discounted_price: parseInt(e.target.value) })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A] text-green-400 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Rooms Available</Label>
                                    <Input
                                        type="number"
                                        value={formData.available_rooms}
                                        onChange={(e) => setFormData({ ...formData, available_rooms: parseInt(e.target.value) })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Phone</Label>
                                    <Input
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                        placeholder="Important for booking"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Valid For Date (Check-in)</Label>
                                <Input
                                    type="date"
                                    value={formData.valid_for_date}
                                    onChange={(e) => setFormData({ ...formData, valid_for_date: e.target.value })}
                                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-2 p-3 bg-blue-900/20 rounded border border-blue-900/50">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                <p className="text-xs text-blue-200">
                                    Listing will expire automatically in 12 hours unless renewed.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-[#2A2A2A] text-gray-300">
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-red-600 hover:bg-red-700">
                                {createMutation.isPending ? "Posting..." : "Post Live"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
