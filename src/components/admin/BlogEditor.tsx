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
import { Loader2, Save, ArrowLeft } from 'lucide-react';
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
}

export default function BlogEditor({ postId }: { postId?: string }) {
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  // Load post data if editing an existing post
  useEffect(() => {
    if (postId && postId !== 'new') {
      loadPost(postId);
    }
  }, [postId]);

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
        setPost(data as BlogPost);
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

  const savePost = async () => {
    if (!editorRef.current) return;
    
    try {
      setIsSaving(true);
      
      // Get content from TinyMCE
      const content = editorRef.current.getContent();
      
      const now = new Date().toISOString();
      const postData = {
        ...post,
        content,
        updated_at: now,
        created_at: post.created_at || now
      };
      
      let result;
      if (postId && postId !== 'new') {
        // Update existing post
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postId);
      } else {
        // Create new post
        result = await supabase
          .from('blog_posts')
          .insert([postData]);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: postId && postId !== 'new' ? 'Post updated successfully' : 'Post created successfully',
      });
      
      // If it's a new post, redirect to edit page with the new ID
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/blog')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Posts
          </Button>
          <h1 className="text-xl font-semibold">
            {postId && postId !== 'new' ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>
        
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

      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={post.title}
            onChange={handleInputChange}
            placeholder="Post title"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex mt-1">
              <Input
                id="slug"
                name="slug"
                value={post.slug}
                onChange={handleInputChange}
                placeholder="post-slug"
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
                <SelectValue placeholder="Select status" />
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
            placeholder="Brief description of the post"
            className="mt-1 min-h-[100px]"
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
                height: 600,
                menubar: true,
                plugins: [
                  'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 
                  'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'checklist', 'mediaembed', 
                  'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 
                  'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'mentions', 
                  'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 
                  'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
                ],
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
                  'link image media table mergetags | addcomment showcomments | ' +
                  'spellcheckdialog a11ycheck typography | align lineheight | ' +
                  'checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }',
                promotion: false,
                branding: false,
                skin: "oxide",
                icons: "thin",
                resize: true,
                statusbar: true,
                tinycomments_mode: 'embedded',
                tinycomments_author: 'Admin',
                mergetags_list: [
                  { value: 'First.Name', title: 'First Name' },
                  { value: 'Email', title: 'Email' },
                ],
                images_upload_handler: (blobInfo, progress) => {
                  return new Promise((resolve, reject) => {
                    // In a real implementation, you would upload to your server or a storage service
                    // For now, we'll just convert to base64
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
                setup: (editor) => {
                  editor.on('change', () => {
                    // Content is handled in the save function
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 