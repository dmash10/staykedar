import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  ExternalLink,
  Calendar,
  Eye,
  EyeOff,
  GripVertical,
  Link as LinkIcon
} from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  link_text: string;
  position: string;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const POSITIONS = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'footer', label: 'Footer' },
  { value: 'popup', label: 'Popup' },
];

const DEFAULT_FORM: Partial<Banner> = {
  title: '',
  subtitle: '',
  image_url: '',
  link_url: '',
  link_text: 'Learn More',
  position: 'hero',
  is_active: true,
  display_order: 0,
  start_date: null,
  end_date: null
};

export default function BannersPage() {
  const [filterPosition, setFilterPosition] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch banners
  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position')
        .order('display_order');
      if (error) throw error;
      return data as Banner[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Banner>) => {
      if (selectedBanner) {
        const { error } = await supabase
          .from('banners')
          .update(data)
          .eq('id', selectedBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setIsModalOpen(false);
      setSelectedBanner(null);
      setFormData(DEFAULT_FORM);
      toast({ title: "Saved!", description: "Banner saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setIsDeleteDialogOpen(false);
      setSelectedBanner(null);
      toast({ title: "Deleted!", description: "Banner deleted successfully." });
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('banners').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
  });

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      ...banner,
      start_date: banner.start_date ? new Date(banner.start_date).toISOString().slice(0, 16) : null,
      end_date: banner.end_date ? new Date(banner.end_date).toISOString().slice(0, 16) : null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const getBannerStatus = (banner: Banner) => {
    if (!banner.is_active) return { label: 'Inactive', color: 'bg-gray-500/20 text-gray-400' };
    if (banner.end_date && isPast(new Date(banner.end_date))) return { label: 'Expired', color: 'bg-red-500/20 text-red-400' };
    if (banner.start_date && isFuture(new Date(banner.start_date))) return { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400' };
    return { label: 'Active', color: 'bg-green-500/20 text-green-400' };
  };

  // Filter banners
  const filteredBanners = banners?.filter(b => {
    return filterPosition === 'all' || b.position === filterPosition;
  });

  // Group by position
  const bannersByPosition = POSITIONS.reduce((acc, pos) => {
    acc[pos.value] = filteredBanners?.filter(b => b.position === pos.value) || [];
    return acc;
  }, {} as Record<string, Banner[]>);

  if (isLoading) {
    return (
      <AdminLayout title="Banners">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Banners">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Banner Management</h2>
            <p className="text-sm text-gray-400">Manage promotional banners across your site</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger className="w-40 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="all">All Positions</SelectItem>
                {POSITIONS.map(pos => (
                  <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSelectedBanner(null);
                setFormData(DEFAULT_FORM);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Banner</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-white">{banners?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Active</p>
                <p className="text-xl font-bold text-white">{banners?.filter(b => b.is_active).length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Scheduled</p>
                <p className="text-xl font-bold text-white">
                  {banners?.filter(b => b.start_date && isFuture(new Date(b.start_date))).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <LinkIcon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">With Links</p>
                <p className="text-xl font-bold text-white">{banners?.filter(b => b.link_url).length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banners by Position */}
        {POSITIONS.map(position => {
          const positionBanners = bannersByPosition[position.value];
          if (filterPosition !== 'all' && filterPosition !== position.value) return null;
          
          return (
            <Card key={position.value} className="bg-[#111111] border-[#2A2A2A]">
              <CardHeader className="border-b border-[#2A2A2A] py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    {position.label}
                    <Badge variant="outline" className="text-gray-400 border-gray-600 ml-2">
                      {positionBanners.length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {positionBanners.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No banners in this position</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {positionBanners.map((banner) => {
                      const status = getBannerStatus(banner);
                      return (
                        <div
                          key={banner.id}
                          className={`rounded-xl border overflow-hidden ${
                            banner.is_active ? 'border-[#2A2A2A]' : 'border-[#2A2A2A] opacity-60'
                          }`}
                        >
                          {/* Image Preview */}
                          <div className="relative aspect-video bg-[#0A0A0A]">
                            {banner.image_url ? (
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-600" />
                              </div>
                            )}
                            <Badge className={`absolute top-2 right-2 ${status.color}`}>
                              {status.label}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="p-4 bg-[#0A0A0A]">
                            <h4 className="font-medium text-white text-sm line-clamp-1">{banner.title}</h4>
                            {banner.subtitle && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{banner.subtitle}</p>
                            )}
                            
                            {banner.link_url && (
                              <a 
                                href={banner.link_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-400 mt-2 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {banner.link_text || 'View Link'}
                              </a>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A2A2A]">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <GripVertical className="w-3 h-3" />
                                Order: {banner.display_order}
                              </div>
                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={banner.is_active}
                                  onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: banner.id, is_active: checked })}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(banner)}
                                  className="text-gray-400 hover:text-white hover:bg-[#2A2A2A] h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(banner)}
                                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-400" />
              {selectedBanner ? 'Edit Banner' : 'Create Banner'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Title *</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="Banner title"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Position</Label>
                <Select 
                  value={formData.position || 'hero'} 
                  onValueChange={(v) => setFormData({ ...formData, position: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    {POSITIONS.map(pos => (
                      <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Subtitle</Label>
              <Input
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Optional subtitle text"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Image URL *</Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="https://example.com/banner.jpg"
              />
              {formData.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-[#2A2A2A]">
                  <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>

            {/* Link Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Link URL</Label>
                <Input
                  value={formData.link_url || ''}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="/packages or https://..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Link Text</Label>
                <Input
                  value={formData.link_text || ''}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="Learn More"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Start Date (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">End Date (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            {/* Display Order & Active */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-gray-400">{formData.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              disabled={saveMutation.isPending || !formData.title || !formData.image_url}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                selectedBanner ? 'Update Banner' : 'Create Banner'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Banner?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedBanner?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedBanner && deleteMutation.mutate(selectedBanner.id)}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

