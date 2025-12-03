import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Save, ArrowLeft, Image as ImageIcon, X, Plus, 
  Eye, Search, Tag, FileText, Settings, Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  views: number;
  reading_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  is_featured: boolean;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export default function BlogEditor({ postId }: { postId?: string }) {
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false,
    featured_image: null,
    author: 'StayKedarnath Team',
    category: null,
    tags: [],
    views: 0,
    reading_time: 5,
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    is_featured: false
  });
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    if (postId && postId !== 'new') {
      loadPost(postId);
    }
  }, [postId]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name');
    if (data) setCategories(data);
  };

  const loadPost = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setPost({
          ...data,
          tags: data.tags || [],
          is_featured: data.is_featured || false
        } as BlogPost);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setPost(prev => ({ ...prev, published: value === 'published' }));
  };

  const generateSlug = () => {
    const slug = post.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    setPost(prev => ({ ...prev, slug }));
  };

  const calculateReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const addTag = () => {
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setPost(prev => ({ ...prev, featured_image: publicUrl }));
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const savePost = async () => {
    if (!editorRef.current) return;
    
    try {
      setIsSaving(true);
      
      const content = editorRef.current.getContent();
      const readingTime = calculateReadingTime(content);
      
      const now = new Date().toISOString();
      const postData = {
        ...post,
        content,
        reading_time: readingTime,
        updated_at: now,
        created_at: post.created_at || now
      };
      
      let result;
      if (postId && postId !== 'new') {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postId);
      } else {
        result = await supabase
          .from('blog_posts')
          .insert([postData])
          .select();
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: postId && postId !== 'new' ? 'Post updated successfully' : 'Post created successfully',
      });
      
      if ((!postId || postId === 'new') && result.data && result.data[0]?.id) {
        navigate(`/admin/blog/${result.data[0].id}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const previewPost = () => {
    if (post.slug) {
      window.open(`/blog/${post.slug}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{postId && postId !== 'new' ? 'Edit Post' : 'New Post'} | Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/blog')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-semibold">
            {postId && postId !== 'new' ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {post.slug && post.published && (
            <Button 
              variant="outline"
              onClick={previewPost}
            >
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
          )}
          <Button 
            onClick={savePost} 
            disabled={isSaving || !post.title}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="w-4 h-4" /> SEO
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={post.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title"
                  className="mt-1 text-lg"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex mt-1">
                    <Input
                      id="slug"
                      name="slug"
                      value={post.slug}
                      onChange={handleInputChange}
                      placeholder="post-url-slug"
                      className="rounded-r-none"
                    />
                    <Button 
                      onClick={generateSlug} 
                      variant="secondary"
                      className="rounded-l-none"
                      type="button"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={post.published ? 'published' : 'draft'} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief description of the post (shown in previews)"
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <div className="mt-1 border rounded-md">
                  {!editorLoaded && (
                    <div className="flex justify-center items-center h-[500px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  <Editor
                    id="content"
                    apiKey="v3rqwaqvrtnmq8onoubsbafegnqulxyk438rogskgv7zo05w"
                    onInit={(evt, editor) => {
                      editorRef.current = editor;
                      setEditorLoaded(true);
                    }}
                    initialValue={post.content}
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 
                        'media', 'searchreplace', 'table', 'visualblocks', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
                        'link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                      content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 16px; line-height: 1.6; }',
                      promotion: false,
                      branding: false,
                      resize: true,
                      statusbar: true,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Image */}
              <div className="border rounded-lg p-4">
                <Label className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4" /> Featured Image
                </Label>
                
                {post.featured_image ? (
                  <div className="relative">
                    <img 
                      src={post.featured_image} 
                      alt="Featured" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setPost(prev => ({ ...prev, featured_image: null }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    {isUploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                )}
                
                <div className="mt-3">
                  <Input
                    placeholder="Or paste image URL"
                    value={post.featured_image || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, featured_image: e.target.value || null }))}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="border rounded-lg p-4">
                <Label>Category</Label>
                <Select 
                  value={post.category || ''} 
                  onValueChange={(value) => setPost(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Author */}
              <div className="border rounded-lg p-4">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={post.author || ''}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  className="mt-1"
                />
              </div>

              {/* Tags */}
              <div className="border rounded-lg p-4">
                <Label className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" /> Tags
                </Label>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured Post</Label>
                  <Switch
                    id="is_featured"
                    checked={post.is_featured}
                    onCheckedChange={(checked) => setPost(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Featured posts appear prominently on the blog homepage
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <div className="max-w-2xl space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Search Engine Optimization</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    value={post.meta_title || ''}
                    onChange={handleInputChange}
                    placeholder="SEO title (defaults to post title)"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(post.meta_title || post.title).length}/60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={post.meta_description || ''}
                    onChange={handleInputChange}
                    placeholder="SEO description (defaults to excerpt)"
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(post.meta_description || post.excerpt).length}/160 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input
                    id="meta_keywords"
                    name="meta_keywords"
                    value={post.meta_keywords || ''}
                    onChange={handleInputChange}
                    placeholder="keyword1, keyword2, keyword3"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated keywords for SEO
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Preview */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Search Preview</h3>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                  {post.meta_title || post.title || 'Post Title'}
                </p>
                <p className="text-green-700 text-sm truncate">
                  staykedarnath.in/blog/{post.slug || 'post-slug'}
                </p>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {post.meta_description || post.excerpt || 'Post description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="max-w-2xl space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Post Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                  <Input
                    id="reading_time"
                    name="reading_time"
                    type="number"
                    min="1"
                    value={post.reading_time || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, reading_time: parseInt(e.target.value) || null }))}
                    placeholder="Auto-calculated on save"
                    className="mt-1 w-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to auto-calculate based on content
                  </p>
                </div>

                {postId && postId !== 'new' && (
                  <div>
                    <Label>Statistics</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="text-2xl font-bold">{post.views || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
