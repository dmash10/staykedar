import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  AlertCircle,
  FileText,
  CheckCircle,
  XCircle,
  BarChart3,
  Star,
  ExternalLink,
  Copy,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  featured_image: string | null;
  image_position: string | null;
  author: string | null;
  category: string | null;
  views: number;
  reading_time: number | null;
  is_featured: boolean | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  featuredPosts: number;
}

export default function AdminBlogList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
        .select('id, title, slug, excerpt, published, created_at, updated_at, featured_image, image_position, author, category, views, reading_time, is_featured')
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
        post.category?.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(post => post.category === categoryFilter);
    }
    
    return result;
  }, [posts, searchQuery, categoryFilter]);

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete);

      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== postToDelete));
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
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
      
      toast({
        title: 'Success',
        description: `Post ${!post.is_featured ? 'featured' : 'unfeatured'} successfully`,
      });
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPostsTable = (postsToRender: BlogPost[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (postsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <FileText className="h-12 w-12 mb-4 text-slate-600" />
          <h3 className="text-lg font-medium mb-1">No posts found</h3>
          <p className="text-sm mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first blog post'}
          </p>
          {!searchQuery && (
            <Button 
              onClick={() => navigate('/admin/blog/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Post
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-800">
            <TableRow className="hover:bg-slate-800/80">
              <TableHead className="text-slate-300 w-[50px]"></TableHead>
              <TableHead className="text-slate-300">Post</TableHead>
              <TableHead className="text-slate-300">Category</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-center">Views</TableHead>
              <TableHead className="text-slate-300">Date</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postsToRender.map((post) => (
              <TableRow key={post.id} className="hover:bg-slate-800/40 border-slate-800">
                <TableCell>
                  {post.featured_image ? (
                    <div className="w-14 h-8 rounded overflow-hidden bg-slate-800">
                      <img 
                        src={post.featured_image} 
                        alt="" 
                        className="w-full h-full object-cover"
                        style={{ objectPosition: post.image_position || 'center' }}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-8 rounded bg-slate-800 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[280px]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 truncate">{post.title}</span>
                      {post.is_featured && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">/blog/{post.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {post.category ? (
                    <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300">
                      {post.category}
                    </Badge>
                  ) : (
                    <span className="text-slate-500 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`px-2 py-0.5 text-xs rounded-md ${
                    post.published 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400">
                    <Eye className="w-3 h-3" />
                    <span className="text-sm">{post.views || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.created_at)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-100">
                      <DropdownMenuItem 
                        onClick={() => navigate(`/admin/blog/${post.id}`)}
                        className="hover:bg-slate-700 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {post.published && (
                        <DropdownMenuItem 
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          className="hover:bg-slate-700 cursor-pointer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Live
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => copyLink(post.slug)}
                        className="hover:bg-slate-700 cursor-pointer"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        onClick={() => togglePublish(post)}
                        className="hover:bg-slate-700 cursor-pointer"
                      >
                        {post.published ? (
                          <><XCircle className="h-4 w-4 mr-2" /> Unpublish</>
                        ) : (
                          <><CheckCircle className="h-4 w-4 mr-2" /> Publish</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toggleFeatured(post)}
                        className="hover:bg-slate-700 cursor-pointer"
                      >
                        <Star className={`h-4 w-4 mr-2 ${post.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        {post.is_featured ? 'Unfeature' : 'Feature'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        onClick={() => confirmDelete(post.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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
  };

  return (
    <AdminLayout title="Blog Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
              <p className="text-xs text-slate-400">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.publishedPosts}</p>
              <p className="text-xs text-slate-400">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.draftPosts}</p>
              <p className="text-xs text-slate-400">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.featuredPosts}</p>
              <p className="text-xs text-slate-400">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="pl-9 bg-slate-800 border-slate-700 text-slate-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={() => navigate('/admin/blog/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
            All ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="data-[state=active]:bg-slate-700">
            Published ({stats.publishedPosts})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="data-[state=active]:bg-slate-700">
            Drafts ({stats.draftPosts})
          </TabsTrigger>
          <TabsTrigger value="featured" className="data-[state=active]:bg-slate-700">
            Featured ({stats.featuredPosts})
          </TabsTrigger>
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

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
