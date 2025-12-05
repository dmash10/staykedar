import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Mountain,
  Image as ImageIcon,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Attraction {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  short_description: string;
  main_image: string;
  images: string[];
  distance: string;
  time_required: string;
  best_time: string;
  difficulty: string;
  rating: number;
  tags: string[];
  location: string;
  elevation: string;
  is_featured: boolean;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

const typeOptions = ['Religious', 'Natural', 'Historical', 'Adventure'];

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attractions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAttraction) return;

    try {
      const { error } = await supabase
        .from('attractions')
        .delete()
        .eq('id', selectedAttraction.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Attraction deleted successfully' });
      setIsDeleteDialogOpen(false);
      setSelectedAttraction(null);
      fetchAttractions();
    } catch (error) {
      console.error('Error deleting attraction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete attraction',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (attraction: Attraction) => {
    try {
      const { error } = await supabase
        .from('attractions')
        .update({ is_active: !attraction.is_active })
        .eq('id', attraction.id);

      if (error) throw error;
      fetchAttractions();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const toggleFeatured = async (attraction: Attraction) => {
    try {
      const { error } = await supabase
        .from('attractions')
        .update({ is_featured: !attraction.is_featured })
        .eq('id', attraction.id);

      if (error) throw error;
      fetchAttractions();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  // Calculate word count from description
  const getWordCount = (html: string) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').filter(w => w.length > 0).length : 0;
  };

  const filteredAttractions = attractions.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    total: attractions.length,
    active: attractions.filter(a => a.is_active).length,
    featured: attractions.filter(a => a.is_featured).length,
    avgWords: attractions.length > 0 
      ? Math.round(attractions.reduce((sum, a) => sum + getWordCount(a.description), 0) / attractions.length)
      : 0
  };

  return (
    <AdminLayout title="Attractions Management">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-400">Manage all attractions and places of interest</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/attractions/new')} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Attraction
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111111] rounded-xl p-4 border border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Attractions</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl p-4 border border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl p-4 border border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.featured}</p>
              <p className="text-xs text-gray-500">Featured</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl p-4 border border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgWords}</p>
              <p className="text-xs text-gray-500">Avg. Words</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111111] rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search attractions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48 bg-[#1A1A1A] border-[#3A3A3A] text-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#3A3A3A]">
            <SelectItem value="all" className="text-gray-200 focus:bg-[#2A2A2A] focus:text-white">All Types</SelectItem>
            {typeOptions.map(type => (
              <SelectItem key={type} value={type} className="text-gray-200 focus:bg-[#2A2A2A] focus:text-white">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attractions Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading attractions...</div>
      ) : filteredAttractions.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No attractions found</p>
          <Button onClick={() => navigate('/admin/attractions/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Attraction
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttractions.map((attraction) => {
            const wordCount = getWordCount(attraction.description);
            const wordStatus = wordCount < 1000 ? 'text-yellow-400' : wordCount <= 2500 ? 'text-green-400' : 'text-orange-400';
            
            return (
              <motion.div
                key={attraction.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#111111] rounded-xl overflow-hidden border ${attraction.is_active ? 'border-[#2A2A2A]' : 'border-red-500/30'} hover:border-[#3A3A3A] transition-colors group`}
              >
                {/* Image */}
                <div 
                  className="relative aspect-video cursor-pointer"
                  onClick={() => navigate(`/admin/attractions/${attraction.id}`)}
                >
                  <img
                    src={attraction.main_image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
                    alt={attraction.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                      {attraction.type}
                    </span>
                    {attraction.is_featured && (
                      <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 bg-black/50 backdrop-blur-sm text-xs font-medium rounded ${wordStatus}`}>
                      {wordCount} words
                    </span>
                  </div>
                  {!attraction.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded">
                        Inactive
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 bg-[#0A0A0A]">
                  <h3 
                    className="text-white font-semibold mb-1 line-clamp-1 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => navigate(`/admin/attractions/${attraction.id}`)}
                  >
                    {attraction.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span className="line-clamp-1">{attraction.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-300 text-xs mb-4">
                    <div className="flex items-center gap-1">
                      <Mountain className="w-3.5 h-3.5 text-blue-400" />
                      <span>{attraction.elevation || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{(attraction.images?.length || 0) + 1} images</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-amber-400 font-medium">{attraction.rating}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#1A1A1A]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/attractions/${attraction.id}`)}
                      className="flex-1 border-[#3A3A3A] bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(attraction)}
                      className={`border-[#3A3A3A] bg-[#1A1A1A] hover:bg-[#2A2A2A] ${attraction.is_active ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}
                    >
                      {attraction.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeatured(attraction)}
                      className={`border-[#3A3A3A] bg-[#1A1A1A] hover:bg-[#2A2A2A] ${attraction.is_featured ? 'text-amber-400 hover:text-amber-300' : 'text-gray-300 hover:text-white'}`}
                    >
                      <Star className={`w-4 h-4 ${attraction.is_featured ? 'fill-current' : ''}`} />
                    </Button>
                    <Link to={`/attractions/${attraction.slug}`} target="_blank">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#3A3A3A] bg-[#1A1A1A] text-blue-400 hover:bg-[#2A2A2A] hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAttraction(attraction);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Attraction</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedAttraction?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
