import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye, 
  Loader2,
  Search,
  FileText,
  TrendingUp,
  Calendar,
  Star,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BlogEditor from '@/components/admin/BlogEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  views: number;
  reading_time: number | null;
  is_featured: boolean | null;
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  featuredPosts: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export default function BlogManagement() {
  const { postId } = useParams<{ postId: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, published, created_at, updated_at, featured_image, author, category, views, reading_time, is_featured')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name');
    if (data) setCategories(data);
  };

  const stats: BlogStats = useMemo(() => ({
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.published).length,
    draftPosts: posts.filter(p => !p.published).length,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    featuredPosts: posts.filter(p => p.is_featured).length,
  }), [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.author?.toLowerCase().includes(query) ||
        post.category?.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(post => post.category === categoryFilter);
    }
    
    return result;
  }, [posts, searchQuery, categoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== id));
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      if (postId === id) {
        navigate('/admin/blog');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !post.published, updated_at: new Date().toISOString() })
        .eq('id', post.id);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, published: !p.published } : p
      ));
      
      toast({
        title: 'Success',
        description: `Post ${!post.published ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    }
  };

  const toggleFeatured = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_featured: !post.is_featured })
        .eq('id', post.id);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, is_featured: !p.is_featured } : p
      ));
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${slug}`);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (postId) {
    return (
      <div className="container mx-auto py-8">
        <Helmet>
          <title>{postId === 'new' ? 'New Post' : 'Edit Post'} | Admin</title>
        </Helmet>
        <BlogEditor postId={postId} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Helmet>
        <title>Blog Management | Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage your blog posts</p>
        </div>
        <Button onClick={() => navigate('/admin/blog/new')} className="bg-[#0071c2] hover:bg-[#005999]">
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.publishedPosts}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.draftPosts}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.featuredPosts}</p>
              <p className="text-xs text-muted-foreground">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({stats.publishedPosts})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({stats.draftPosts})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({stats.featuredPosts})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderPostsTable(filteredPosts)}
        </TabsContent>

        <TabsContent value="published">
          {renderPostsTable(filteredPosts.filter(post => post.published))}
        </TabsContent>

        <TabsContent value="drafts">
          {renderPostsTable(filteredPosts.filter(post => !post.published))}
        </TabsContent>

        <TabsContent value="featured">
          {renderPostsTable(filteredPosts.filter(post => post.is_featured))}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderPostsTable(postsToRender: BlogPost[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071c2]" />
        </div>
      );
    }

    if (postsToRender.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-xl border">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first blog post'}
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate('/admin/blog/new')} className="bg-[#0071c2] hover:bg-[#005999]">
              <Plus className="h-4 w-4 mr-2" /> Create Post
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postsToRender.map(post => (
              <TableRow key={post.id} className="hover:bg-gray-50">
                <TableCell>
                  {post.featured_image ? (
                    <img 
                      src={post.featured_image} 
                      alt="" 
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{post.title}</span>
                      {post.is_featured && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">/blog/{post.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {post.category ? (
                    <Badge variant="outline">{post.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={post.published 
                    ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                  }>
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{post.views || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {isDeleting === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/blog/${post.id}`)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {post.published && (
                        <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => copyLink(post.slug)}>
                        <Copy className="h-4 w-4 mr-2" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => togglePublish(post)}>
                        {post.published ? (
                          <><XCircle className="h-4 w-4 mr-2" /> Unpublish</>
                        ) : (
                          <><CheckCircle className="h-4 w-4 mr-2" /> Publish</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFeatured(post)}>
                        <Star className={`h-4 w-4 mr-2 ${post.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        {post.is_featured ? 'Unfeature' : 'Feature'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(post.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
