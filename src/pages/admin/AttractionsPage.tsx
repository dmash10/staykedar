import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Save,
  Upload,
  GripVertical,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { AIAttractionAssistant, AttractionData } from '@/components/editor/plugins/AIAttractionAssistant';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const difficultyOptions = ['Easy', 'Moderate', 'Moderate to Difficult', 'Difficult'];
const typeOptions = ['Religious', 'Natural', 'Historical'];

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'Religious',
    description: '',
    short_description: '',
    main_image: '',
    images: [] as string[],
    distance: '',
    time_required: '',
    best_time: '',
    difficulty: 'Easy',
    rating: 4.5,
    tags: '',
    location: '',
    elevation: '',
    is_featured: false,
    is_active: true,
    meta_title: '',
    meta_description: ''
  });

  const [newImageUrl, setNewImageUrl] = useState('');

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

  const openModal = (attraction?: Attraction) => {
    if (attraction) {
      setSelectedAttraction(attraction);
      setFormData({
        name: attraction.name,
        slug: attraction.slug,
        type: attraction.type,
        description: attraction.description,
        short_description: attraction.short_description,
        main_image: attraction.main_image,
        images: attraction.images || [],
        distance: attraction.distance || '',
        time_required: attraction.time_required || '',
        best_time: attraction.best_time || '',
        difficulty: attraction.difficulty,
        rating: attraction.rating,
        tags: (attraction.tags || []).join(', '),
        location: attraction.location || '',
        elevation: attraction.elevation || '',
        is_featured: attraction.is_featured,
        is_active: attraction.is_active,
        meta_title: attraction.meta_title || '',
        meta_description: attraction.meta_description || ''
      });
    } else {
      setSelectedAttraction(null);
      setFormData({
        name: '',
        slug: '',
        type: 'Religious',
        description: '',
        short_description: '',
        main_image: '',
        images: [],
        distance: '',
        time_required: '',
        best_time: '',
        difficulty: 'Easy',
        rating: 4.5,
        tags: '',
        location: '',
        elevation: '',
        is_featured: false,
        is_active: true,
        meta_title: '',
        meta_description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: selectedAttraction ? prev.slug : generateSlug(name)
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const attractionData = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
        description: formData.description,
        short_description: formData.short_description,
        main_image: formData.main_image,
        images: formData.images,
        distance: formData.distance,
        time_required: formData.time_required,
        best_time: formData.best_time,
        difficulty: formData.difficulty,
        rating: formData.rating,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        location: formData.location,
        elevation: formData.elevation,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        meta_title: formData.meta_title || formData.name,
        meta_description: formData.meta_description || formData.short_description
      };

      if (selectedAttraction) {
        const { error } = await supabase
          .from('attractions')
          .update(attractionData)
          .eq('id', selectedAttraction.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Attraction updated successfully' });
      } else {
        const { error } = await supabase
          .from('attractions')
          .insert([attractionData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Attraction created successfully' });
      }

      setIsModalOpen(false);
      fetchAttractions();
    } catch (error: any) {
      console.error('Error saving attraction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save attraction',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
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

  const filteredAttractions = attractions.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout title="Attractions Management">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-400">Manage all attractions and places of interest</p>
        </div>
        <Button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Attraction
        </Button>
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
        <div className="text-center py-12 text-gray-400">
          No attractions found. Click "Add Attraction" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttractions.map((attraction) => (
            <motion.div
              key={attraction.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#111111] rounded-xl overflow-hidden border ${attraction.is_active ? 'border-[#2A2A2A]' : 'border-red-500/30'}`}
            >
              {/* Image */}
              <div className="relative aspect-video">
                <img
                  src={attraction.main_image}
                  alt={attraction.name}
                  className="w-full h-full object-cover"
                />
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
                <h3 className="text-white font-semibold mb-1 line-clamp-1">{attraction.name}</h3>
                <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="line-clamp-1">{attraction.location}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300 text-xs mb-4">
                  <div className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-blue-400" />
                    <span>{attraction.elevation}</span>
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
                    onClick={() => openModal(attraction)}
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
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111111] border-[#2A2A2A] text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedAttraction ? 'Edit Attraction' : 'Add New Attraction'}
              </DialogTitle>
              <AIAttractionAssistant
                onAttractionGenerated={(data: AttractionData) => {
                  console.log('🎯 AI Generated Data Received:', data);
                  console.log('📝 Description length:', data.description?.length);
                  console.log('📝 Description preview:', data.description?.substring(0, 200));

                  // Force immediate update - don't merge with prev
                  setFormData({
                    name: data.name,
                    slug: generateSlug(data.name),
                    short_description: data.short_description,
                    description: data.description, // This should update TiptapEditor
                    type: data.type,
                    difficulty: data.difficulty,
                    location: data.location,
                    elevation: data.elevation,
                    distance: data.distance,
                    time_required: data.time_required,
                    best_time: data.best_time,
                    tags: data.tags.join(', '),
                    main_image: data.main_image,
                    images: data.images,
                    rating: data.rating,
                    meta_title: data.meta_title,
                    meta_description: data.meta_description,
                    is_active: formData.is_active,
                    is_featured: formData.is_featured,
                  });

                  console.log('✅ Form data updated with AI content');
                  toast({ title: 'Success', description: 'Attraction details generated by AI!' });
                }}
                currentData={{
                  name: formData.name,
                  short_description: formData.short_description,
                  description: formData.description,
                  type: formData.type,
                  difficulty: formData.difficulty,
                  location: formData.location,
                  elevation: formData.elevation,
                  distance: formData.distance,
                  time_required: formData.time_required,
                  best_time: formData.best_time,
                  tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                  main_image: formData.main_image,
                  images: formData.images,
                  rating: formData.rating,
                  meta_title: formData.meta_title,
                  meta_description: formData.meta_description,
                }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">Fill in the details manually or use AI Assistant to auto-generate all fields</p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Kedarnath Temple"
                  className="bg-[#1A1A1A] border-[#2A2A2A]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">URL Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="kedarnath-temple"
                  className="bg-[#1A1A1A] border-[#2A2A2A]"
                />
                <p className="text-xs text-gray-500 mt-1">URL: /attractions/{formData.slug || 'your-slug'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Type *</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                      {typeOptions.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Difficulty *</label>
                  <Select value={formData.difficulty} onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v }))}>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                      {difficultyOptions.map(diff => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Short Description *</label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Brief description for cards"
                  className="bg-[#1A1A1A] border-[#2A2A2A]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Description *</label>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
                  <TiptapEditor
                    content={formData.description}
                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                    placeholder="Write about this attraction... Use formatting tools or AI to create rich content!"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Rudraprayag"
                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Elevation</label>
                  <Input
                    value={formData.elevation}
                    onChange={(e) => setFormData(prev => ({ ...prev, elevation: e.target.value }))}
                    placeholder="e.g., 3,583 m"
                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Distance</label>
                  <Input
                    value={formData.distance}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                    placeholder="e.g., 18 km"
                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Time Required</label>
                  <Input
                    value={formData.time_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_required: e.target.value }))}
                    placeholder="e.g., 2-3 hours"
                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Best Time</label>
                  <Input
                    value={formData.best_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, best_time: e.target.value }))}
                    placeholder="e.g., May-Oct"
                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tags (comma separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Temple, Trek, Must Visit"
                  className="bg-[#1A1A1A] border-[#2A2A2A]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Rating</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="bg-[#1A1A1A] border-[#2A2A2A]"
                />
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Main Image URL *</label>
                <Input
                  value={formData.main_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, main_image: e.target.value }))}
                  placeholder="https://..."
                  className="bg-[#1A1A1A] border-[#2A2A2A]"
                />
                {formData.main_image && (
                  <div className="mt-2 rounded-lg overflow-hidden aspect-video">
                    <img src={formData.main_image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Gallery Images</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Add image URL..."
                    className="bg-[#1A1A1A] border-[#2A2A2A]"
                  />
                  <Button onClick={addImage} variant="outline" className="border-[#2A2A2A]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden aspect-video">
                      <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO Fields */}
              <div className="pt-4 border-t border-[#2A2A2A]">
                <h4 className="text-sm font-medium text-gray-300 mb-3">SEO Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Meta Title</label>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="SEO title (defaults to name)"
                      className="bg-[#1A1A1A] border-[#2A2A2A]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Meta Description</label>
                    <Textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="SEO description (defaults to short description)"
                      rows={2}
                      className="bg-[#1A1A1A] border-[#2A2A2A]"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="pt-4 border-t border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                    <span className="text-sm text-gray-300">Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-amber-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                    <span className="text-sm text-gray-300">Featured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#2A2A2A]">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {selectedAttraction ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

