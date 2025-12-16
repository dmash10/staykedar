import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Star,
  Plus,
  X,
  ExternalLink,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Image as ImageIcon,
  MapPin,
  Mountain,
  Clock,
  Calendar,
  Activity,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Info,
  BookOpen,
  TrendingUp,
  HelpCircle,
  Trash2,
  GripVertical
} from 'lucide-react';

// FAQ type
interface FAQ {
  question: string;
  answer: string;
}
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const difficultyOptions = ['Easy', 'Moderate', 'Moderate to Difficult', 'Difficult'];
const typeOptions = ['Religious', 'Natural', 'Historical', 'Adventure'];

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Content Tips Component
const ContentTips = ({ wordCount, hasDescription, hasSeo, hasImages }: {
  wordCount: number;
  hasDescription: boolean;
  hasSeo: boolean;
  hasImages: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTip, setActiveTip] = useState<string>('structure');

  const getWordCountStatus = () => {
    if (wordCount < 200) return { color: 'text-red-400', bg: 'bg-red-500/10', status: 'Too Short', icon: AlertTriangle };
    if (wordCount < 350) return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', status: 'Needs More', icon: AlertTriangle };
    if (wordCount <= 500) return { color: 'text-green-400', bg: 'bg-green-500/10', status: 'Optimal', icon: CheckCircle2 };
    if (wordCount <= 800) return { color: 'text-blue-400', bg: 'bg-blue-500/10', status: 'Good', icon: CheckCircle2 };
    return { color: 'text-orange-400', bg: 'bg-orange-500/10', status: 'Consider Trimming', icon: AlertTriangle };
  };

  const wordStatus = getWordCountStatus();
  const WordIcon = wordStatus.icon;

  const tips = {
    structure: {
      title: 'Content Structure',
      icon: FileText,
      items: [
        { label: 'Overview', desc: '80-100 words - Special vibe & purpose' },
        { label: 'Journey & Planning', desc: '100 words - Route & Best Time' },
        { label: 'Expectations', desc: '80-100 words - Experience & Facilities' },
        { label: 'Highlights', desc: 'Bulleted list of main features' },
        { label: 'FAQs', desc: '4-5 key questions for AI Search' },
      ]
    },
    seo: {
      title: 'SEO Checklist',
      icon: Search,
      items: [
        { label: 'Meta Title', desc: 'Max 60 chars, include location + keyword' },
        { label: 'Meta Description', desc: 'Max 160 chars, action-oriented with CTA' },
        { label: 'Keywords', desc: 'Include primary keyword in first 50 words' },
        { label: 'Heading Hierarchy', desc: 'Use H2 for sections, H3 for FAQs' },
        { label: 'Internal Links', desc: 'Link to related attractions & packages' },
        { label: 'Image Alt Text', desc: 'Descriptive text for all images' },
      ]
    },
    writing: {
      title: 'Writing Tips',
      icon: BookOpen,
      items: [
        { label: 'Be Concise', desc: 'Aim for 350-400 words total' },
        { label: 'Local Insights', desc: 'Add knowledge locals would share' },
        { label: 'Actionable Info', desc: 'Timings, prices, what to carry' },
        { label: 'Honest Assessment', desc: 'Real difficulty, honest warnings' },
        { label: 'Short Paragraphs', desc: '2-3 sentences max' },
        { label: 'Address "You"', desc: 'Write directly to the reader' },
      ]
    },
    cards: {
      title: 'Card Usage',
      icon: Lightbulb,
      items: [
        { label: '💡 Pro Tip', desc: 'Insider knowledge, time/money savers' },
        { label: '⚠️ Warning', desc: 'Safety concerns, weather alerts' },
        { label: '🛣️ Route', desc: 'Specific directions, distances' },
        { label: '☀️ Weather', desc: 'Seasonal variations, expectations' },
        { label: '📝 Note', desc: 'Important but non-critical info' },
        { label: 'Rule', desc: 'Use 1-2 cards max, only if helpful' },
      ]
    }
  };

  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-[#111111] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                <Lightbulb className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-white">Content Guidelines</h3>
                <p className="text-xs text-gray-500">SEO tips & best practices</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Word Count Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${wordStatus.bg}`}>
                <WordIcon className={`w-3.5 h-3.5 ${wordStatus.color}`} />
                <span className={`text-xs font-medium ${wordStatus.color}`}>
                  {wordCount} words • {wordStatus.status}
                </span>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-[#1A1A1A]">
            {/* Status Indicators */}
            <div className="p-4 grid grid-cols-3 gap-3 border-b border-[#1A1A1A]">
              <div className={`flex items-center gap-2 p-2 rounded-lg ${hasDescription ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <FileText className={`w-4 h-4 ${hasDescription ? 'text-green-400' : 'text-red-400'}`} />
                <span className={`text-xs ${hasDescription ? 'text-green-400' : 'text-red-400'}`}>Content</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${hasSeo ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                <Search className={`w-4 h-4 ${hasSeo ? 'text-green-400' : 'text-yellow-400'}`} />
                <span className={`text-xs ${hasSeo ? 'text-green-400' : 'text-yellow-400'}`}>SEO</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${hasImages ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                <ImageIcon className={`w-4 h-4 ${hasImages ? 'text-green-400' : 'text-yellow-400'}`} />
                <span className={`text-xs ${hasImages ? 'text-green-400' : 'text-yellow-400'}`}>Images</span>
              </div>
            </div>

            {/* Tip Tabs */}
            <div className="flex border-b border-[#1A1A1A]">
              {Object.entries(tips).map(([key, tip]) => {
                const Icon = tip.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTip(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${activeTip === key
                      ? 'text-purple-400 bg-purple-500/10 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-[#111111]'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tip.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Tip Content */}
            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {tips[activeTip as keyof typeof tips].items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#111111] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-200">{item.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Word Count */}
            <div className="p-4 border-t border-[#1A1A1A] bg-[#0D0D0D]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Word Count Target</span>
                <span className="text-xs font-medium text-gray-400">350 - 500 words</span>
              </div>
              <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${wordCount < 200 ? 'bg-red-500' :
                    wordCount < 350 ? 'bg-yellow-500' :
                      wordCount <= 500 ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((wordCount / 500) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-600">0</span>
                <span className="text-[10px] text-gray-600">350</span>
                <span className="text-[10px] text-gray-600">500+</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default function AttractionEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
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
    meta_description: '',
    faqs: [] as FAQ[]
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Calculate word count from description
  const wordCount = useMemo(() => {
    if (!formData.description) return 0;
    const text = formData.description
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text ? text.split(' ').filter(w => w.length > 0).length : 0;
  }, [formData.description]);

  // Fetch attraction if editing
  useEffect(() => {
    if (isEditing) {
      fetchAttraction();
    }
  }, [id]);

  const fetchAttraction = async () => {
    try {
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          slug: data.slug,
          type: data.type,
          description: data.description,
          short_description: data.short_description,
          main_image: data.main_image,
          images: data.images || [],
          distance: data.distance || '',
          time_required: data.time_required || '',
          best_time: data.best_time || '',
          difficulty: data.difficulty,
          rating: data.rating,
          tags: (data.tags || []).join(', '),
          location: data.location || '',
          elevation: data.elevation || '',
          is_featured: data.is_featured,
          is_active: data.is_active,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          faqs: data.faqs || []
        });
      }
    } catch (error) {
      console.error('Error fetching attraction:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attraction',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !isEditing ? generateSlug(name) : prev.slug
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
        description: 'Please fill in Name, Slug, and Description',
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
        meta_description: formData.meta_description || formData.short_description,
        faqs: formData.faqs
      };

      if (isEditing) {
        const { error } = await supabase
          .from('attractions')
          .update(attractionData)
          .eq('id', id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Attraction updated successfully' });
      } else {
        const { error } = await supabase
          .from('attractions')
          .insert([attractionData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Attraction created successfully' });
      }

      navigate('/admin/attractions');
    } catch (error) {
      console.error('Error saving attraction:', error);
      const message = error instanceof Error ? error.message : 'Failed to save attraction';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerated = (data: Partial<AttractionData & { faqs?: FAQ[] }>, mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setFormData({
        name: data.name || formData.name,
        slug: data.name ? generateSlug(data.name) : formData.slug,
        short_description: data.short_description || '',
        description: data.description || '',
        type: data.type || 'Religious',
        difficulty: data.difficulty || 'Easy',
        location: data.location || '',
        elevation: data.elevation || '',
        distance: data.distance || '',
        time_required: data.time_required || '',
        best_time: data.best_time || '',
        tags: data.tags?.join(', ') || '',
        main_image: data.main_image || '',
        images: data.images || [],
        rating: data.rating || 4.5,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        faqs: data.faqs || [],
      });
    } else {
      setFormData(prev => ({
        ...prev,
        ...(data.name && { name: data.name, slug: generateSlug(data.name) }),
        ...(data.short_description && { short_description: data.short_description }),
        ...(data.description && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.location && { location: data.location }),
        ...(data.elevation && { elevation: data.elevation }),
        ...(data.distance && { distance: data.distance }),
        ...(data.time_required && { time_required: data.time_required }),
        ...(data.best_time && { best_time: data.best_time }),
        ...(data.tags?.length && { tags: data.tags.join(', ') }),
        ...(data.main_image && { main_image: data.main_image }),
        ...(data.images?.length && { images: data.images }),
        ...(data.rating && { rating: data.rating }),
        ...(data.meta_title && { meta_title: data.meta_title }),
        ...(data.meta_description && { meta_description: data.meta_description }),
        ...(data.faqs?.length && { faqs: data.faqs }),
      }));
    }
  };

  // FAQ management functions
  const addFaq = () => {
    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
      setFormData(prev => ({
        ...prev,
        faqs: [...prev.faqs, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }]
      }));
      setNewFaqQuestion('');
      setNewFaqAnswer('');
    }
  };

  const removeFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => i === index ? { ...faq, [field]: value } : faq)
    }));
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/attractions')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Attractions
          </Button>
          <div className="h-6 w-px bg-[#2A2A2A]" />
          <h1 className="text-xl font-semibold text-white">
            {isEditing ? formData.name || 'Edit Attraction' : 'Create New Attraction'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <Link to={`/attractions/${formData.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
          )}
          <AIAttractionAssistant
            onAttractionGenerated={handleAIGenerated}
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
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update' : 'Create'}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#1A1A1A]">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Kedarnath Temple"
                    className="bg-[#0A0A0A] border-[#2A2A2A] focus:border-blue-500 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">URL Slug *</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="kedarnath-temple"
                    className="bg-[#0A0A0A] border-[#2A2A2A] focus:border-blue-500 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">/attractions/{formData.slug || 'your-slug'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Type *</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
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
                    <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
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
                  placeholder="Brief 2-sentence summary (max 180 chars)"
                  maxLength={180}
                  className="bg-[#0A0A0A] border-[#2A2A2A] focus:border-blue-500 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-600 mt-1">{formData.short_description.length}/180 characters</p>
              </div>
            </div>
          </div>

          {/* Description Editor */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#1A1A1A]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Full Description *
              </h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${wordCount < 1000 ? 'bg-yellow-500/10 text-yellow-400' :
                wordCount <= 2500 ? 'bg-green-500/10 text-green-400' :
                  'bg-orange-500/10 text-orange-400'
                }`}>
                {wordCount} words
              </div>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg overflow-hidden">
              <TiptapEditor
                content={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Write comprehensive content about this attraction. Include: Overview, Spiritual Significance, How to Reach, Best Time to Visit, Essential Tips..."
              />
            </div>
          </div>

          {/* Location & Details */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#1A1A1A]">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" />
              Location & Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Rudraprayag District"
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <Mountain className="w-3 h-3" /> Elevation
                </label>
                <Input
                  value={formData.elevation}
                  onChange={(e) => setFormData(prev => ({ ...prev, elevation: e.target.value }))}
                  placeholder="e.g., 3,583 m"
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Distance
                </label>
                <Input
                  value={formData.distance}
                  onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                  placeholder="e.g., 18 km trek"
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time Required
                </label>
                <Input
                  value={formData.time_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_required: e.target.value }))}
                  placeholder="e.g., 5-6 hours"
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Best Time
                </label>
                <Input
                  value={formData.best_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, best_time: e.target.value }))}
                  placeholder="e.g., May-Oct"
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <Star className="w-3 h-3" /> Rating
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-400 mb-1 block">Tags (comma separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Temple, Trek, Must Visit, Spiritual"
                className="bg-[#0A0A0A] border-[#2A2A2A]"
              />
            </div>
          </div>

          {/* FAQs Section - Critical for AI Search */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#1A1A1A]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                FAQs for AI Search
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.faqs.length >= 5 ? 'bg-green-500/10 text-green-400' :
                  formData.faqs.length >= 3 ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                  {formData.faqs.length}/5+ FAQs
                </span>
              </div>
            </div>

            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-cyan-300">
                <strong>🔍 AI Search Tip:</strong> FAQs help Google AI Overviews, ChatGPT, and Perplexity cite your content.
                Add 5-6 common questions travelers ask. Each answer should be 2-3 sentences with specific details.
              </p>
            </div>

            {/* Existing FAQs */}
            <div className="space-y-3 mb-4">
              {formData.faqs.map((faq, index) => (
                <div key={index} className="bg-[#0A0A0A] rounded-lg p-4 border border-[#2A2A2A]">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Question {index + 1}</label>
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="e.g., Is Deoria Tal safe for beginners?"
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-sm text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Answer</label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          placeholder="Direct, helpful answer in 2-3 sentences..."
                          rows={2}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-sm text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New FAQ */}
            <div className="bg-[#0A0A0A] rounded-lg p-4 border border-dashed border-[#2A2A2A]">
              <p className="text-xs text-gray-500 mb-3">Add New FAQ</p>
              <div className="space-y-2">
                <Input
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Question: e.g., What is the best time to visit?"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-sm text-white placeholder:text-gray-500"
                />
                <Textarea
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="Answer: Start with a direct answer, then add helpful details..."
                  rows={2}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-sm text-white placeholder:text-gray-500"
                />
                <Button
                  onClick={addFaq}
                  disabled={!newFaqQuestion.trim() || !newFaqAnswer.trim()}
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
            </div>

            {/* Suggested FAQ Questions */}
            {formData.faqs.length < 5 && formData.name && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">💡 Suggested questions to add:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    `Is ${formData.name} safe for beginners?`,
                    `What is the best time to visit ${formData.name}?`,
                    `Do I need a permit for ${formData.name}?`,
                    `How to reach ${formData.name} from Rishikesh?`,
                    `Where to stay near ${formData.name}?`,
                    `What to carry for ${formData.name}?`
                  ].filter(q => !formData.faqs.some(faq => faq.question.toLowerCase().includes(q.toLowerCase().slice(0, 20)))).slice(0, 3).map((question, i) => (
                    <button
                      key={i}
                      onClick={() => setNewFaqQuestion(question)}
                      className="text-xs px-2 py-1 bg-[#1A1A1A] text-gray-400 rounded hover:bg-[#2A2A2A] hover:text-white transition-colors"
                    >
                      {question.length > 40 ? question.slice(0, 40) + '...' : question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Content Tips */}
          <ContentTips
            wordCount={wordCount}
            hasDescription={formData.description.length > 100}
            hasSeo={!!formData.meta_title && !!formData.meta_description}
            hasImages={!!formData.main_image}
          />

          {/* Status & Visibility */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#1A1A1A]">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Active</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-300">Featured</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-amber-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#1A1A1A]">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              SEO Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Meta Title</label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title (max 60 chars)"
                  maxLength={60}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-600 mt-1">{formData.meta_title.length}/60</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Meta Description</label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description (max 160 chars)"
                  maxLength={160}
                  rows={3}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-600 mt-1">{formData.meta_description.length}/160</p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#1A1A1A]">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-400" />
              Images
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Main Image URL *</label>
                <Input
                  value={formData.main_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, main_image: e.target.value }))}
                  placeholder="https://..."
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
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
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500"
                  />
                  <Button onClick={addImage} variant="outline" size="sm" className="border-[#2A2A2A]">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

