import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Calendar, User, ArrowRight, Search, Clock, Eye,
  ChevronRight, Sparkles, Mountain, MapPin, TrendingUp, BookOpen,
  Tag, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import PromoBanner from '@/components/home/PromoBanner';
import { OptimizedImage } from '@/components/OptimizedImage';

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
  is_featured: boolean | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  post_count: number;
}

const categoryIcons: Record<string, any> = {
  'Map': MapPin,
  'Sparkles': Sparkles,
  'Mountain': Mountain,
  'Home': BookOpen,
  'Cloud': TrendingUp,
  'Newspaper': BookOpen,
};

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [postsRes, categoriesRes] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('blog_categories')
          .select('*')
          .eq('is_active', true)
          .order('name')
      ]);

      if (postsRes.error) throw postsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setPosts(postsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Error fetching blog data:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(post =>
        post.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [posts, activeCategory, searchQuery]);

  const featuredPosts = useMemo(() =>
    posts.filter(p => p.is_featured).slice(0, 3),
    [posts]
  );

  const popularPosts = useMemo(() =>
    [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    [posts]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCategoryChange = (categorySlug: string) => {
    if (categorySlug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categorySlug);
    }
    setSearchParams(searchParams);
  };

  const getDefaultImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    ];
    return images[index % images.length];
  };

  return (
    <>
      <Helmet>
        <title>Blog | StayKedarnath - Travel Guides, Tips & Spiritual Insights</title>
        <meta name="description" content="Discover expert travel guides, spiritual insights, trekking tips, and the latest updates for your Kedarnath pilgrimage. Plan your divine journey with our comprehensive blog." />
        <meta name="keywords" content="Kedarnath blog, travel guide, pilgrimage tips, Char Dham, spiritual journey, trek guide" />
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-900 pt-24 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#0071c2]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FFB700]/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB700]/20 text-[#FFB700] text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Your Kedarnath Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Stories, Guides & <br />
              <span className="text-[#FFB700]">Spiritual Wisdom</span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              Expert travel guides, spiritual insights, and practical tips for your sacred journey to Kedarnath
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles, guides, tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#FFB700] focus:border-transparent text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promo Banner */}
      <PromoBanner position="blog" />

      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-10">

          {/* Featured Posts */}
          {featuredPosts.length > 0 && !searchQuery && activeCategory === 'all' && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#FFB700]" />
                  Featured Stories
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`group relative rounded-2xl overflow-hidden shadow-lg ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                      }`}
                  >
                    <Link to={`/blog/${post.slug}`} className="block">
                      <div className={`relative ${index === 0 ? 'aspect-[16/10]' : 'aspect-video'}`}>
                        <OptimizedImage
                          src={post.featured_image || getDefaultImage(index)}
                          alt={post.title}
                          width={800}
                          height={450}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: post.image_position || 'center' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {post.category && (
                          <Badge className="absolute top-4 left-4 bg-[#FFB700] text-slate-900 hover:bg-[#e5a600]">
                            {post.category}
                          </Badge>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className={`font-bold text-white mb-2 group-hover:text-[#FFB700] transition-colors ${index === 0 ? 'text-2xl' : 'text-lg'
                            }`}>
                            {post.title}
                          </h3>

                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.created_at)}
                            </span>
                            {post.reading_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.reading_time} min read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all'
                    ? 'bg-[#0071c2] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  All Posts
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.slug
                      ? 'bg-[#0071c2] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Posts Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-[#0071c2]" />
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
                  {error}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h2>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'Try a different search term' : 'Check back soon for new content!'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      <Link to={`/blog/${post.slug}`} className="flex flex-col md:flex-row">
                        {/* Image - Fixed 16:9 aspect ratio */}
                        <div className="md:w-72 flex-shrink-0 relative overflow-hidden">
                          <div className="aspect-video w-full">
                            <OptimizedImage
                              src={post.featured_image || getDefaultImage(index)}
                              alt={post.title}
                              width={400}
                              height={225}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              style={{ objectPosition: post.image_position || 'center' }}
                            />
                          </div>
                          {post.category && (
                            <Badge className="absolute top-3 left-3 bg-[#0071c2]/90 text-white text-xs">
                              {post.category}
                            </Badge>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0071c2] transition-colors line-clamp-2">
                              {post.title}
                            </h2>

                            <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                              {post.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {post.author || 'StayKedarnath Team'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(post.created_at)}
                              </span>
                              {post.reading_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {post.reading_time} min
                                </span>
                              )}
                              {post.views > 0 && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  {post.views}
                                </span>
                              )}
                            </div>

                            <span className="text-[#0071c2] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read More <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Promo Banner */}
              <PromoBanner position="sidebar" />

              {/* Popular Posts */}
              {popularPosts.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#FFB700]" />
                    Popular Reads
                  </h3>

                  <div className="space-y-4">
                    {popularPosts.slice(0, 5).map((post, index) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="group flex gap-3 items-start"
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-[#0071c2] group-hover:text-white transition-colors">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#0071c2] transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Eye className="w-3 h-3" /> {post.views || 0} views
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#0071c2]" />
                    Categories
                  </h3>

                  <div className="space-y-2">
                    {categories.map(cat => {
                      const IconComponent = categoryIcons[cat.icon || 'BookOpen'] || BookOpen;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeCategory === cat.slug
                            ? 'bg-[#0071c2] text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <IconComponent className="w-4 h-4" />
                            {cat.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.slug
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-600'
                            }`}>
                            {posts.filter(p => p.category?.toLowerCase() === cat.slug).length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags Cloud */}
              {posts.some(p => p.tags && p.tags.length > 0) && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#FFB700]" />
                    Popular Tags
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 15).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-[#0071c2] hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-[#0071c2] to-[#005999] rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Plan Your Yatra</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Ready to embark on your spiritual journey? We'll help you plan the perfect pilgrimage.
                </p>
                <Button
                  asChild
                  className="w-full bg-[#FFB700] text-slate-900 hover:bg-[#e5a600] font-semibold"
                >
                  <Link to="/packages">
                    View Packages <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
