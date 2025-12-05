import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
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
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  Star,
  Zap,
  Gift,
  AlertCircle,
  Flame,
  Clock,
  Tag,
  Mountain,
  Plane,
  Heart,
  Shield,
  Percent,
  ExternalLink,
  Eye,
  EyeOff,
  Type,
  Bold,
  Italic,
} from 'lucide-react';

// Icon options with preview
const ICONS = [
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles, emoji: '✨' },
  { value: 'flame', label: 'Hot/Fire', icon: Flame, emoji: '🔥' },
  { value: 'gift', label: 'Gift/Offer', icon: Gift, emoji: '🎁' },
  { value: 'tag', label: 'Deal/Price', icon: Tag, emoji: '🏷️' },
  { value: 'calendar', label: 'Date/Event', icon: Calendar, emoji: '📅' },
  { value: 'phone', label: 'Contact', icon: Phone, emoji: '📞' },
  { value: 'star', label: 'Featured', icon: Star, emoji: '⭐' },
  { value: 'zap', label: 'Quick/Fast', icon: Zap, emoji: '⚡' },
  { value: 'alert', label: 'Important', icon: AlertCircle, emoji: '⚠️' },
  { value: 'clock', label: 'Time/Limited', icon: Clock, emoji: '⏰' },
  { value: 'mappin', label: 'Location', icon: MapPin, emoji: '📍' },
  { value: 'mountain', label: 'Trek/Adventure', icon: Mountain, emoji: '🏔️' },
  { value: 'plane', label: 'Travel', icon: Plane, emoji: '✈️' },
  { value: 'heart', label: 'Love/Popular', icon: Heart, emoji: '❤️' },
  { value: 'shield', label: 'Safe/Verified', icon: Shield, emoji: '🛡️' },
  { value: 'percent', label: 'Discount', icon: Percent, emoji: '💯' },
];

// Display modes
const DISPLAY_MODES = [
  { value: 'icon', label: 'Icon + Text', description: 'Colorful icon with text' },
  { value: 'text', label: 'Text Only', description: 'Bold text, no icon' },
];

// Font sizes
const FONT_SIZES = [
  { value: 'sm', label: 'Small', class: 'text-sm' },
  { value: 'base', label: 'Normal', class: 'text-base' },
  { value: 'lg', label: 'Large', class: 'text-lg' },
  { value: 'xl', label: 'Extra Large', class: 'text-xl' },
  { value: '2xl', label: 'Huge', class: 'text-2xl' },
];

// Font weights
const FONT_WEIGHTS = [
  { value: 'light', label: 'Light', class: 'font-light' },
  { value: 'normal', label: 'Normal', class: 'font-normal' },
  { value: 'medium', label: 'Medium', class: 'font-medium' },
  { value: 'semibold', label: 'Semi Bold', class: 'font-semibold' },
  { value: 'bold', label: 'Bold', class: 'font-bold' },
  { value: 'extrabold', label: 'Extra Bold', class: 'font-extrabold' },
];

// Font styles
const FONT_STYLES = [
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Italic' },
  { value: 'uppercase', label: 'UPPERCASE' },
];

interface MarqueeBanner {
  id: string;
  title: string;
  icon: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  subtitle?: string; // Using subtitle to store JSON config
}

interface BannerConfig {
  displayMode: 'icon' | 'text';
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
}

interface FormData {
  title: string;
  icon: string;
  link_url: string;
  displayMode: 'icon' | 'text';
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
}

const DEFAULT_FORM: FormData = {
  title: '',
  icon: 'sparkles',
  link_url: '',
  displayMode: 'icon',
  fontSize: 'base',
  fontWeight: 'medium',
  fontStyle: 'normal',
};

// Parse config from subtitle field
const parseConfig = (subtitle?: string): BannerConfig => {
  try {
    if (subtitle) {
      return JSON.parse(subtitle);
    }
  } catch (e) {}
  return {
    displayMode: 'icon',
    fontSize: 'base',
    fontWeight: 'medium',
    fontStyle: 'normal',
  };
};

export default function MarqueeBannerManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<MarqueeBanner | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch marquee banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['marquee-banners-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, icon, link_url, is_active, display_order, subtitle')
        .eq('position', 'marquee')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as MarqueeBanner[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormData & { id?: string }) => {
      const config: BannerConfig = {
        displayMode: data.displayMode,
        fontSize: data.fontSize,
        fontWeight: data.fontWeight,
        fontStyle: data.fontStyle,
      };

      const bannerData = {
        title: data.title,
        icon: data.icon,
        image_url: '', // Empty for marquee banners
        link_url: data.link_url || null,
        subtitle: JSON.stringify(config), // Store config in subtitle
        position: 'marquee',
        is_active: true,
        display_order: data.id ? undefined : (banners.length + 1),
      };

      if (data.id) {
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banners')
          .insert(bannerData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marquee-banners-admin'] });
      queryClient.invalidateQueries({ queryKey: ['marquee-banners'] });
      setIsModalOpen(false);
      setFormData(DEFAULT_FORM);
      setSelectedBanner(null);
      toast({
        title: selectedBanner ? 'Updated!' : 'Created!',
        description: 'Marquee announcement saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('banners')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marquee-banners-admin'] });
      queryClient.invalidateQueries({ queryKey: ['marquee-banners'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marquee-banners-admin'] });
      queryClient.invalidateQueries({ queryKey: ['marquee-banners'] });
      setIsDeleteDialogOpen(false);
      setSelectedBanner(null);
      toast({
        title: 'Deleted',
        description: 'Announcement removed from marquee.',
      });
    },
  });

  const handleEdit = (banner: MarqueeBanner) => {
    const config = parseConfig(banner.subtitle);
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      icon: banner.icon || 'sparkles',
      link_url: banner.link_url || '',
      displayMode: config.displayMode,
      fontSize: config.fontSize,
      fontWeight: config.fontWeight,
      fontStyle: config.fontStyle,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (banner: MarqueeBanner) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter announcement text',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: selectedBanner?.id,
    });
  };

  const getIconComponent = (iconName: string) => {
    const iconData = ICONS.find(i => i.value === iconName);
    if (iconData) {
      const IconComp = iconData.icon;
      return <IconComp className="w-4 h-4" />;
    }
    return <Sparkles className="w-4 h-4" />;
  };

  const getIconEmoji = (iconName: string) => {
    const iconData = ICONS.find(i => i.value === iconName);
    return iconData?.emoji || '✨';
  };

  const getFontClass = (config: BannerConfig) => {
    const sizeClass = FONT_SIZES.find(f => f.value === config.fontSize)?.class || 'text-base';
    const weightClass = FONT_WEIGHTS.find(f => f.value === config.fontWeight)?.class || 'font-medium';
    const styleClass = config.fontStyle === 'italic' ? 'italic' : config.fontStyle === 'uppercase' ? 'uppercase tracking-wider' : '';
    return `${sizeClass} ${weightClass} ${styleClass}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const activeBanners = banners.filter(b => b.is_active);
  const inactiveBanners = banners.filter(b => !b.is_active);
  
  // Maximum 8 announcements allowed
  const MAX_ITEMS = 8;
  const canAddMore = banners.length < MAX_ITEMS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Marquee Announcements
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Short scrolling messages shown below the hero section
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {banners.length}/{MAX_ITEMS} used
          </span>
          <Button
            onClick={() => {
              setSelectedBanner(null);
              setFormData(DEFAULT_FORM);
              setIsModalOpen(true);
            }}
            disabled={!canAddMore}
            className={canAddMore 
              ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold" 
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            {canAddMore ? 'Add Announcement' : 'Limit Reached'}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400 font-normal">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 overflow-x-auto py-3 scrollbar-hide">
            {activeBanners.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No active announcements. Add one to see preview.</p>
            ) : (
              activeBanners.map((banner) => {
                const config = parseConfig(banner.subtitle);
                return (
                  <div
                    key={banner.id}
                    className="flex items-center gap-3 whitespace-nowrap"
                  >
                    {config.displayMode === 'icon' && (
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                        {getIconComponent(banner.icon)}
                      </span>
                    )}
                    <span className={`text-white ${getFontClass(config)}`}>
                      {banner.title}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 ml-4" />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Announcements */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A] py-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            <CardTitle className="text-white text-sm font-medium">
              Active ({activeBanners.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {activeBanners.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No active announcements yet
            </p>
          ) : (
            <div className="space-y-2">
              {activeBanners.map((banner) => {
                const config = parseConfig(banner.subtitle);
                return (
                  <div
                    key={banner.id}
                    className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors group"
                  >
                    <span className="text-gray-600 text-sm w-6">
                      <GripVertical className="w-4 h-4" />
                    </span>
                    
                    {config.displayMode === 'icon' ? (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                        {getIconComponent(banner.icon)}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-white">
                        <Type className="w-4 h-4" />
                      </span>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-white truncate ${getFontClass(config)}`}>{banner.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-gray-400">
                          {config.displayMode === 'icon' ? 'Icon + Text' : 'Text Only'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-gray-400">
                          {FONT_SIZES.find(f => f.value === config.fontSize)?.label}
                        </span>
                        {banner.link_url && (
                          <span className="text-xs text-blue-400 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(banner)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(banner)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: banner.id, is_active: checked })}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Announcements */}
      {inactiveBanners.length > 0 && (
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A] py-3">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-gray-500" />
              <CardTitle className="text-gray-400 text-sm font-medium">
                Inactive ({inactiveBanners.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {inactiveBanners.map((banner) => {
                const config = parseConfig(banner.subtitle);
                return (
                  <div
                    key={banner.id}
                    className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] opacity-60 group"
                  >
                    <span className="text-gray-600 text-sm w-6">
                      <GripVertical className="w-4 h-4" />
                    </span>
                    
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-400">
                      {config.displayMode === 'icon' ? getIconComponent(banner.icon) : <Type className="w-4 h-4" />}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-sm truncate">{banner.title}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(banner)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(banner)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: banner.id, is_active: checked })}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <h4 className="text-amber-400 font-medium text-sm mb-2">💡 Tips for Great Announcements</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <strong>Text Only mode</strong> - Great for bold, impactful messages</li>
            <li>• <strong>Icon mode</strong> - Adds visual appeal with colorful icons</li>
            <li>• Use <strong>UPPERCASE + Extra Bold</strong> for maximum impact</li>
            <li>• Keep messages short - under 50 characters works best</li>
          </ul>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {selectedBanner ? 'Edit Announcement' : 'New Announcement'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Message */}
            <div className="space-y-2">
              <Label className="text-gray-300">Message *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#1A1A1A] border-[#3A3A3A] text-white placeholder:text-gray-500"
                placeholder="e.g., FLASH SALE - 30% OFF ALL STAYS"
                maxLength={80}
              />
              <p className="text-xs text-gray-500">{formData.title.length}/80 characters</p>
            </div>

            {/* Display Mode */}
            <div className="space-y-2">
              <Label className="text-gray-300">Display Mode</Label>
              <div className="grid grid-cols-2 gap-3">
                {DISPLAY_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, displayMode: mode.value as 'icon' | 'text' })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.displayMode === mode.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-[#3A3A3A] bg-[#1A1A1A] hover:border-[#4A4A4A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {mode.value === 'icon' ? (
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Type className="w-4 h-4 text-white" />
                      )}
                      <span className="text-white font-medium text-sm">{mode.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{mode.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon (only for icon mode) */}
            {formData.displayMode === 'icon' && (
              <div className="space-y-2">
                <Label className="text-gray-300">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(v) => setFormData({ ...formData, icon: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#3A3A3A] text-white">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span>{getIconEmoji(formData.icon)}</span>
                        <span>{ICONS.find(i => i.value === formData.icon)?.label}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#3A3A3A] max-h-[250px]">
                    {ICONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value} className="text-white hover:bg-[#2A2A2A]">
                        <span className="flex items-center gap-2">
                          <span>{icon.emoji}</span>
                          <span>{icon.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Font Options */}
            <div className="grid grid-cols-3 gap-3">
              {/* Font Size */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Size</Label>
                <Select
                  value={formData.fontSize}
                  onValueChange={(v) => setFormData({ ...formData, fontSize: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#3A3A3A] text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#3A3A3A]">
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value} className="text-white hover:bg-[#2A2A2A]">
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Weight */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Weight</Label>
                <Select
                  value={formData.fontWeight}
                  onValueChange={(v) => setFormData({ ...formData, fontWeight: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#3A3A3A] text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#3A3A3A]">
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value} className="text-white hover:bg-[#2A2A2A]">
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Style */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Style</Label>
                <Select
                  value={formData.fontStyle}
                  onValueChange={(v) => setFormData({ ...formData, fontStyle: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#3A3A3A] text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#3A3A3A]">
                    {FONT_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value} className="text-white hover:bg-[#2A2A2A]">
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label className="text-gray-300">Link URL (optional)</Label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="bg-[#1A1A1A] border-[#3A3A3A] text-white placeholder:text-gray-500"
                placeholder="/packages or https://..."
              />
              <p className="text-xs text-gray-500">Where should users go when they click?</p>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-gray-500 text-xs">Preview</Label>
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  {formData.displayMode === 'icon' && (
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                      {getIconComponent(formData.icon)}
                    </span>
                  )}
                  <span className={`text-white ${getFontClass({
                    displayMode: formData.displayMode,
                    fontSize: formData.fontSize,
                    fontWeight: formData.fontWeight,
                    fontStyle: formData.fontStyle,
                  })}`}>
                    {formData.title || 'Your message here...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-[#1A1A1A] border-[#3A3A3A] text-white hover:bg-[#2A2A2A] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {saveMutation.isPending ? 'Saving...' : selectedBanner ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will remove "{selectedBanner?.title}" from the marquee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1A1A1A] border-[#3A3A3A] text-white hover:bg-[#2A2A2A] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedBanner && deleteMutation.mutate(selectedBanner.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
