import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User, ArrowRight } from 'lucide-react';

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

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
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

  return (
    <>
      <Helmet>
        <title>Blog | StayKedar</title>
        <meta name="description" content="Read our latest travel guides, tips, and stories about Kedarnath and surrounding areas." />
      </Helmet>
      
      <Nav />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Our Blog</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Travel guides, tips, and stories about Kedarnath and surrounding areas
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">No posts yet</h2>
              <p className="text-muted-foreground">
                Check back soon for new content!
              </p>
            </div>
          ) : (
            <div className="grid gap-10">
              {posts.map((post) => (
                <article key={post.id} className="border-b pb-10">
                  <h2 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <div className="flex items-center mr-6">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>StayKedar Team</span>
                    </div>
                  </div>
                  
                  <p className="mb-4">{post.excerpt}</p>
                  
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/blog/${post.slug}`}>
                      Read More <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
} 