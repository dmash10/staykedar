import { useState, useEffect, useRef } from "react";
import { Editor } from '@tinymce/tinymce-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Image as ImageIcon, Link as LinkIcon, Trash2, Edit, Plus, Save, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [published, setPublished] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentPost(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setPublished(false);
    
    // Reset TinyMCE editor
    if (editorRef.current) {
      editorRef.current.setContent("");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setPublished(post.published);
    
    // Set content in TinyMCE
    if (editorRef.current) {
      editorRef.current.setContent(post.content);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setPosts(posts.filter(post => post.id !== id));
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      
      if (currentPost?.id === id) {
        handleCreateNew();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!title || !slug || !editorRef.current) {
      toast({
        title: "Error",
        description: "Title, slug, and content are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      // Get content from TinyMCE
      const content = editorRef.current.getContent();
      const now = new Date().toISOString();
      
      if (currentPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title,
            slug,
            excerpt,
            content,
            published,
            updated_at: now,
          })
          .eq('id', currentPost.id);
        
        if (error) {
          throw error;
        }
        
        setCurrentPost({
          ...currentPost,
          title,
          slug,
          excerpt,
          content,
          published,
          updated_at: now,
        });
        
        // Update posts list
        setPosts(posts.map(post => 
          post.id === currentPost.id 
            ? { ...post, title, slug, excerpt, published, updated_at: now }
            : post
        ));
        
        toast({
          title: "Success",
          description: "Post updated successfully",
        });
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            title,
            slug,
            excerpt,
            content,
            published,
            created_at: now,
            updated_at: now,
          })
          .select();
        
        if (error) {
          throw error;
        }
        
        const newPost = data[0];
        setCurrentPost(newPost);
        setPosts([newPost, ...posts]);
        
        toast({
          title: "Success",
          description: "Post created successfully",
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Manager</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="posts">All Posts ({posts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Post title" 
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input 
                    id="slug" 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="post-slug" 
                  />
                  <Button variant="outline" onClick={generateSlug} type="button">
                    Generate
                  </Button>
                </div>
              </div>
              <div className="w-32">
                <Label htmlFor="published">Status</Label>
                <select 
                  id="published"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={published ? "published" : "draft"}
                  onChange={(e) => setPublished(e.target.value === "published")}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea 
                id="excerpt" 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)} 
                placeholder="Brief description of the post" 
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tinymce-editor">Content</Label>
              <div className="mt-1 border rounded-md">
                {!editorLoaded && (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                <Editor
                  id="tinymce-editor"
                  apiKey="v3rqwaqvrtnmq8onoubsbafegnqulxyk438rogskgv7zo05w"
                  onInit={(evt, editor) => {
                    editorRef.current = editor;
                    setEditorLoaded(true);
                    if (currentPost) {
                      editor.setContent(currentPost.content);
                    }
                  }}
                  initialValue={currentPost?.content || ""}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 
                      'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'checklist', 'mediaembed', 
                      'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 
                      'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'mentions', 
                      'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 
                      'inlinecss', 'markdown'
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
                      'link image media table | align lineheight | ' +
                      'checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }',
                    promotion: false,
                    branding: false,
                    skin: "oxide",
                    resize: true,
                    statusbar: true,
                    setup: (editor) => {
                      editor.on('change', () => {
                        // Content is handled in the save function
                      });
                    },
                    images_upload_handler: (blobInfo, progress) => {
                      return new Promise((resolve, reject) => {
                        // In a real implementation, upload to server or storage service
                        const reader = new FileReader();
                        reader.onload = () => {
                          resolve(reader.result as string);
                        };
                        reader.onerror = () => {
                          reject('Image upload failed');
                        };
                        reader.readAsDataURL(blobInfo.blob());
                      });
                    },
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCreateNew}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-mist">
              <p>No blog posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{post.title}</h3>
                        <p className="text-sm text-mist">
                          {post.published ? 'Published' : 'Draft'} • 
                          {new Date(post.updated_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1">{post.excerpt}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogManager; 