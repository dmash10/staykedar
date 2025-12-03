import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Loader2,
  Percent,
  IndianRupee,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applies_to: string;
  created_at: string;
}

const DEFAULT_FORM: Partial<PromoCode> = {
  code: '',
  name: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_value: 0,
  max_discount_amount: null,
  usage_limit: null,
  per_user_limit: 1,
  valid_from: new Date().toISOString().slice(0, 16),
  valid_until: null,
  is_active: true,
  applies_to: 'all'
};

export default function PromoCodesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<Partial<PromoCode>>(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch promo codes
  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['admin-promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PromoCode[];
    }
  });

  // Fetch usage stats
  const { data: usageStats } = useQuery({
    queryKey: ['promo-usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_code_usage')
        .select('discount_applied');
      if (error) throw error;
      const totalDiscount = data?.reduce((sum, u) => sum + (u.discount_applied || 0), 0) || 0;
      return { totalUsage: data?.length || 0, totalDiscount };
    }
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PromoCode>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (selectedPromo) {
        const { error } = await supabase
          .from('promo_codes')
          .update(data)
          .eq('id', selectedPromo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert({ ...data, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      setIsModalOpen(false);
      setSelectedPromo(null);
      setFormData(DEFAULT_FORM);
      toast({
        title: selectedPromo ? "Updated!" : "Created!",
        description: `Promo code ${selectedPromo ? 'updated' : 'created'} successfully.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save promo code",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      setIsDeleteDialogOpen(false);
      setSelectedPromo(null);
      toast({ title: "Deleted!", description: "Promo code deleted successfully." });
    }
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
    }
  });

  const handleEdit = (promo: PromoCode) => {
    setSelectedPromo(promo);
    setFormData({
      ...promo,
      valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().slice(0, 16) : '',
      valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (promo: PromoCode) => {
    setSelectedPromo(promo);
    setIsDeleteDialogOpen(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Code "${code}" copied to clipboard.` });
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const getPromoStatus = (promo: PromoCode) => {
    if (!promo.is_active) return { label: 'Inactive', color: 'bg-gray-500/20 text-gray-400' };
    if (promo.valid_until && isPast(new Date(promo.valid_until))) return { label: 'Expired', color: 'bg-red-500/20 text-red-400' };
    if (promo.valid_from && isFuture(new Date(promo.valid_from))) return { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400' };
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) return { label: 'Exhausted', color: 'bg-amber-500/20 text-amber-400' };
    return { label: 'Active', color: 'bg-green-500/20 text-green-400' };
  };

  // Filter promo codes
  const filteredPromoCodes = promoCodes?.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          promo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getPromoStatus(promo);
    const matchesStatus = statusFilter === 'all' || status.label.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const activeCount = promoCodes?.filter(p => getPromoStatus(p).label === 'Active').length || 0;
  const totalUsed = promoCodes?.reduce((sum, p) => sum + p.used_count, 0) || 0;

  if (isLoading) {
    return (
      <AdminLayout title="Promo Codes">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Promo Codes">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Codes</p>
                <p className="text-2xl font-bold text-white">{promoCodes?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Times Used</p>
                <p className="text-2xl font-bold text-white">{totalUsed}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Discount Given</p>
                <p className="text-2xl font-bold text-white">₹{usageStats?.totalDiscount?.toLocaleString() || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-400" />
                Promo Codes
              </CardTitle>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-64 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    setSelectedPromo(null);
                    setFormData(DEFAULT_FORM);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Promo Code
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-gray-400">Code</TableHead>
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Discount</TableHead>
                    <TableHead className="text-gray-400">Usage</TableHead>
                    <TableHead className="text-gray-400">Valid Until</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoCodes?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No promo codes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromoCodes?.map((promo) => {
                      const status = getPromoStatus(promo);
                      return (
                        <TableRow key={promo.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded font-mono text-sm">
                                {promo.code}
                              </code>
                              <button
                                onClick={() => handleCopyCode(promo.code)}
                                className="text-gray-500 hover:text-white"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{promo.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-green-400">
                              {promo.discount_type === 'percentage' ? (
                                <><Percent className="w-4 h-4" />{promo.discount_value}%</>
                              ) : (
                                <><IndianRupee className="w-4 h-4" />{promo.discount_value}</>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {promo.used_count}{promo.usage_limit ? `/${promo.usage_limit}` : ''}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {promo.valid_until ? format(new Date(promo.valid_until), 'MMM dd, yyyy') : 'No expiry'}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Switch
                                checked={promo.is_active}
                                onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: promo.id, is_active: checked })}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(promo)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(promo)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-400" />
              {selectedPromo ? 'Edit Promo Code' : 'Create Promo Code'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Code & Name */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Promo Code *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white font-mono uppercase"
                    placeholder="SUMMER25"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCode}
                    className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] shrink-0"
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Name *</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="Summer Sale Discount"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Describe this promo code..."
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-gray-300">Discount Type</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={(v: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discount_value || ''}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder={formData.discount_type === 'percentage' ? '10' : '500'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Max Discount (₹)</Label>
                <Input
                  type="number"
                  value={formData.max_discount_amount || ''}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="No limit"
                />
              </div>
            </div>

            {/* Order Requirements */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Minimum Order Value (₹)</Label>
                <Input
                  type="number"
                  value={formData.min_order_value || ''}
                  onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Applies To</Label>
                <Select 
                  value={formData.applies_to} 
                  onValueChange={(v) => setFormData({ ...formData, applies_to: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="rooms">Room Bookings Only</SelectItem>
                    <SelectItem value="packages">Packages Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Total Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Per User Limit</Label>
                <Input
                  type="number"
                  value={formData.per_user_limit || ''}
                  onChange={(e) => setFormData({ ...formData, per_user_limit: parseInt(e.target.value) })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Validity Period */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Valid From</Label>
                <Input
                  type="datetime-local"
                  value={formData.valid_from || ''}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Valid Until</Label>
                <Input
                  type="datetime-local"
                  value={formData.valid_until || ''}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || null })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1A1A1A]">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-gray-300">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saveMutation.isPending || !formData.code || !formData.name}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                selectedPromo ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Promo Code?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedPromo?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPromo && deleteMutation.mutate(selectedPromo.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

