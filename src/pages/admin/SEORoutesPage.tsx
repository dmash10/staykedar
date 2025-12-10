import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AISEOAssistant } from '@/components/editor/plugins/AISEOAssistant';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  MapPin,
  Car,
  HelpCircle,
  Eye,
  EyeOff,
  Star,
  Globe,
  ExternalLink,
  ArrowUpDown,
  Loader2,
  RouteIcon,
  Clock,
  Navigation,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface RouteStop {
  name: string;
  description: string;
  distance_from_start: number;
  time_needed: string;
}

interface SEORoute {
  id: string;
  slug: string;
  from_city: string;
  to_city: string;
  distance_km: number;
  duration_hours: number;
  route_type: string;
  difficulty: string;
  meta_title: string;
  meta_description: string;
  short_description: string;
  long_description: string;
  route_highlights: string[];
  route_images: string[];
  main_image: string;
  how_to_travel: string;
  road_conditions: string;
  best_time_to_travel: string;
  stops_along_way: RouteStop[];
  taxi_rates: {
    sedan: number;
    suv: number;
    tempo: number;
  };
  bus_info: string;
  shared_taxi_info: string;
  weather_info: string;
  safety_tips: string;
  faqs: { question: string; answer: string }[];
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;

  // Vernacular Content
  short_description_hi?: string; meta_title_hi?: string; meta_description_hi?: string; faq_hi?: Array<{ question: string; answer: string }>;
  short_description_ta?: string; meta_title_ta?: string; meta_description_ta?: string; faq_ta?: Array<{ question: string; answer: string }>;
  short_description_te?: string; meta_title_te?: string; meta_description_te?: string; faq_te?: Array<{ question: string; answer: string }>;
  short_description_kn?: string; meta_title_kn?: string; meta_description_kn?: string; faq_kn?: Array<{ question: string; answer: string }>;
  short_description_ml?: string; meta_title_ml?: string; meta_description_ml?: string; faq_ml?: Array<{ question: string; answer: string }>;
}

const defaultRoute: Partial<SEORoute> = {
  slug: '',
  from_city: '',
  to_city: '',
  distance_km: 0,
  duration_hours: 0,
  route_type: 'road',
  difficulty: 'Moderate',
  meta_title: '',
  meta_description: '',
  short_description: '',
  long_description: '',
  route_highlights: [],
  route_images: [],
  main_image: '',
  how_to_travel: '',
  road_conditions: '',
  best_time_to_travel: '',
  stops_along_way: [],
  taxi_rates: { sedan: 0, suv: 0, tempo: 0 },
  bus_info: '',
  shared_taxi_info: '',
  weather_info: '',
  safety_tips: '',
  faqs: [],
  is_active: true,
  is_featured: false,
  is_popular: false,

  // Vernacular Defaults
  short_description_hi: '', meta_title_hi: '', meta_description_hi: '', faq_hi: [],
  short_description_ta: '', meta_title_ta: '', meta_description_ta: '', faq_ta: [],
  short_description_te: '', meta_title_te: '', meta_description_te: '', faq_te: [],
  short_description_kn: '', meta_title_kn: '', meta_description_kn: '', faq_kn: [],
  short_description_ml: '', meta_title_ml: '', meta_description_ml: '', faq_ml: [],
};

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
] as const;

export default function SEORoutesPage() {
  const [routes, setRoutes] = useState<SEORoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Partial<SEORoute> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [activeLang, setActiveLang] = useState<typeof LANGUAGES[number]['code']>('hi');
  const [sortField, setSortField] = useState<keyof SEORoute>('from_city');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  // Fetch routes
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_routes')
        .select('*')
        .order('from_city', { ascending: true });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to fetch routes: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof SEORoute) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRoutes = routes
    .filter(route =>
      route.from_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.to_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const openNewRouteDialog = () => {
    setEditingRoute({ ...defaultRoute });
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const openEditDialog = (route: SEORoute) => {
    setEditingRoute({ ...route });
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const generateSlug = () => {
    if (editingRoute?.from_city && editingRoute?.to_city) {
      const slug = `${editingRoute.from_city.toLowerCase()}-to-${editingRoute.to_city.toLowerCase()}`
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setEditingRoute(prev => prev ? { ...prev, slug } : prev);
    }
  };

  const updateField = (field: keyof SEORoute, value: any) => {
    setEditingRoute(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const updateTaxiRate = (type: 'sedan' | 'suv' | 'tempo', value: number) => {
    setEditingRoute(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        taxi_rates: {
          ...prev.taxi_rates,
          [type]: value
        }
      };
    });
  };

  const checkSlugAvailability = async (slug: string, currentId?: string): Promise<boolean> => {
    try {
      let query = supabase.from('seo_routes').select('id').eq('slug', slug);

      if (currentId) {
        query = query.neq('id', currentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!editingRoute) return;

    if (!editingRoute.from_city || !editingRoute.to_city || !editingRoute.slug) {
      toast({
        title: 'Validation Error',
        description: 'From City, To City, and Slug are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Check for duplicate slug
      const slugExists = await checkSlugAvailability(editingRoute.slug, editingRoute.id);
      if (slugExists) {
        toast({
          title: 'Validation Error',
          description: `The slug "${editingRoute.slug}" is already in use. Please choose another one.`,
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      const dataToSave = {
        ...editingRoute,
        updated_at: new Date().toISOString(),
      };

      if (editingRoute.id) {
        const { error } = await supabase
          .from('seo_routes')
          .update(dataToSave)
          .eq('id', editingRoute.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Route updated successfully' });
      } else {
        const { error } = await supabase
          .from('seo_routes')
          .insert([dataToSave]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Route created successfully' });
      }

      setIsDialogOpen(false);
      fetchRoutes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to save: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seo_routes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Route deleted successfully' });
      fetchRoutes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (route: SEORoute) => {
    try {
      const { error } = await supabase
        .from('seo_routes')
        .update({ is_active: !route.is_active })
        .eq('id', route.id);
      if (error) throw error;
      fetchRoutes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // FAQ Management
  const addFaq = () => {
    setEditingRoute(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        faqs: [...(prev.faqs || []), { question: '', answer: '' }]
      };
    });
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setEditingRoute(prev => {
      if (!prev || !prev.faqs) return prev;
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  const removeFaq = (index: number) => {
    setEditingRoute(prev => {
      if (!prev || !prev.faqs) return prev;
      return { ...prev, faqs: prev.faqs.filter((_, i) => i !== index) };
    });
  };

  // Stop Management
  const addStop = () => {
    setEditingRoute(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        stops_along_way: [...(prev.stops_along_way || []), { name: '', description: '', distance_from_start: 0, time_needed: '' }]
      };
    });
  };

  const updateStop = (index: number, field: keyof RouteStop, value: any) => {
    setEditingRoute(prev => {
      if (!prev || !prev.stops_along_way) return prev;
      const newStops = [...prev.stops_along_way];
      newStops[index] = { ...newStops[index], [field]: value };
      return { ...prev, stops_along_way: newStops };
    });
  };

  const removeStop = (index: number) => {
    setEditingRoute(prev => {
      if (!prev || !prev.stops_along_way) return prev;
      return { ...prev, stops_along_way: prev.stops_along_way.filter((_, i) => i !== index) };
    });
  };

  // AI Translation Handler
  const handleTranslate = async () => {
    if (!editingRoute || !editingRoute.short_description) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          text: {
            description: editingRoute.short_description,
            meta_title: editingRoute.meta_title,
            meta_description: editingRoute.meta_description,
            faqs: editingRoute.faqs
          },
          targetLang: 'hi'
        }
      });

      if (error) throw error;

      setEditingRoute(prev => ({
        ...prev!,
        short_description_hi: data.description,
        meta_title_hi: data.meta_title,
        meta_description_hi: data.meta_description,
        faq_hi: data.faqs
      }));

      toast({ title: 'Translated!', description: 'Content auto-translated to Hindi.' });
    } catch (error: any) {
      toast({ title: 'Translation Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">SEO Routes</h1>
            <p className="text-gray-400 mt-1">Manage programmatic route pages</p>
          </div>
          <Button onClick={openNewRouteDialog} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Add Route
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <RouteIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Routes</p>
                  <p className="text-2xl font-bold text-white">{routes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Eye className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Routes</p>
                  <p className="text-2xl font-bold text-white">
                    {routes.filter(r => r.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Star className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Popular</p>
                  <p className="text-2xl font-bold text-white">
                    {routes.filter(r => r.is_popular).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Pages Generated</p>
                  <p className="text-2xl font-bold text-white">
                    {routes.filter(r => r.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Routes Table */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                  <TableHead className="text-gray-400">
                    <Button variant="ghost" onClick={() => handleSort('from_city')} className="text-gray-400 hover:text-white">
                      Route <ArrowUpDown className="w-4 h-4 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-400">Distance</TableHead>
                  <TableHead className="text-gray-400">Duration</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Page</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    </TableCell>
                  </TableRow>
                ) : filteredRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                      No routes found. Add your first route!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoutes.map((route) => (
                    <TableRow key={route.id} className="border-[#2A2A2A]">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-white font-medium">{route.from_city}</span>
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span className="text-white font-medium">{route.to_city}</span>
                          </div>
                          {route.is_popular && (
                            <Badge className="bg-amber-500/10 text-amber-400 border-0 text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-1">/{route.slug}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-300">
                          <Navigation className="w-4 h-4" />
                          {route.distance_km} km
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-300">
                          <Clock className="w-4 h-4" />
                          {route.duration_hours} hrs
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={route.is_active}
                          onCheckedChange={() => toggleActive(route)}
                        />
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/route/${route.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(route)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Route</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Are you sure you want to delete the route from {route.from_city} to {route.to_city}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#1A1A1A] border-[#2A2A2A] text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(route.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit/Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#111111] border-[#2A2A2A] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-white">
                    {editingRoute?.id ? 'Edit Route' : 'Add New Route'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure route page settings and content.
                  </DialogDescription>
                </div>
                {/* AI Assistant */}
                <AISEOAssistant
                  contentType="route"
                  currentData={editingRoute ? {
                    name: `${editingRoute.from_city} to ${editingRoute.to_city}`,
                    from_city: editingRoute.from_city,
                    to_city: editingRoute.to_city,
                    distance_km: editingRoute.distance_km,
                    meta_title: editingRoute.meta_title,
                    meta_description: editingRoute.meta_description,
                    short_description: editingRoute.short_description,
                    long_description: editingRoute.long_description,
                    faqs: editingRoute.faqs
                  } : undefined}
                  onContentGenerated={(data, mode) => {
                    if (!editingRoute) return;
                    setEditingRoute(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        ...(data.meta_title && { meta_title: data.meta_title }),
                        ...(data.meta_description && { meta_description: data.meta_description }),
                        ...(data.short_description && { short_description: data.short_description }),
                        ...(data.long_description && { long_description: data.long_description }),
                        ...(data.how_to_travel && { how_to_travel: data.how_to_travel }),
                        ...(data.road_conditions && { road_conditions: data.road_conditions }),
                        ...(data.best_time_to_travel && { best_time_to_travel: data.best_time_to_travel }),
                        ...(data.safety_tips && { safety_tips: data.safety_tips }),
                        ...(data.faqs && { faqs: data.faqs }),
                      };
                    });
                  }}
                  buttonText="AI Assistant"
                />
              </div>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="bg-[#1A1A1A] border-[#2A2A2A] flex-wrap">
                <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600">Basic</TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-blue-600">SEO</TabsTrigger>
                <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-600">Pricing</TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-blue-600">Content</TabsTrigger>
                <TabsTrigger value="stops" className="data-[state=active]:bg-blue-600">Stops</TabsTrigger>
                <TabsTrigger value="faqs" className="data-[state=active]:bg-blue-600">FAQs</TabsTrigger>
                <TabsTrigger value="vernacular" className="data-[state=active]:bg-orange-600">Vernacular</TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">From City *</Label>
                    <Input
                      value={editingRoute?.from_city || ''}
                      onChange={(e) => updateField('from_city', e.target.value)}
                      placeholder="e.g., Haridwar"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">To City *</Label>
                    <Input
                      value={editingRoute?.to_city || ''}
                      onChange={(e) => updateField('to_city', e.target.value)}
                      placeholder="e.g., Kedarnath"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">URL Slug *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editingRoute?.slug || ''}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="haridwar-to-kedarnath"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                    <Button onClick={generateSlug} variant="outline" className="border-[#2A2A2A] text-gray-300">
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">URL: /route/{editingRoute?.slug || 'slug'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Distance (km)</Label>
                    <Input
                      type="number"
                      value={editingRoute?.distance_km || 0}
                      onChange={(e) => updateField('distance_km', parseInt(e.target.value) || 0)}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Duration (hours)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={editingRoute?.duration_hours || 0}
                      onChange={(e) => updateField('duration_hours', parseFloat(e.target.value) || 0)}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Route Type</Label>
                    <Select value={editingRoute?.route_type || 'road'} onValueChange={(v) => updateField('route_type', v)}>
                      <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                        <SelectItem value="road">Road</SelectItem>
                        <SelectItem value="trek">Trek</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Difficulty</Label>
                    <Select value={editingRoute?.difficulty || 'Moderate'} onValueChange={(v) => updateField('difficulty', v)}>
                      <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Difficult">Difficult</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={editingRoute?.is_active ?? true} onCheckedChange={(v) => updateField('is_active', v)} />
                    <Label className="text-gray-300">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editingRoute?.is_popular ?? false} onCheckedChange={(v) => updateField('is_popular', v)} />
                    <Label className="text-gray-300">Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editingRoute?.is_featured ?? false} onCheckedChange={(v) => updateField('is_featured', v)} />
                    <Label className="text-gray-300">Featured</Label>
                  </div>
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Meta Title (max 60 chars)</Label>
                  <Input
                    value={editingRoute?.meta_title || ''}
                    onChange={(e) => updateField('meta_title', e.target.value)}
                    placeholder="Haridwar to Kedarnath Route Guide 2026 | Distance & Tips"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                  <p className="text-xs text-gray-500">{(editingRoute?.meta_title || '').length}/60 characters</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Meta Description (max 160 chars)</Label>
                  <Textarea
                    value={editingRoute?.meta_description || ''}
                    onChange={(e) => updateField('meta_description', e.target.value)}
                    placeholder="Complete guide from Haridwar to Kedarnath. Distance, road conditions, taxi fares & tips."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500">{(editingRoute?.meta_description || '').length}/160 characters</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Short Description (Hero text)</Label>
                  <Textarea
                    value={editingRoute?.short_description || ''}
                    onChange={(e) => updateField('short_description', e.target.value)}
                    placeholder="Brief description shown in the hero section"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Sedan Price (₹)</Label>
                    <Input
                      type="number"
                      value={editingRoute?.taxi_rates?.sedan || 0}
                      onChange={(e) => updateTaxiRate('sedan', parseInt(e.target.value) || 0)}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">SUV Price (₹)</Label>
                    <Input
                      type="number"
                      value={editingRoute?.taxi_rates?.suv || 0}
                      onChange={(e) => updateTaxiRate('suv', parseInt(e.target.value) || 0)}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Tempo Price (₹)</Label>
                    <Input
                      type="number"
                      value={editingRoute?.taxi_rates?.tempo || 0}
                      onChange={(e) => updateTaxiRate('tempo', parseInt(e.target.value) || 0)}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Bus Information</Label>
                  <Textarea
                    value={editingRoute?.bus_info || ''}
                    onChange={(e) => updateField('bus_info', e.target.value)}
                    placeholder="Information about bus services on this route"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Shared Taxi Information</Label>
                  <Textarea
                    value={editingRoute?.shared_taxi_info || ''}
                    onChange={(e) => updateField('shared_taxi_info', e.target.value)}
                    placeholder="Information about shared taxi options"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Long Description (About the Journey)</Label>
                  <Textarea
                    value={editingRoute?.long_description || ''}
                    onChange={(e) => updateField('long_description', e.target.value)}
                    placeholder="Detailed description of the route..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Road Conditions</Label>
                  <Textarea
                    value={editingRoute?.road_conditions || ''}
                    onChange={(e) => updateField('road_conditions', e.target.value)}
                    placeholder="Current road conditions and what to expect"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Best Time to Travel</Label>
                  <Textarea
                    value={editingRoute?.best_time_to_travel || ''}
                    onChange={(e) => updateField('best_time_to_travel', e.target.value)}
                    placeholder="Optimal months and weather conditions"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Safety Tips</Label>
                  <Textarea
                    value={editingRoute?.safety_tips || ''}
                    onChange={(e) => updateField('safety_tips', e.target.value)}
                    placeholder="Important safety information for travelers"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Weather Information</Label>
                  <Textarea
                    value={editingRoute?.weather_info || ''}
                    onChange={(e) => updateField('weather_info', e.target.value)}
                    placeholder="Weather conditions along the route"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>
              </TabsContent>

              {/* Stops Tab */}
              <TabsContent value="stops" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Stops Along the Way</Label>
                  <Button onClick={addStop} size="sm" variant="outline" className="border-[#2A2A2A] text-gray-300">
                    <Plus className="w-4 h-4 mr-1" /> Add Stop
                  </Button>
                </div>
                {(editingRoute?.stops_along_way || []).map((stop, index) => (
                  <Card key={index} className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              value={stop.name}
                              onChange={(e) => updateStop(index, 'name', e.target.value)}
                              placeholder="Stop name"
                              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                            />
                            <Input
                              value={stop.time_needed}
                              onChange={(e) => updateStop(index, 'time_needed', e.target.value)}
                              placeholder="Time needed (e.g., 30 mins)"
                              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <Input
                              type="number"
                              value={stop.distance_from_start}
                              onChange={(e) => updateStop(index, 'distance_from_start', parseInt(e.target.value) || 0)}
                              placeholder="Distance (km)"
                              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                            />
                            <div className="col-span-2">
                              <Input
                                value={stop.description}
                                onChange={(e) => updateStop(index, 'description', e.target.value)}
                                placeholder="Brief description"
                                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                              />
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => removeStop(index)} size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(editingRoute?.stops_along_way || []).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No stops added yet</p>
                )}
              </TabsContent>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">FAQs (for AI Search Optimization)</Label>
                  <Button onClick={addFaq} size="sm" variant="outline" className="border-[#2A2A2A] text-gray-300">
                    <Plus className="w-4 h-4 mr-1" /> Add FAQ
                  </Button>
                </div>
                {(editingRoute?.faqs || []).map((faq, index) => (
                  <Card key={index} className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            placeholder="Question"
                            className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                          />
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            placeholder="Answer"
                            className="bg-[#0A0A0A] border-[#2A2A2A] text-white min-h-[60px]"
                          />
                        </div>
                        <Button onClick={() => removeFaq(index)} size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(editingRoute?.faqs || []).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No FAQs added yet. Use AI Assistant to generate them!</p>
                )}
              </TabsContent>

              {/* Vernacular Tab */}
              <TabsContent value="vernacular" className="space-y-4 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                  <div className="flex-1">
                    <h3 className="text-orange-400 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Vernacular SEO Manager
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Manage content for regional languages. Select a language below to edit.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
                      <SelectTrigger className="w-[140px] bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleTranslate}
                      disabled={isSaving}
                      className="bg-orange-600 hover:bg-orange-700 text-white flex-1 md:flex-none"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Auto-Translate
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 p-4 border border-[#2A2A2A] rounded-lg bg-[#111111]/50">
                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} Short Description (Hero)</Label>
                    <Textarea
                      value={(editingRoute as any)?.[`short_description_${activeLang}`] || ''}
                      onChange={(e) => updateField(`short_description_${activeLang}` as any, e.target.value)}
                      placeholder={`Enter ${LANGUAGES.find(l => l.code === activeLang)?.name} hero description...`}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} Meta Title</Label>
                    <Input
                      value={(editingRoute as any)?.[`meta_title_${activeLang}`] || ''}
                      onChange={(e) => updateField(`meta_title_${activeLang}` as any, e.target.value)}
                      placeholder={`${LANGUAGES.find(l => l.code === activeLang)?.name} meta title`}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} Meta Description</Label>
                    <Textarea
                      value={(editingRoute as any)?.[`meta_description_${activeLang}`] || ''}
                      onChange={(e) => updateField(`meta_description_${activeLang}` as any, e.target.value)}
                      placeholder={`${LANGUAGES.find(l => l.code === activeLang)?.name} meta description`}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} FAQs (JSON)</Label>
                    <div className="text-xs text-gray-500 mb-2">Auto-filled by translation. Edit raw JSON if needed.</div>
                    <Textarea
                      value={JSON.stringify((editingRoute as any)?.[`faq_${activeLang}`] || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const val = JSON.parse(e.target.value);
                          updateField(`faq_${activeLang}` as any, val);
                        } catch (err) {
                          // ignore
                        }
                      }}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white font-mono text-xs min-h-[150px]"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#2A2A2A] text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingRoute?.id ? 'Update Route' : 'Create Route'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

