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
  DialogTrigger,
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
import { AISEOAssistant, SEOContentData } from '@/components/editor/plugins/AISEOAssistant';
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
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Download,
  Sparkles,
} from 'lucide-react';

interface SEOCity {
  id: string;
  slug: string;
  name: string;
  type: string;
  state: string;
  elevation: string;
  position_on_route: number;
  coordinates: { lat: number; lng: number };
  meta_title: string;
  meta_description: string;
  description: string;
  images: string[];
  connectivity: {
    next_stop: string | null;
    distance_to_next: string | null;
    nearest_airport: string | null;
    nearest_railway: string | null;
  };
  base_taxi_price: number;
  taxi_rates: {
    drop_sonprayag_sedan: number;
    drop_sonprayag_suv: number;
    per_km_rate_plains: number;
    per_km_rate_hills: number;
    min_km_per_day: number;
    driver_allowance: number;
  };
  taxi_tip: string;
  stay_tip: string;
  highlight: string;
  nearby_attractions: string[];
  faqs: Array<{ question: string; answer: string }>;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;

  // Rich Content Fields
  taxi_hero_title?: string;
  stays_hero_title?: string;
  long_description?: string;
  how_to_reach?: string;
  best_time_to_visit?: string;
  weather_info?: string;
  local_food?: string;
  history?: string;
  route_description?: string;

  // Vernacular Content
  description_hi?: string;
  meta_title_hi?: string;
  meta_description_hi?: string;
  faq_hi?: Array<{ question: string; answer: string }>;

  description_ta?: string;
  meta_title_ta?: string;
  meta_description_ta?: string;
  faq_ta?: Array<{ question: string; answer: string }>;

  description_te?: string;
  meta_title_te?: string;
  meta_description_te?: string;
  faq_te?: Array<{ question: string; answer: string }>;

  description_kn?: string;
  meta_title_kn?: string;
  meta_description_kn?: string;
  faq_kn?: Array<{ question: string; answer: string }>;

  description_ml?: string;
  meta_title_ml?: string;
  meta_description_ml?: string;
  faq_ml?: Array<{ question: string; answer: string }>;

  // Char Dham classification
  zone?: string;
  dham?: string;
}

const defaultCity: Partial<SEOCity> = {
  slug: '',
  name: '',
  type: 'City',
  state: 'Uttarakhand',
  elevation: '',
  position_on_route: 0,
  coordinates: { lat: 0, lng: 0 },
  meta_title: '',
  meta_description: '',
  description: '',
  images: [],
  connectivity: {
    next_stop: null,
    distance_to_next: null,
    nearest_airport: null,
    nearest_railway: null,
  },
  base_taxi_price: 0,
  taxi_rates: {
    drop_sonprayag_sedan: 0,
    drop_sonprayag_suv: 0,
    per_km_rate_plains: 14,
    per_km_rate_hills: 18,
    min_km_per_day: 250,
    driver_allowance: 300,
  },
  taxi_tip: '',
  stay_tip: '',
  highlight: '',
  nearby_attractions: [],
  faqs: [],
  is_active: true,
  is_featured: false,

  // Rich Content Defaults
  taxi_hero_title: '',
  stays_hero_title: '',
  long_description: '',
  how_to_reach: '',
  best_time_to_visit: '',
  weather_info: '',
  local_food: '',
  history: '',
  route_description: '',

  // Vernacular Defaults
  description_hi: '', meta_title_hi: '', meta_description_hi: '', faq_hi: [],
  description_ta: '', meta_title_ta: '', meta_description_ta: '', faq_ta: [],
  description_te: '', meta_title_te: '', meta_description_te: '', faq_te: [],
  description_kn: '', meta_title_kn: '', meta_description_kn: '', faq_kn: [],
  description_ml: '', meta_title_ml: '', meta_description_ml: '', faq_ml: [],

  // Char Dham classification
  zone: 'kedarnath-route',
  dham: '',
};

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
] as const;

export default function SEOCitiesPage() {
  const [cities, setCities] = useState<SEOCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<Partial<SEOCity> | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [activeLang, setActiveLang] = useState<typeof LANGUAGES[number]['code']>('hi');
  const [sortField, setSortField] = useState<'position_on_route' | 'name'>('position_on_route');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const { toast } = useToast();

  // Fetch cities
  const fetchCities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_cities')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setCities((data || []) as unknown as SEOCity[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load cities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [sortField, sortOrder]);

  // Generate sitemap XML
  const generateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const baseUrl = 'https://staykedarnath.in';

      // Static pages
      const staticPages = [
        { path: '/', priority: 1.0, changefreq: 'daily' },
        { path: '/about', priority: 0.7, changefreq: 'monthly' },
        { path: '/attractions', priority: 0.9, changefreq: 'weekly' },
        { path: '/stays', priority: 0.9, changefreq: 'daily' },
        { path: '/packages', priority: 0.9, changefreq: 'weekly' },
        { path: '/car-rentals', priority: 0.9, changefreq: 'weekly' },
        { path: '/blog', priority: 0.8, changefreq: 'weekly' },
        { path: '/weather', priority: 0.8, changefreq: 'daily' },
        { path: '/contact', priority: 0.6, changefreq: 'monthly' },
        { path: '/help', priority: 0.6, changefreq: 'monthly' },
        { path: '/terms', priority: 0.3, changefreq: 'yearly' },
        { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
      ];

      // Fetch active cities from Supabase
      const { data: activeCities } = await supabase
        .from('seo_cities')
        .select('slug, is_featured, taxi_rates, updated_at')
        .eq('is_active', true);

      // Fetch blog posts
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('published', true);

      // Fetch packages
      const { data: packages } = await supabase
        .from('packages')
        .select('slug');

      // Build programmatic URLs
      const programmaticUrls: Array<{ path: string; priority: number; changefreq: string; lastmod: string }> = [];

      // City pages (taxi + stays)
      activeCities?.forEach(city => {
        const lastmod = city.updated_at?.split('T')[0] || today;
        const taxiRates = city.taxi_rates as { drop_sonprayag_sedan?: number } | null;
        const hasTaxi = taxiRates?.drop_sonprayag_sedan && taxiRates.drop_sonprayag_sedan > 0;

        if (hasTaxi) {
          programmaticUrls.push({
            path: `/taxi/${city.slug}`,
            priority: city.is_featured ? 0.8 : 0.7,
            changefreq: 'weekly',
            lastmod
          });
        }

        programmaticUrls.push({
          path: `/stays/location/${city.slug}`,
          priority: city.is_featured ? 0.8 : 0.7,
          changefreq: 'weekly',
          lastmod
        });
      });

      // Blog posts
      blogPosts?.forEach(post => {
        programmaticUrls.push({
          path: `/blog/${post.slug}`,
          priority: 0.6,
          changefreq: 'monthly',
          lastmod: post.updated_at?.split('T')[0] || today
        });
      });

      // Packages
      packages?.forEach(pkg => {
        programmaticUrls.push({
          path: `/packages/${pkg.slug}`,
          priority: 0.8,
          changefreq: 'weekly',
          lastmod: today
        });
      });

      // Generate XML
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      [...staticPages, ...programmaticUrls].forEach(url => {
        xml += `  <url>
    <loc>${baseUrl}${url.path}</loc>
    <lastmod>${(url as any).lastmod || today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
`;
      });

      xml += '</urlset>';

      // Download the file
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Sitemap Generated!',
        description: `${staticPages.length + programmaticUrls.length} URLs included. Upload this file to your public folder.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate sitemap',
        variant: 'destructive',
      });
    } finally {
      setGeneratingSitemap(false);
    }
  };

  // Filter cities based on search
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open dialog for new city
  const handleAddCity = () => {
    setEditingCity({ ...defaultCity });
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  // Open dialog for editing
  const handleEditCity = (city: SEOCity) => {
    setEditingCity({ ...city });
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const checkSlugAvailability = async (slug: string, currentId?: string): Promise<boolean> => {
    try {
      let query = supabase.from('seo_cities').select('id').eq('slug', slug);

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

  // Save city (create or update)
  const handleSaveCity = async () => {
    if (!editingCity) return;

    if (!editingCity.slug || !editingCity.name) {
      toast({
        title: 'Validation Error',
        description: 'Slug and Name are required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Check for duplicate slug
      const slugExists = await checkSlugAvailability(editingCity.slug, editingCity.id);
      if (slugExists) {
        toast({
          title: 'Validation Error',
          description: `The slug "${editingCity.slug}" is already in use. Please choose another one.`,
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      if (editingCity.id) {
        // Update existing
        const { error } = await supabase
          .from('seo_cities')
          .update({
            slug: editingCity.slug,
            name: editingCity.name,
            type: editingCity.type,
            state: editingCity.state,
            elevation: editingCity.elevation,
            position_on_route: editingCity.position_on_route,
            coordinates: editingCity.coordinates,
            meta_title: editingCity.meta_title,
            meta_description: editingCity.meta_description,
            description: editingCity.description,
            images: editingCity.images,
            connectivity: editingCity.connectivity,
            base_taxi_price: editingCity.base_taxi_price,
            taxi_rates: editingCity.taxi_rates,
            taxi_tip: editingCity.taxi_tip,
            stay_tip: editingCity.stay_tip,
            highlight: editingCity.highlight,
            nearby_attractions: editingCity.nearby_attractions,
            faqs: editingCity.faqs,
            is_active: editingCity.is_active,
            is_featured: editingCity.is_featured,

            // Rich Content
            taxi_hero_title: editingCity.taxi_hero_title,
            stays_hero_title: editingCity.stays_hero_title,
            long_description: editingCity.long_description,
            how_to_reach: editingCity.how_to_reach,
            best_time_to_visit: editingCity.best_time_to_visit,
            weather_info: editingCity.weather_info,
            local_food: editingCity.local_food,
            history: editingCity.history,
            route_description: editingCity.route_description,
          })
          .eq('id', editingCity.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'City updated successfully' });
      } else {
        // Create new
        const { error } = await supabase
          .from('seo_cities')
          .insert([{
            slug: editingCity.slug,
            name: editingCity.name,
            type: editingCity.type,
            state: editingCity.state,
            elevation: editingCity.elevation,
            position_on_route: editingCity.position_on_route,
            coordinates: editingCity.coordinates,
            meta_title: editingCity.meta_title,
            meta_description: editingCity.meta_description,
            description: editingCity.description,
            images: editingCity.images,
            connectivity: editingCity.connectivity,
            base_taxi_price: editingCity.base_taxi_price,
            taxi_rates: editingCity.taxi_rates,
            taxi_tip: editingCity.taxi_tip,
            stay_tip: editingCity.stay_tip,
            highlight: editingCity.highlight,
            nearby_attractions: editingCity.nearby_attractions,
            faqs: editingCity.faqs,
            is_active: editingCity.is_active,
            is_featured: editingCity.is_featured,

            // Rich Content
            taxi_hero_title: editingCity.taxi_hero_title,
            stays_hero_title: editingCity.stays_hero_title,
            long_description: editingCity.long_description,
            how_to_reach: editingCity.how_to_reach,
            best_time_to_visit: editingCity.best_time_to_visit,
            weather_info: editingCity.weather_info,
            local_food: editingCity.local_food,
            history: editingCity.history,
            route_description: editingCity.route_description,
          }]);

        if (error) throw error;
        toast({ title: 'Success', description: 'City created successfully' });
      }

      setIsDialogOpen(false);
      setEditingCity(null);
      fetchCities();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save city',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete city
  const handleDeleteCity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seo_cities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'City deleted successfully' });
      fetchCities();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete city',
        variant: 'destructive',
      });
    }
  };

  // Toggle active status
  const handleToggleActive = async (city: SEOCity) => {
    try {
      const { error } = await supabase
        .from('seo_cities')
        .update({ is_active: !city.is_active })
        .eq('id', city.id);

      if (error) throw error;
      fetchCities();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (city: SEOCity) => {
    try {
      const { error } = await supabase
        .from('seo_cities')
        .update({ is_featured: !city.is_featured })
        .eq('id', city.id);

      if (error) throw error;
      fetchCities();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update featured status',
        variant: 'destructive',
      });
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (slug: string, type: 'taxi' | 'stays') => {
    const url = `https://staykedarnath.in/${type === 'taxi' ? 'taxi' : 'stays/location'}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: url });
  };

  // Update a field in the editing city
  const updateField = (field: string, value: any) => {
    if (!editingCity) return;
    setEditingCity({ ...editingCity, [field]: value });
  };

  // Update nested field
  const updateNestedField = (parent: string, field: string, value: any) => {
    if (!editingCity) return;
    setEditingCity({
      ...editingCity,
      [parent]: {
        ...(editingCity as any)[parent],
        [field]: value,
      },
    });
  };

  // Add FAQ
  const addFaq = () => {
    if (!editingCity) return;
    const faqs = [...(editingCity.faqs || []), { question: '', answer: '' }];
    setEditingCity({ ...editingCity, faqs });
  };

  // Remove FAQ
  const removeFaq = (index: number) => {
    if (!editingCity) return;
    const faqs = [...(editingCity.faqs || [])];
    faqs.splice(index, 1);
    setEditingCity({ ...editingCity, faqs });
  };

  // Update FAQ
  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    if (!editingCity) return;
    const faqs = [...(editingCity.faqs || [])];
    faqs[index] = { ...faqs[index], [field]: value };
    setEditingCity({ ...editingCity, faqs });
  };

  // AI Translation Handler
  const handleTranslate = async () => {
    if (!editingCity || !editingCity.description) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          text: {
            description: editingCity.description,
            meta_title: editingCity.meta_title,
            meta_description: editingCity.meta_description,
            faqs: editingCity.faqs
          },
          targetLang: activeLang
        }
      });

      if (error) throw error;

      setEditingCity(prev => ({
        ...prev!,
        [`description_${activeLang}`]: data.description,
        [`meta_title_${activeLang}`]: data.meta_title,
        [`meta_description_${activeLang}`]: data.meta_description,
        [`faq_${activeLang}`]: data.faqs
      }));

      toast({ title: 'Translated!', description: `Content auto-translated to ${LANGUAGES.find(l => l.code === activeLang)?.name}.` });
    } catch (error: any) {
      toast({ title: 'Translation Failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="SEO Cities Manager">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Cities</p>
                  <p className="text-2xl font-bold text-white">{cities.length}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Pages</p>
                  <p className="text-2xl font-bold text-white">{cities.filter(c => c.is_active).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Featured</p>
                  <p className="text-2xl font-bold text-white">{cities.filter(c => c.is_featured).length}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">SEO Pages</p>
                  <p className="text-2xl font-bold text-white">{cities.filter(c => c.is_active).length * 2}</p>
                </div>
                <Car className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Taxi + Stays per city</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchCities} className="border-[#2A2A2A]">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateSitemap}
              disabled={generatingSitemap}
              className="border-[#2A2A2A] text-gray-300 hover:text-white"
            >
              {generatingSitemap ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Generate Sitemap
            </Button>
            <Button onClick={handleAddCity} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add City
            </Button>
          </div>
        </div>

        {/* Cities Table */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Programmatic SEO Cities</CardTitle>
            <CardDescription className="text-gray-400">
              Manage cities for auto-generated taxi and stays pages. Each city creates 2 SEO pages automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                      <TableHead
                        className="text-gray-400 cursor-pointer"
                        onClick={() => {
                          if (sortField === 'position_on_route') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('position_on_route');
                            setSortOrder('asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          Route #
                          {sortField === 'position_on_route' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-gray-400 cursor-pointer"
                        onClick={() => {
                          if (sortField === 'name') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('name');
                            setSortOrder('asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          City
                          {sortField === 'name' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Elevation</TableHead>
                      <TableHead className="text-gray-400">Base Price</TableHead>
                      <TableHead className="text-gray-400">FAQs</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Pages</TableHead>
                      <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCities.map((city) => (
                      <TableRow key={city.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                        <TableCell className="text-gray-300 font-mono">
                          {city.position_on_route === -1 ? 'Start' : city.position_on_route}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-white font-medium">{city.name}</p>
                              <p className="text-xs text-gray-500">{city.slug}</p>
                            </div>
                            {city.is_featured && (
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#2A2A2A] text-gray-300">
                            {city.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{city.elevation || '-'}</TableCell>
                        <TableCell className="text-gray-300">
                          {city.base_taxi_price > 0 ? `₹${city.base_taxi_price.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-500/20 text-purple-400 border-0">
                            {city.faqs?.length || 0} FAQs
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={city.is_active}
                              onCheckedChange={() => handleToggleActive(city)}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <span className={`text-xs ${city.is_active ? 'text-green-500' : 'text-gray-500'}`}>
                              {city.is_active ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300"
                              onClick={() => copyToClipboard(city.slug, 'taxi')}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Taxi
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-green-400 hover:text-green-300"
                              onClick={() => copyToClipboard(city.slug, 'stays')}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Stays
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                              onClick={() => handleToggleFeatured(city)}
                            >
                              <Star className={`w-4 h-4 ${city.is_featured ? 'fill-yellow-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                              onClick={() => handleEditCity(city)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Delete City</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    Are you sure you want to delete "{city.name}"? This will remove both the taxi and stays pages.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-[#1A1A1A] border-[#2A2A2A] text-white hover:bg-[#2A2A2A]">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDeleteCity(city.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#111111] border-[#2A2A2A] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-white">
                    {editingCity?.id ? 'Edit City' : 'Add New City'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure all settings for this programmatic SEO page.
                  </DialogDescription>
                </div>
                {/* AI Assistant */}
                <AISEOAssistant
                  contentType="city"
                  currentData={editingCity ? {
                    name: editingCity.name,
                    slug: editingCity.slug,
                    meta_title: editingCity.meta_title,
                    meta_description: editingCity.meta_description,
                    description: editingCity.description,
                    long_description: editingCity.long_description,
                    faqs: editingCity.faqs
                  } : undefined}
                  onContentGenerated={(data, mode) => {
                    if (!editingCity) return;

                    // Merge AI-generated content with current data
                    setEditingCity(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        ...(data.meta_title && { meta_title: data.meta_title }),
                        ...(data.meta_description && { meta_description: data.meta_description }),
                        ...(data.description && { description: data.description }),
                        ...(data.short_description && { description: data.short_description }),
                        ...(data.long_description && { long_description: data.long_description }),
                        ...(data.how_to_reach && { how_to_reach: data.how_to_reach }),
                        ...(data.best_time_to_visit && { best_time_to_visit: data.best_time_to_visit }),
                        ...(data.weather_info && { weather_info: data.weather_info }),
                        ...(data.local_food && { local_food: data.local_food }),
                        ...(data.history && { history: data.history }),
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
                <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600">Basic Info</TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-blue-600">SEO</TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-blue-600">Rich Content</TabsTrigger>
                <TabsTrigger value="taxi" className="data-[state=active]:bg-blue-600">Taxi Rates</TabsTrigger>
                <TabsTrigger value="connectivity" className="data-[state=active]:bg-blue-600">Connectivity</TabsTrigger>
                <TabsTrigger value="faqs" className="data-[state=active]:bg-blue-600">FAQs</TabsTrigger>
                <TabsTrigger value="vernacular" className="data-[state=active]:bg-orange-600">Vernacular</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Slug (URL) *</Label>
                    <Input
                      value={editingCity?.slug || ''}
                      onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="e.g., haridwar"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                    <p className="text-xs text-gray-500">Used in URL: /taxi/{editingCity?.slug || 'slug'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">City Name *</Label>
                    <Input
                      value={editingCity?.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="e.g., Haridwar"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Type</Label>
                    <Select
                      value={editingCity?.type || 'City'}
                      onValueChange={(value) => updateField('type', value)}
                    >
                      <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectItem value="City">City</SelectItem>
                        <SelectItem value="Major Hub">Major Hub</SelectItem>
                        <SelectItem value="Transit Point">Transit Point</SelectItem>
                        <SelectItem value="Religious Site">Religious Site</SelectItem>
                        <SelectItem value="Trekking Base">Trekking Base</SelectItem>
                        <SelectItem value="Airport">Airport</SelectItem>
                        <SelectItem value="Railway Station">Railway Station</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">State</Label>
                    <Input
                      value={editingCity?.state || ''}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="Uttarakhand"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Elevation</Label>
                    <Input
                      value={editingCity?.elevation || ''}
                      onChange={(e) => updateField('elevation', e.target.value)}
                      placeholder="e.g., 314m"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Position on Route</Label>
                    <Input
                      type="number"
                      value={editingCity?.position_on_route || 0}
                      onChange={(e) => updateField('position_on_route', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                    <p className="text-xs text-gray-500">-1 for starting points (Delhi), 1-10 for route sequence</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Highlight Badge</Label>
                    <Input
                      value={editingCity?.highlight || ''}
                      onChange={(e) => updateField('highlight', e.target.value)}
                      placeholder="e.g., Gateway to Char Dham"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Latitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={editingCity?.coordinates?.lat || 0}
                      onChange={(e) => updateNestedField('coordinates', 'lat', parseFloat(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Longitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={editingCity?.coordinates?.lng || 0}
                      onChange={(e) => updateNestedField('coordinates', 'lng', parseFloat(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    value={editingCity?.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Brief description of the city..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingCity?.is_active || false}
                      onCheckedChange={(checked) => updateField('is_active', checked)}
                    />
                    <Label className="text-gray-300">Active (visible on site)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingCity?.is_featured || false}
                      onCheckedChange={(checked) => updateField('is_featured', checked)}
                    />
                    <Label className="text-gray-300">Featured (show on homepage)</Label>
                  </div>
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Meta Title</Label>
                  <Input
                    value={editingCity?.meta_title || ''}
                    onChange={(e) => updateField('meta_title', e.target.value)}
                    placeholder="e.g., Haridwar to Kedarnath Taxi Service | Fare & Route Guide 2026"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                  <p className="text-xs text-gray-500">{(editingCity?.meta_title || '').length}/60 characters</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Meta Description</Label>
                  <Textarea
                    value={editingCity?.meta_description || ''}
                    onChange={(e) => updateField('meta_description', e.target.value)}
                    placeholder="Brief SEO description..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500">{(editingCity?.meta_description || '').length}/160 characters</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Taxi Tip (shown on taxi page)</Label>
                  <Textarea
                    value={editingCity?.taxi_tip || ''}
                    onChange={(e) => updateField('taxi_tip', e.target.value)}
                    placeholder="Travel tip for taxi booking..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Stay Tip (shown on stays page)</Label>
                  <Textarea
                    value={editingCity?.stay_tip || ''}
                    onChange={(e) => updateField('stay_tip', e.target.value)}
                    placeholder="Accommodation tip..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Nearby Attractions (comma separated)</Label>
                  <Input
                    value={(editingCity?.nearby_attractions || []).join(', ')}
                    onChange={(e) => updateField('nearby_attractions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Har Ki Pauri, Mansa Devi Temple, Chandi Devi Temple"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
              </TabsContent>

              {/* Rich Content Tab - For SEO */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                  <p className="text-sm text-blue-300">
                    💡 <strong>SEO Tip:</strong> Add unique content here to make each city page different from others.
                    Google penalizes pages with thin/duplicate content.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Custom Taxi Hero Title</Label>
                    <Input
                      value={(editingCity as any)?.taxi_hero_title || ''}
                      onChange={(e) => updateField('taxi_hero_title', e.target.value)}
                      placeholder="e.g., Best Taxi Service from Haridwar to Kedarnath"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                    <p className="text-xs text-gray-500">Leave empty to use default template</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Custom Stays Hero Title</Label>
                    <Input
                      value={(editingCity as any)?.stays_hero_title || ''}
                      onChange={(e) => updateField('stays_hero_title', e.target.value)}
                      placeholder="e.g., Where to Stay in Haridwar for Kedarnath Trip"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                    <p className="text-xs text-gray-500">Leave empty to use default template</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Long Description (Main Page Content)</Label>
                  <Textarea
                    value={(editingCity as any)?.long_description || ''}
                    onChange={(e) => updateField('long_description', e.target.value)}
                    placeholder="Write 2-3 paragraphs about this city. Include history, significance for pilgrims, and travel tips. This appears on the page and helps with SEO."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[150px]"
                  />
                  <p className="text-xs text-gray-500">{((editingCity as any)?.long_description || '').length} characters (aim for 300-500)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">How to Reach</Label>
                    <Textarea
                      value={(editingCity as any)?.how_to_reach || ''}
                      onChange={(e) => updateField('how_to_reach', e.target.value)}
                      placeholder="Describe how to reach this city by air, rail, and road..."
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Best Time to Visit</Label>
                    <Textarea
                      value={(editingCity as any)?.best_time_to_visit || ''}
                      onChange={(e) => updateField('best_time_to_visit', e.target.value)}
                      placeholder="e.g., May-June and September-October are ideal. Avoid monsoon (July-August)..."
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Weather Info</Label>
                    <Textarea
                      value={(editingCity as any)?.weather_info || ''}
                      onChange={(e) => updateField('weather_info', e.target.value)}
                      placeholder="Describe typical weather conditions..."
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Local Food</Label>
                    <Textarea
                      value={(editingCity as any)?.local_food || ''}
                      onChange={(e) => updateField('local_food', e.target.value)}
                      placeholder="Describe local food options, famous eateries..."
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">History & Significance</Label>
                  <Textarea
                    value={(editingCity as any)?.history || ''}
                    onChange={(e) => updateField('history', e.target.value)}
                    placeholder="Write about the historical and religious significance of this place..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Route Description</Label>
                  <Textarea
                    value={(editingCity as any)?.route_description || ''}
                    onChange={(e) => updateField('route_description', e.target.value)}
                    placeholder="Describe the road conditions, scenic points, and travel experience..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                  />
                </div>
              </TabsContent>

              {/* Taxi Rates Tab */}
              <TabsContent value="taxi" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Base Taxi Price (Legacy)</Label>
                  <Input
                    type="number"
                    value={editingCity?.base_taxi_price || 0}
                    onChange={(e) => updateField('base_taxi_price', parseInt(e.target.value))}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                  <p className="text-xs text-gray-500">Set to 0 for places without taxi service (e.g., Kedarnath)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Sedan Drop to Sonprayag (₹)</Label>
                    <Input
                      type="number"
                      value={editingCity?.taxi_rates?.drop_sonprayag_sedan || 0}
                      onChange={(e) => updateNestedField('taxi_rates', 'drop_sonprayag_sedan', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">SUV Drop to Sonprayag (₹)</Label>
                    <Input
                      type="number"
                      value={editingCity?.taxi_rates?.drop_sonprayag_suv || 0}
                      onChange={(e) => updateNestedField('taxi_rates', 'drop_sonprayag_suv', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Per KM Rate (Plains) ₹</Label>
                    <Input
                      type="number"
                      value={editingCity?.taxi_rates?.per_km_rate_plains || 14}
                      onChange={(e) => updateNestedField('taxi_rates', 'per_km_rate_plains', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Per KM Rate (Hills) ₹</Label>
                    <Input
                      type="number"
                      value={editingCity?.taxi_rates?.per_km_rate_hills || 18}
                      onChange={(e) => updateNestedField('taxi_rates', 'per_km_rate_hills', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Min KM per Day</Label>
                    <Input
                      type="number"
                      value={editingCity?.taxi_rates?.min_km_per_day || 250}
                      onChange={(e) => updateNestedField('taxi_rates', 'min_km_per_day', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Driver Allowance (₹/night)</Label>
                    <Input
                      type="number"
                      value={editingCity?.taxi_rates?.driver_allowance || 300}
                      onChange={(e) => updateNestedField('taxi_rates', 'driver_allowance', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Connectivity Tab */}
              <TabsContent value="connectivity" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Next Stop</Label>
                    <Input
                      value={editingCity?.connectivity?.next_stop || ''}
                      onChange={(e) => updateNestedField('connectivity', 'next_stop', e.target.value || null)}
                      placeholder="e.g., Rishikesh"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Distance to Next</Label>
                    <Input
                      value={editingCity?.connectivity?.distance_to_next || ''}
                      onChange={(e) => updateNestedField('connectivity', 'distance_to_next', e.target.value || null)}
                      placeholder="e.g., 20 km"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nearest Airport</Label>
                    <Input
                      value={editingCity?.connectivity?.nearest_airport || ''}
                      onChange={(e) => updateNestedField('connectivity', 'nearest_airport', e.target.value || null)}
                      placeholder="e.g., Dehradun (Jolly Grant) - 38 km"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nearest Railway</Label>
                    <Input
                      value={editingCity?.connectivity?.nearest_railway || ''}
                      onChange={(e) => updateNestedField('connectivity', 'nearest_railway', e.target.value || null)}
                      placeholder="e.g., Haridwar Junction (RWY)"
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-gray-300">FAQs for AI Overview & Schema</Label>
                    <p className="text-xs text-gray-500 mt-1">These appear in Google AI Overviews and as FAQ schema markup</p>
                  </div>
                  <Button onClick={addFaq} variant="outline" size="sm" className="border-[#2A2A2A]">
                    <Plus className="w-4 h-4 mr-1" />
                    Add FAQ
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {(editingCity?.faqs || []).map((faq, index) => (
                    <Card key={index} className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <Label className="text-gray-400">FAQ #{index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-xs">Question</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            placeholder="e.g., How far is Kedarnath from Haridwar?"
                            className="bg-[#111111] border-[#2A2A2A] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-xs">Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            placeholder="Detailed answer..."
                            className="bg-[#111111] border-[#2A2A2A] text-white min-h-[60px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(editingCity?.faqs || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No FAQs added yet</p>
                      <p className="text-xs">Click "Add FAQ" to add questions for Google AI Overview</p>
                    </div>
                  )}
                </div>
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
                      disabled={saving}
                      className="bg-orange-600 hover:bg-orange-700 text-white flex-1 md:flex-none"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Auto-Translate
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 p-4 border border-[#2A2A2A] rounded-lg bg-[#111111]/50">
                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} Description</Label>
                    <Textarea
                      value={(editingCity as any)?.[`description_${activeLang}`] || ''}
                      onChange={(e) => updateField(`description_${activeLang}`, e.target.value)}
                      placeholder={`Enter ${LANGUAGES.find(l => l.code === activeLang)?.name} description...`}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                      style={{ direction: 'ltr' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} Meta Title</Label>
                    <Input
                      value={(editingCity as any)?.[`meta_title_${activeLang}`] || ''}
                      onChange={(e) => updateField(`meta_title_${activeLang}`, e.target.value)}
                      placeholder={`${LANGUAGES.find(l => l.code === activeLang)?.name} meta title`}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} Meta Description</Label>
                    <Textarea
                      value={(editingCity as any)?.[`meta_description_${activeLang}`] || ''}
                      onChange={(e) => updateField(`meta_description_${activeLang}`, e.target.value)}
                      placeholder={`${LANGUAGES.find(l => l.code === activeLang)?.name} meta description`}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">{LANGUAGES.find(l => l.code === activeLang)?.name} FAQs (JSON)</Label>
                    <div className="text-xs text-gray-500 mb-2">Auto-filled by translation. Edit raw JSON if needed.</div>
                    <Textarea
                      value={JSON.stringify((editingCity as any)?.[`faq_${activeLang}`] || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const val = JSON.parse(e.target.value);
                          updateField(`faq_${activeLang}`, val);
                        } catch (err) {
                          // ignore parse error while typing
                        }
                      }}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white font-mono text-xs min-h-[200px]"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#2A2A2A] text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCity}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {editingCity?.id ? 'Update City' : 'Create City'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

