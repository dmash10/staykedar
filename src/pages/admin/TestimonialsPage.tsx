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
  MessageSquareQuote, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Star,
  MapPin,
  Calendar,
  CheckCircle,
  User,
  Quote
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_location: string;
  customer_avatar: string;
  rating: number;
  title: string;
  content: string;
  trip_type: string;
  travel_date: string;
  is_featured: boolean;
  is_verified: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const DEFAULT_FORM: Partial<Testimonial> = {
  customer_name: '',
  customer_location: '',
  customer_avatar: '',
  rating: 5,
  title: '',
  content: '',
  trip_type: '',
  travel_date: '',
  is_featured: false,
  is_verified: false,
  is_active: true,
  display_order: 0
};

const TRIP_TYPES = [
  'Pilgrimage',
  'Family Trip',
  'Solo Travel',
  'Honeymoon',
  'Char Dham Yatra',
  'Package Tour',
  'Adventure Trip',
  'Group Tour',
  'Other'
];

export default function TestimonialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch testimonials
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Testimonial>) => {
      if (selectedTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', selectedTestimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      setIsModalOpen(false);
      setSelectedTestimonial(null);
      setFormData(DEFAULT_FORM);
      toast({ title: "Saved!", description: "Testimonial saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      setIsDeleteDialogOpen(false);
      setSelectedTestimonial(null);
      toast({ title: "Deleted!", description: "Testimonial deleted successfully." });
    }
  });

  // Toggle mutations
  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase.from('testimonials').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
  });

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData(testimonial);
    setIsModalOpen(true);
  };

  const handleDelete = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  // Filter testimonials
  const filteredTestimonials = testimonials?.filter(t => {
    const matchesSearch = t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === 'all' || t.rating === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });

  // Stats
  const avgRating = testimonials?.length 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0';
  const featuredCount = testimonials?.filter(t => t.is_featured).length || 0;
  const verifiedCount = testimonials?.filter(t => t.is_verified).length || 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MessageSquareQuote className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-white">{testimonials?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-white">{avgRating}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Quote className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-white">{featuredCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-white">{verifiedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-blue-400" />
                Customer Testimonials
              </CardTitle>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search testimonials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-64 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-full md:w-40 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    setSelectedTestimonial(null);
                    setFormData(DEFAULT_FORM);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredTestimonials?.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquareQuote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No testimonials found</h3>
                <p className="text-gray-500">Add your first customer testimonial</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTestimonials?.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className={`p-5 rounded-xl border ${
                      testimonial.is_featured 
                        ? 'border-amber-500/30 bg-amber-500/5' 
                        : 'border-[#2A2A2A] bg-[#0A0A0A]'
                    } ${!testimonial.is_active ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.customer_avatar ? (
                            <img src={testimonial.customer_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            testimonial.customer_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white flex items-center gap-2">
                            {testimonial.customer_name}
                            {testimonial.is_verified && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </h4>
                          {testimonial.customer_location && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {testimonial.customer_location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {testimonial.title && (
                      <h5 className="font-medium text-white mb-2">"{testimonial.title}"</h5>
                    )}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{testimonial.content}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                      <div className="flex items-center gap-3">
                        {testimonial.trip_type && (
                          <Badge variant="outline" className="text-gray-400 border-gray-600">
                            {testimonial.trip_type}
                          </Badge>
                        )}
                        {testimonial.is_featured && (
                          <Badge className="bg-amber-500/20 text-amber-400">Featured</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMutation.mutate({ id: testimonial.id, field: 'is_featured', value: !testimonial.is_featured })}
                          className={testimonial.is_featured ? 'text-amber-400' : 'text-gray-400'}
                        >
                          <Star className={`w-4 h-4 ${testimonial.is_featured ? 'fill-current' : ''}`} />
                        </Button>
                        <Switch
                          checked={testimonial.is_active}
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: testimonial.id, field: 'is_active', value: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(testimonial)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(testimonial)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-blue-400" />
              {selectedTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Customer Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Customer Name *</Label>
                <Input
                  value={formData.customer_name || ''}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Location</Label>
                <Input
                  value={formData.customer_location || ''}
                  onChange={(e) => setFormData({ ...formData, customer_location: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="Delhi, India"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Avatar URL (optional)</Label>
              <Input
                value={formData.customer_avatar || ''}
                onChange={(e) => setFormData({ ...formData, customer_avatar: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-gray-300">Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (formData.rating || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-600 hover:text-amber-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-gray-300">Title</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Amazing Experience!"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label className="text-gray-300">Testimonial Content *</Label>
              <Textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[120px]"
                placeholder="Share the customer's experience..."
              />
            </div>

            {/* Trip Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Trip Type</Label>
                <Select 
                  value={formData.trip_type || ''} 
                  onValueChange={(v) => setFormData({ ...formData, trip_type: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    {TRIP_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Travel Date</Label>
                <Input
                  type="date"
                  value={formData.travel_date || ''}
                  onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            {/* Options */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label className="text-gray-300">Featured</Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                <Switch
                  checked={formData.is_verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
                <Label className="text-gray-300">Verified</Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label className="text-gray-300">Active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Display Order</Label>
              <Input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white w-32"
              />
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
              disabled={saveMutation.isPending || !formData.customer_name || !formData.content}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                selectedTestimonial ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTestimonial && deleteMutation.mutate(selectedTestimonial.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}




