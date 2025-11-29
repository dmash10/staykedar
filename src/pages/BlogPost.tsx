import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import './BlogContent.css';

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

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Post not found');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Post not found');
      }

      setPost(data as BlogPost);

      const { data: relatedData, error: relatedError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, created_at')
        .eq('published', true)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!relatedError) {
        setRelatedPosts(relatedData as RelatedPost[] || []);
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
      if (err instanceof Error && err.message === 'Post not found') {
        setError('The blog post you are looking for does not exist or is not published.');
      } else {
        setError('Failed to load blog post. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || 'Blog Post',
        text: post?.excerpt || '',
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Nav />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-destructive/10 text-destructive p-6 rounded-md text-center">
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p className="mb-6">{error}</p>
              <Button onClick={() => navigate('/blog')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | StayKedar Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <Nav />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
            </Button>
          </div>

          <article>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center justify-between text-sm text-muted-foreground mb-8">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>StayKedar Team</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={sharePost}>
                <Share2 className="h-4 w-4 mr-1" /> Share
              </Button>
            </div>

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {relatedPosts.length > 0 && (
            <div className="border-t pt-10">
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        <Link to={`/blog/${relatedPost.slug}`} className="hover:text-primary transition-colors">
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(relatedPost.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}