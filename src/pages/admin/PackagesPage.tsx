import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Eye,
  Copy,
  Star,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  Image as ImageIcon,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface PackageType {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  images: string[] | null;
  category: string | null;
  location: string | null;
  features: string[] | null;
  itinerary: ItineraryDay[] | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  status: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_featured: boolean | null;
  max_people: number | null;
  min_people: number | null;
  difficulty: string | null;
  created_at: string;
  updated_at: string | null;
}

const CATEGORIES = [
  { value: 'budget', label: 'Budget', color: 'bg-green-500' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-500' },
  { value: 'helicopter', label: 'Helicopter', color: 'bg-blue-500' },
  { value: 'adventure', label: 'Adventure', color: 'bg-orange-500' },
  { value: 'pilgrimage', label: 'Pilgrimage', color: 'bg-yellow-500' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
];

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function PackagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('basic');

  // Form state
  const [formData, setFormData] = useState<Partial<PackageType>>({
    title: '',
    slug: '',
    description: '',
    price: 0,
    duration: '',
    category: 'budget',
    location: '',
    features: [''],
    itinerary: [{ day: 1, title: '', description: '' }],
    inclusions: [''],
    exclusions: [''],
    images: [],
    status: 'draft',
    is_featured: false,
    meta_title: '',
    meta_description: '',
    max_people: 10,
    min_people: 1,
    difficulty: 'easy'
  });

  // Fetch packages
  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PackageType[];
    }
  });

  // Create/Update mutation
  const upsertMutation = useMutation({
    mutationFn: async (data: Partial<PackageType>) => {
      const payload = {
        title: data.title,
        slug: data.slug || generateSlug(data.title || ''),
        description: data.description,
        price: Number(data.price) || 0,
        duration: data.duration,
        category: data.category,
        location: data.location,
        features: data.features?.filter(f => f.trim() !== '') || [],
        itinerary: data.itinerary?.filter(i => i.title.trim() !== '') || [],
        inclusions: data.inclusions?.filter(i => i.trim() !== '') || [],
        exclusions: data.exclusions?.filter(e => e.trim() !== '') || [],
        images: data.images || [],
        status: data.status || 'draft',
        is_featured: data.is_featured || false,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        max_people: data.max_people || 10,
        min_people: data.min_people || 1,
        difficulty: data.difficulty || 'easy',
        updated_at: new Date().toISOString()
      };

      if (editingPackage?.id) {
        const { error } = await supabase
          .from('packages')
          .update(payload)
          .eq('id', editingPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('packages')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: `Package ${editingPackage ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      toast({
        title: "Deleted",
        description: "Package deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('packages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      toast({ title: "Status updated" });
    }
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('packages')
        .update({ is_featured, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      toast({ title: "Featured status updated" });
    }
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (pkg: PackageType) => {
      const { id, created_at, updated_at, ...rest } = pkg;
      const { error } = await supabase
        .from('packages')
        .insert({
          ...rest,
          title: `${pkg.title} (Copy)`,
          slug: `${pkg.slug}-copy-${Date.now()}`,
          status: 'draft'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      toast({ title: "Package duplicated", description: "A draft copy has been created." });
    }
  });

  const resetForm = () => {
    setEditingPackage(null);
    setActiveTab('basic');
    setFormData({
      title: '',
      slug: '',
      description: '',
      price: 0,
      duration: '',
      category: 'budget',
      location: '',
      features: [''],
      itinerary: [{ day: 1, title: '', description: '' }],
      inclusions: [''],
      exclusions: [''],
      images: [],
      status: 'draft',
      is_featured: false,
      meta_title: '',
      meta_description: '',
      max_people: 10,
      min_people: 1,
      difficulty: 'easy'
    });
  };

  const handleEdit = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      slug: pkg.slug,
      description: pkg.description || '',
      price: pkg.price || 0,
      duration: pkg.duration || '',
      category: pkg.category || 'budget',
      location: pkg.location || '',
      features: pkg.features?.length ? pkg.features : [''],
      itinerary: pkg.itinerary?.length ? pkg.itinerary : [{ day: 1, title: '', description: '' }],
      inclusions: pkg.inclusions?.length ? pkg.inclusions : [''],
      exclusions: pkg.exclusions?.length ? pkg.exclusions : [''],
      images: pkg.images || [],
      status: pkg.status || 'draft',
      is_featured: pkg.is_featured || false,
      meta_title: pkg.meta_title || '',
      meta_description: pkg.meta_description || '',
      max_people: pkg.max_people || 10,
      min_people: pkg.min_people || 1,
      difficulty: pkg.difficulty || 'easy'
    });
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  // Array field handlers
  const handleArrayChange = (field: 'features' | 'inclusions' | 'exclusions', index: number, value: string) => {
    const arr = [...(formData[field] || [])];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const addArrayItem = (field: 'features' | 'inclusions' | 'exclusions') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ''] });
  };

  const removeArrayItem = (field: 'features' | 'inclusions' | 'exclusions', index: number) => {
    const arr = [...(formData[field] || [])];
    arr.splice(index, 1);
    setFormData({ ...formData, [field]: arr.length ? arr : [''] });
  };

  // Itinerary handlers
  const handleItineraryChange = (index: number, field: 'title' | 'description', value: string) => {
    const itinerary = [...(formData.itinerary || [])];
    itinerary[index] = { ...itinerary[index], [field]: value };
    setFormData({ ...formData, itinerary });
  };

  const addItineraryDay = () => {
    const itinerary = formData.itinerary || [];
    setFormData({
      ...formData,
      itinerary: [...itinerary, { day: itinerary.length + 1, title: '', description: '' }]
    });
  };

  const removeItineraryDay = (index: number) => {
    const itinerary = [...(formData.itinerary || [])];
    itinerary.splice(index, 1);
    // Renumber days
    itinerary.forEach((day, i) => { day.day = i + 1; });
    setFormData({ ...formData, itinerary: itinerary.length ? itinerary : [{ day: 1, title: '', description: '' }] });
  };

  // Image handlers
  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData({ ...formData, images: [...(formData.images || []), url] });
    }
  };

  const removeImage = (index: number) => {
    const images = [...(formData.images || [])];
    images.splice(index, 1);
    setFormData({ ...formData, images });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  // Filter packages
  const filteredPackages = packages?.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const stats = {
    total: packages?.length || 0,
    published: packages?.filter(p => p.status === 'published').length || 0,
    draft: packages?.filter(p => p.status === 'draft').length || 0,
    featured: packages?.filter(p => p.is_featured).length || 0
  };

  return (
    <AdminLayout title="Package Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Packages</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Published</p>
                <p className="text-2xl font-bold text-green-400">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.draft}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-purple-400">{stats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-white text-lg font-medium flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-500" />
              Tour Packages
            </CardTitle>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] w-48"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36 bg-[#1A1A1A] border-[#2A2A2A]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => { resetForm(); setIsDialogOpen(true); }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#1A1A1A]">
              <TableRow className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                <TableHead className="text-slate-400">Package</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Price</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading packages...
                  </TableCell>
                </TableRow>
              ) : filteredPackages?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No packages found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages?.map((pkg) => (
                  <TableRow key={pkg.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {pkg.images?.[0] ? (
                          <img
                            src={pkg.images[0]}
                            alt={pkg.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{pkg.title}</span>
                            {pkg.is_featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {pkg.location || 'No location'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${CATEGORIES.find(c => c.value === pkg.category)?.color || 'bg-gray-500'} text-white`}
                      >
                        {CATEGORIES.find(c => c.value === pkg.category)?.label || pkg.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-green-400 font-bold">
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {pkg.price?.toLocaleString() || '0'}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {pkg.duration || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pkg.status === 'published' ? 'default' : 'secondary'}
                        className={pkg.status === 'published'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }
                      >
                        {pkg.status === 'published' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Published</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Draft</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <DropdownMenuItem onClick={() => handleEdit(pkg)} className="text-white hover:bg-[#2A2A2A]">
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`/packages/${pkg.slug}`, '_blank')}
                            className="text-white hover:bg-[#2A2A2A]"
                          >
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicateMutation.mutate(pkg)}
                            className="text-white hover:bg-[#2A2A2A]"
                          >
                            <Copy className="h-4 w-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                          <DropdownMenuItem
                            onClick={() => toggleFeaturedMutation.mutate({ id: pkg.id, is_featured: !pkg.is_featured })}
                            className="text-white hover:bg-[#2A2A2A]"
                          >
                            <Star className={`h-4 w-4 mr-2 ${pkg.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            {pkg.is_featured ? 'Remove Featured' : 'Mark Featured'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleStatusMutation.mutate({
                              id: pkg.id,
                              status: pkg.status === 'published' ? 'draft' : 'published'
                            })}
                            className="text-white hover:bg-[#2A2A2A]"
                          >
                            {pkg.status === 'published' ? (
                              <><XCircle className="h-4 w-4 mr-2" /> Unpublish</>
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-2" /> Publish</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  This action cannot be undone. This will permanently delete "{pkg.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-[#2A2A2A] text-white hover:bg-[#2A2A2A]">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(pkg.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="bg-[#1A1A1A] border-[#2A2A2A] text-white max-w-4xl max-h-[90vh] overflow-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in all the details for this tour package.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 bg-[#111111] mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[50vh] pr-4">
                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Package Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          title: e.target.value,
                          slug: generateSlug(e.target.value)
                        })}
                        className="bg-[#111111] border-[#2A2A2A]"
                        placeholder="e.g. Kedarnath Temple Tour"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="bg-[#111111] border-[#2A2A2A]"
                        placeholder="kedarnath-temple-tour"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-[#111111] border-[#2A2A2A] min-h-[100px]"
                      placeholder="Describe the package in detail..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="bg-[#111111] border-[#2A2A2A]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="bg-[#111111] border-[#2A2A2A]"
                        placeholder="e.g. 3 Days / 2 Nights"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-[#111111] border-[#2A2A2A]"
                        placeholder="e.g. Kedarnath"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.category || 'budget'}
                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                      >
                        <SelectTrigger className="bg-[#111111] border-[#2A2A2A]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty || 'easy'}
                        onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                      >
                        <SelectTrigger className="bg-[#111111] border-[#2A2A2A]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          {DIFFICULTIES.map(d => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status || 'draft'}
                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                      >
                        <SelectTrigger className="bg-[#111111] border-[#2A2A2A]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min People</Label>
                      <Input
                        type="number"
                        value={formData.min_people}
                        onChange={(e) => setFormData({ ...formData, min_people: Number(e.target.value) })}
                        className="bg-[#111111] border-[#2A2A2A]"
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max People</Label>
                      <Input
                        type="number"
                        value={formData.max_people}
                        onChange={(e) => setFormData({ ...formData, max_people: Number(e.target.value) })}
                        className="bg-[#111111] border-[#2A2A2A]"
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_featured || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label className="font-normal">Featured Package</Label>
                    </div>
                  </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 mt-0">
                  {/* Features */}
                  <div className="space-y-2">
                    <Label>Features / Highlights</Label>
                    <div className="space-y-2">
                      {formData.features?.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => handleArrayChange('features', index, e.target.value)}
                            className="bg-[#111111] border-[#2A2A2A]"
                            placeholder="e.g. Temple Darshan, Guided Trek"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem('features', index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('features')}
                        className="w-full border-dashed border-[#2A2A2A]"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Feature
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-[#2A2A2A]" />

                  {/* Inclusions */}
                  <div className="space-y-2">
                    <Label className="text-green-400">Inclusions</Label>
                    <div className="space-y-2">
                      {formData.inclusions?.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                            className="bg-[#111111] border-[#2A2A2A]"
                            placeholder="e.g. Accommodation, Meals, Transport"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem('inclusions', index)}
                            className="text-red-400 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('inclusions')}
                        className="w-full border-dashed border-[#2A2A2A]"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Inclusion
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-[#2A2A2A]" />

                  {/* Exclusions */}
                  <div className="space-y-2">
                    <Label className="text-red-400">Exclusions</Label>
                    <div className="space-y-2">
                      {formData.exclusions?.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                            className="bg-[#111111] border-[#2A2A2A]"
                            placeholder="e.g. Personal Expenses, GST"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem('exclusions', index)}
                            className="text-red-400 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('exclusions')}
                        className="w-full border-dashed border-[#2A2A2A]"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Exclusion
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Itinerary Tab */}
                <TabsContent value="itinerary" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    {formData.itinerary?.map((day, index) => (
                      <Card key={index} className="bg-[#111111] border-[#2A2A2A]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-white">
                              Day {day.day}
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItineraryDay(index)}
                              className="text-red-400 h-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Input
                            value={day.title}
                            onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                            className="bg-[#1A1A1A] border-[#2A2A2A]"
                            placeholder="Day Title (e.g. Arrival & Check-in)"
                          />
                          <Textarea
                            value={day.description}
                            onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                            className="bg-[#1A1A1A] border-[#2A2A2A] min-h-[80px]"
                            placeholder="Day description and activities..."
                          />
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItineraryDay}
                      className="w-full border-dashed border-[#2A2A2A]"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Day
                    </Button>
                  </div>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Package Images</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {formData.images?.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Package ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-[#2A2A2A]"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addImageUrl}
                        className="h-24 border-dashed border-[#2A2A2A] flex flex-col gap-1"
                      >
                        <ImageIcon className="h-6 w-6" />
                        <span className="text-xs">Add Image URL</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <Input
                      value={formData.meta_title || ''}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      className="bg-[#111111] border-[#2A2A2A]"
                      placeholder="SEO title for search engines"
                    />
                    <p className="text-xs text-gray-500">
                      {(formData.meta_title || '').length}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      value={formData.meta_description || ''}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      className="bg-[#111111] border-[#2A2A2A]"
                      placeholder="SEO description for search engines"
                    />
                    <p className="text-xs text-gray-500">
                      {(formData.meta_description || '').length}/160 characters
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="bg-[#111111] rounded-lg p-4 border border-[#2A2A2A]">
                    <p className="text-xs text-gray-400 mb-2">Search Preview</p>
                    <p className="text-blue-400 text-lg hover:underline cursor-pointer">
                      {formData.meta_title || formData.title || 'Package Title'}
                    </p>
                    <p className="text-green-500 text-sm">
                      staykedarnath.com/packages/{formData.slug || 'package-slug'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {formData.meta_description || formData.description?.slice(0, 160) || 'Package description will appear here...'}
                    </p>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="mt-4 pt-4 border-t border-[#2A2A2A]">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsDialogOpen(false); resetForm(); }}
                className="border-[#2A2A2A]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPackage ? 'Update Package' : 'Create Package'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}