import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Calendar, User, ArrowLeft, Share2, Clock, Eye,
  ChevronRight, BookOpen, Tag, Facebook, Twitter, Linkedin,
  Copy, Check, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import PromoBanner from '@/components/home/PromoBanner';
import { OptimizedImage } from '@/components/OptimizedImage';
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/components/SEO/SchemaMarkup';
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
  featured_image: string | null;
  image_position: string | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  views: number;
  reading_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  featured_image: string | null;
  image_position: string | null;
  reading_time: number | null;
  category: string | null;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [copied, setCopied] = useState(false);

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

      // Increment views
      await supabase
        .from('blog_posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id);

      // Fetch related posts
      const { data: relatedData, error: relatedError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, created_at, featured_image, image_position, reading_time, category')
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

  const sharePost = (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || '';

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      });
    }
  };

  const getDefaultImage = (index: number = 0) => {
    const images = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
    ];
    return images[index % images.length];
  };

  if (isLoading) {
    return (
      <>
        <Nav />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#0071c2]" />
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Post Not Found | StayKedarnath Blog</title>
        </Helmet>
        <Nav />
        <div className="container mx-auto px-4 py-20 text-center">
          <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => navigate('/blog')} className="bg-[#0071c2] hover:bg-[#005999]">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return null;
  }

  // Generate comprehensive schema for AI Search
  const articleSchema = generateArticleSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author || 'StayKedarnath Team',
    datePublished: post.created_at,
    dateModified: post.updated_at,
    featuredImage: post.featured_image || undefined,
    category: post.category || undefined,
    tags: post.tags || undefined,
    readingTime: post.reading_time || undefined
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://staykedarnath.in' },
    { name: 'Blog', url: 'https://staykedarnath.in/blog' },
    { name: post.title, url: `https://staykedarnath.in/blog/${post.slug}` }
  ]);

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | StayKedarnath Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
        <link rel="canonical" href={`https://staykedarnath.in/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta property="og:url" content={`https://staykedarnath.in/blog/${post.slug}`} />
        <meta property="og:site_name" content="StayKedarnath" />
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        {post.author && <meta property="article:author" content={post.author} />}
        {post.category && <meta property="article:section" content={post.category} />}
        {post.tags?.map((tag, i) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.featured_image && <meta name="twitter:image" content={post.featured_image} />}
        
        {/* Article Schema for AI Search */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <Nav />

      {/* Hero Section with Featured Image */}
      <section className="relative bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-900 pt-24 pb-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={post.featured_image || getDefaultImage(0)}
            alt={post.title}
            width={1200}
            height={600}
            priority={true}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-300 truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Category Badge */}
            {post.category && (
              <Badge className="bg-[#FFB700] text-slate-900 hover:bg-[#e5a600] mb-4">
                {post.category}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#0071c2] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{post.author || 'StayKedarnath Team'}</p>
                  <p className="text-xs text-gray-400">Author</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>

              {post.reading_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.reading_time} min read</span>
                </div>
              )}

              {post.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views} views</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="bg-gray-50">
        <div className="container mx-auto px-4 -mt-16 relative z-20">
          <div className="max-w-4xl mx-auto">
            {/* Main Content Card */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Share Buttons - Sticky */}
              <div className="hidden lg:flex flex-col gap-3 fixed left-8 top-1/2 -translate-y-1/2 z-30">
                <span className="text-xs text-gray-500 font-medium text-center mb-1">Share</span>
                <button
                  onClick={() => sharePost('facebook')}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sharePost('twitter')}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sharePost('linkedin')}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-[#0A66C2] hover:text-white transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sharePost('copy')}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-10 lg:p-12">
                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-[#FFB700] pl-4 italic">
                    {post.excerpt}
                  </p>
                )}

                {/* Blog Content */}
                <div
                  className="blog-content prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-5 h-5 text-gray-400" />
                      {post.tags.map(tag => (
                        <Link
                          key={tag}
                          to={`/blog?search=${tag}`}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-[#0071c2] hover:text-white transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Share */}
                <div className="lg:hidden mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Share this article</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => sharePost('facebook')}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition-all"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => sharePost('twitter')}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition-all"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => sharePost('linkedin')}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0A66C2] hover:text-white transition-all"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => sharePost('copy')}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Promo Banner */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <PromoBanner position="blog" />
                </div>
              </div>

              {/* Author Card */}
              <div className="bg-gray-50 px-6 md:px-10 lg:px-12 py-8 border-t border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Written by</p>
                    <h4 className="text-lg font-bold text-gray-900">{post.author || 'StayKedarnath Team'}</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Expert travel guides and spiritual insights for your Kedarnath pilgrimage journey.
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Back Button */}
            <div className="my-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/blog')}
                className="border-gray-300 hover:border-[#0071c2] hover:text-[#0071c2]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
              </Button>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pb-16"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost, index) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <OptimizedImage
                          src={relatedPost.featured_image || getDefaultImage(index)}
                          alt={relatedPost.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: relatedPost.image_position || 'center' }}
                        />
                        {relatedPost.category && (
                          <Badge className="absolute top-3 left-3 bg-[#0071c2]/90 text-white text-xs">
                            {relatedPost.category}
                          </Badge>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#0071c2] transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(relatedPost.created_at)}
                          </span>
                          {relatedPost.reading_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {relatedPost.reading_time} min
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* CTA Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pb-16"
            >
              <div className="bg-gradient-to-br from-[#0071c2] to-[#005999] rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-3">Ready to Start Your Journey?</h3>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                  Let us help you plan the perfect Kedarnath pilgrimage with our curated packages and expert guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    className="bg-[#FFB700] text-slate-900 hover:bg-[#e5a600] font-semibold"
                  >
                    <Link to="/packages">
                      View Packages <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Link to="/help">
                      Get Help <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
