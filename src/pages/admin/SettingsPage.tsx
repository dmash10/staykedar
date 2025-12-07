import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings, Save, Loader2, Globe, Mail, Phone, Facebook, Twitter, Instagram,
  Search, Image, Share2, Code, MapPin, Building2, FileText, Download, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Sitemap generation function
async function generateSitemapXML(baseUrl: string, options: {
  includeBlogs: boolean;
  includeAttractions: boolean;
  includePackages: boolean;
}): Promise<string> {
  const urls: { loc: string; lastmod?: string; priority: string; changefreq: string }[] = [];

  // Static pages
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/stays', priority: '0.9', changefreq: 'daily' },
    { path: '/packages', priority: '0.9', changefreq: 'weekly' },
    { path: '/car-rentals', priority: '0.8', changefreq: 'weekly' },
    { path: '/attractions', priority: '0.8', changefreq: 'weekly' },
    { path: '/blog', priority: '0.8', changefreq: 'daily' },
    { path: '/weather', priority: '0.7', changefreq: 'hourly' },
    { path: '/live-status', priority: '0.7', changefreq: 'hourly' },
    { path: '/about', priority: '0.5', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { path: '/help', priority: '0.6', changefreq: 'weekly' },
    { path: '/char-dham', priority: '0.8', changefreq: 'weekly' },
    { path: '/do-dham', priority: '0.8', changefreq: 'weekly' },
    { path: '/badrinath', priority: '0.8', changefreq: 'weekly' },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      priority: page.priority,
      changefreq: page.changefreq
    });
  });

  // Fetch blogs
  if (options.includeBlogs) {
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published');

    blogs?.forEach(blog => {
      urls.push({
        loc: `${baseUrl}/blog/${blog.slug}`,
        lastmod: blog.updated_at,
        priority: '0.7',
        changefreq: 'weekly'
      });
    });
  }

  // Fetch attractions
  if (options.includeAttractions) {
    const { data: attractions } = await supabase
      .from('attractions')
      .select('slug, updated_at')
      .eq('is_active', true);

    attractions?.forEach(attraction => {
      urls.push({
        loc: `${baseUrl}/attractions/${attraction.slug}`,
        lastmod: attraction.updated_at,
        priority: '0.7',
        changefreq: 'weekly'
      });
    });
  }

  // Fetch packages
  if (options.includePackages) {
    const { data: packages } = await supabase
      .from('packages')
      .select('slug, updated_at')
      .eq('is_active', true);

    packages?.forEach(pkg => {
      urls.push({
        loc: `${baseUrl}/packages/${pkg.slug}`,
        lastmod: pkg.updated_at,
        priority: '0.8',
        changefreq: 'weekly'
      });
    });
  }

  // Fetch SEO cities
  const { data: cities } = await supabase
    .from('seo_cities')
    .select('slug, updated_at')
    .eq('is_active', true);

  cities?.forEach(city => {
    urls.push({
      loc: `${baseUrl}/taxi/${city.slug}`,
      lastmod: city.updated_at,
      priority: '0.6',
      changefreq: 'weekly'
    });
    urls.push({
      loc: `${baseUrl}/stays/location/${city.slug}`,
      lastmod: city.updated_at,
      priority: '0.6',
      changefreq: 'weekly'
    });
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

// General Settings Interface
interface SiteSettings {
  siteName: string;
  supportEmail: string;
  phoneNumber: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  maintenanceMode: boolean;
}

// SEO Settings Interface
interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_logo: string;
  site_favicon: string;
  og_image: string;
  og_site_name: string;
  og_locale: string;
  twitter_handle: string;
  twitter_card_type: string;
  google_analytics_id: string;
  google_search_console_verification: string;
  bing_verification: string;
  canonical_base_url: string;
  org_name: string;
  org_phone: string;
  org_email: string;
  org_address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sitemap_enabled: boolean;
  sitemap_include_blogs: boolean;
  sitemap_include_attractions: boolean;
  sitemap_include_packages: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'StayKedar',
  supportEmail: 'support@staykedar.com',
  phoneNumber: '+91 98765 43210',
  socials: {
    facebook: '',
    twitter: '',
    instagram: ''
  },
  maintenanceMode: false
};

const DEFAULT_SEO: SEOSettings = {
  site_title: 'StayKedarnath | Book Kedarnath Stays, Helicopter & Yatra Packages',
  site_description: 'Official Kedarnath booking partner. Book verified stays, helicopter services from ₹2,500, VIP darshan, and Char Dham Yatra packages.',
  site_keywords: 'Kedarnath booking, Kedarnath hotel, Kedarnath helicopter, Char Dham Yatra',
  site_logo: 'https://staykedarnath.in/logo.png',
  site_favicon: '/favicon.ico',
  og_image: 'https://staykedarnath.in/og-image.png',
  og_site_name: 'StayKedarnath',
  og_locale: 'en_IN',
  twitter_handle: '@staykedarnath',
  twitter_card_type: 'summary_large_image',
  google_analytics_id: '',
  google_search_console_verification: '',
  bing_verification: '',
  canonical_base_url: 'https://staykedarnath.in',
  org_name: 'StayKedarnath',
  org_phone: '+91 9027475942',
  org_email: 'support@staykedarnath.in',
  org_address: {
    streetAddress: 'Kedarnath Road',
    addressLocality: 'Gaurikund',
    addressRegion: 'Uttarakhand',
    postalCode: '246471',
    addressCountry: 'IN'
  },
  sitemap_enabled: true,
  sitemap_include_blogs: true,
  sitemap_include_attractions: true,
  sitemap_include_packages: true
};

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [seoData, setSeoData] = useState<SEOSettings>(DEFAULT_SEO);
  const [activeTab, setActiveTab] = useState('general');
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);
  const [sitemapGenerated, setSitemapGenerated] = useState(false);

  // Sitemap generation handler
  const handleGenerateSitemap = async () => {
    setIsGeneratingSitemap(true);
    setSitemapGenerated(false);
    try {
      const xml = await generateSitemapXML(seoData.canonical_base_url, {
        includeBlogs: seoData.sitemap_include_blogs,
        includeAttractions: seoData.sitemap_include_attractions,
        includePackages: seoData.sitemap_include_packages
      });

      // Create download
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSitemapGenerated(true);
      toast({
        title: "Sitemap Generated!",
        description: "Your sitemap.xml has been downloaded. Upload it to your website's public folder.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sitemap: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSitemap(false);
    }
  };

  // Fetch general settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('key', 'global_settings')
        .maybeSingle();

      if (error) throw error;
      return data?.content as unknown as SiteSettings | null;
    }
  });

  // Fetch SEO settings
  const { data: seoSettings, isLoading: seoLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('seo_settings')
        .select('*')
        .eq('page_key', 'global')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SEOSettings | null;
    }
  });

  // Update local state when data loads
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  useEffect(() => {
    if (seoSettings) {
      // Deep merge to ensure nested objects like org_address are not null
      setSeoData(prev => ({
        ...prev,
        ...seoSettings,
        org_address: seoSettings.org_address || prev.org_address || DEFAULT_SEO.org_address
      }));
    }
  }, [seoSettings]);

  // Save general settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: settingsError } = await supabase
        .from('site_content')
        .upsert({
          key: 'global_settings',
          content: newSettings as any
        }, { onConflict: 'key' });

      if (settingsError) throw settingsError;

      await supabase.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: 'update_settings',
        entity_type: 'settings',
        details: newSettings as any
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: "Settings Saved",
        description: "General settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Save SEO settings mutation
  const saveSeoMutation = useMutation({
    mutationFn: async (newSeo: SEOSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Build update object
      const updateData = {
        page_key: 'global',
        site_title: newSeo.site_title || null,
        site_description: newSeo.site_description || null,
        site_keywords: newSeo.site_keywords || null,
        site_logo: newSeo.site_logo || null,
        site_favicon: newSeo.site_favicon || null,
        og_image: newSeo.og_image || null,
        og_site_name: newSeo.og_site_name || null,
        og_locale: newSeo.og_locale || null,
        twitter_handle: newSeo.twitter_handle || null,
        twitter_card_type: newSeo.twitter_card_type || null,
        google_analytics_id: newSeo.google_analytics_id || null,
        google_search_console_verification: newSeo.google_search_console_verification || null,
        bing_verification: newSeo.bing_verification || null,
        canonical_base_url: newSeo.canonical_base_url || null,
        org_name: newSeo.org_name || null,
        org_phone: newSeo.org_phone || null,
        org_email: newSeo.org_email || null,
        org_address: newSeo.org_address || null,
        sitemap_enabled: newSeo.sitemap_enabled ?? true,
        sitemap_include_blogs: newSeo.sitemap_include_blogs ?? true,
        sitemap_include_attractions: newSeo.sitemap_include_attractions ?? true,
        sitemap_include_packages: newSeo.sitemap_include_packages ?? true,
        updated_at: new Date().toISOString()
      };

      console.log('Saving SEO settings:', updateData);

      // Check if row exists
      const { data: existing, error: selectError } = await (supabase as any)
        .from('seo_settings')
        .select('id')
        .eq('page_key', 'global')
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing row:', selectError);
        throw selectError;
      }

      if (existing) {
        // Update existing row
        console.log('Updating existing row:', existing.id);
        const { error: updateError } = await (supabase as any)
          .from('seo_settings')
          .update(updateData)
          .eq('id', existing.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        console.log('Update successful!');
      } else {
        // Insert new row
        console.log('Inserting new row');
        const { error: insertError } = await (supabase as any)
          .from('seo_settings')
          .insert(updateData);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        console.log('Insert successful!');
      }

      // Log activity
      try {
        await (supabase as any).from('admin_activity_logs').insert({
          admin_id: user.id,
          action: 'update_seo_settings',
          entity_type: 'seo',
          details: { updated_fields: Object.keys(updateData) }
        });
      } catch (e) {
        console.log('Activity log failed (non-critical):', e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      queryClient.invalidateQueries({ queryKey: ['seo-settings-public'] });
      toast({
        title: "SEO Settings Saved",
        description: "Your SEO settings have been saved successfully!",
      });
    },
    onError: (error) => {
      console.error('SEO save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save SEO settings: " + error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmitGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(formData);
  };

  const handleSubmitSeo = (e: React.FormEvent) => {
    e.preventDefault();
    saveSeoMutation.mutate(seoData);
  };

  const isLoading = settingsLoading || seoLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A]">
            <TabsTrigger value="general" className="data-[state=active]:bg-orange-600">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-orange-600">
              <Search className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <form onSubmit={handleSubmitGeneral}>
              <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-500" />
                    General Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your website's global configuration and contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Basic Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Site Name</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            value={formData.siteName}
                            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                            className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="StayKedar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#2A2A2A]" />

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Contact Details</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Support Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            value={formData.supportEmail}
                            onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                            className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="support@example.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#2A2A2A]" />

                  {/* Social Media */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Social Media</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Facebook URL</Label>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            value={formData.socials.facebook}
                            onChange={(e) => setFormData({
                              ...formData,
                              socials: { ...formData.socials, facebook: e.target.value }
                            })}
                            className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Twitter URL</Label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            value={formData.socials.twitter}
                            onChange={(e) => setFormData({
                              ...formData,
                              socials: { ...formData.socials, twitter: e.target.value }
                            })}
                            className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Instagram URL</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            value={formData.socials.instagram}
                            onChange={(e) => setFormData({
                              ...formData,
                              socials: { ...formData.socials, instagram: e.target.value }
                            })}
                            className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#2A2A2A]" />

                  {/* System Status */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">System Status</h3>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                      <div className="space-y-0.5">
                        <Label className="text-base text-white">Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">
                          Temporarily disable the public site for maintenance.
                        </p>
                      </div>
                      <Switch
                        checked={formData.maintenanceMode}
                        onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
                      disabled={saveSettingsMutation.isPending}
                    >
                      {saveSettingsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* SEO Settings Tab */}
          <TabsContent value="seo">
            <form onSubmit={handleSubmitSeo}>
              <div className="space-y-6">

                {/* Basic SEO */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-500" />
                      Search Engine Optimization
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Control how your site appears in Google search results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Site Title (appears in search results)</Label>
                        <Input
                          value={seoData.site_title || ''}
                          onChange={(e) => setSeoData({ ...seoData, site_title: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="StayKedarnath | Book Kedarnath Stays..."
                        />
                        <p className="text-xs text-gray-500">Recommended: 50-60 characters</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Meta Description</Label>
                        <Textarea
                          value={seoData.site_description || ''}
                          onChange={(e) => setSeoData({ ...seoData, site_description: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                          placeholder="Official Kedarnath booking partner..."
                        />
                        <p className="text-xs text-gray-500">Recommended: 150-160 characters. Current: {(seoData.site_description || '').length}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Keywords (comma-separated)</Label>
                        <Input
                          value={seoData.site_keywords || ''}
                          onChange={(e) => setSeoData({ ...seoData, site_keywords: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="Kedarnath booking, Kedarnath hotel..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Canonical Base URL</Label>
                        <Input
                          value={seoData.canonical_base_url || ''}
                          onChange={(e) => setSeoData({ ...seoData, canonical_base_url: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="https://staykedarnath.in"
                        />
                      </div>

                      {/* Site Logo Upload */}
                      <div className="space-y-3 pt-4 border-t border-[#2A2A2A]">
                        <Label className="text-gray-300">Site Logo (for Google Knowledge Panel)</Label>
                        <p className="text-xs text-gray-500">
                          Recommended: Square logo, at least 112 x 112 pixels. This appears in Google search results.
                        </p>

                        {/* Logo Preview */}
                        {seoData.site_logo && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1A1A1A]">
                            <img
                              src={seoData.site_logo}
                              alt="Site Logo"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Input
                              value={seoData.site_logo || ''}
                              onChange={(e) => setSeoData({ ...seoData, site_logo: e.target.value })}
                              className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                              placeholder="https://staykedarnath.in/logo.png"
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const originalValue = seoData.site_logo;
                                setSeoData({ ...seoData, site_logo: 'Uploading...' });

                                try {
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `logo-${Date.now()}.${fileExt}`;

                                  const { error: uploadError } = await supabase.storage
                                    .from('seo-assets')
                                    .upload(fileName, file, { upsert: true });

                                  if (uploadError) {
                                    if (uploadError.message.includes('not found')) {
                                      toast({
                                        title: "Storage bucket not found",
                                        description: "Please create 'seo-assets' bucket in Supabase Storage.",
                                        variant: "destructive"
                                      });
                                      setSeoData({ ...seoData, site_logo: originalValue });
                                      return;
                                    }
                                    throw uploadError;
                                  }

                                  const { data: { publicUrl } } = supabase.storage
                                    .from('seo-assets')
                                    .getPublicUrl(fileName);

                                  setSeoData({ ...seoData, site_logo: publicUrl });
                                  toast({
                                    title: "Logo Uploaded!",
                                    description: "Your site logo has been uploaded.",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Upload Failed",
                                    description: (error as Error).message,
                                    variant: "destructive"
                                  });
                                  setSeoData({ ...seoData, site_logo: originalValue });
                                }
                              }}
                            />
                            <div className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer">
                              <Image className="w-4 h-4" />
                              Upload Logo
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Favicon Upload */}
                      <div className="space-y-3 pt-4 border-t border-[#2A2A2A]">
                        <Label className="text-gray-300">Favicon (Browser Tab Icon)</Label>
                        <p className="text-xs text-gray-500">
                          Recommended: Square image, 32x32 or 64x64 pixels. This appears in browser tabs and bookmarks.
                        </p>

                        {/* Favicon Preview */}
                        {seoData.site_favicon && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1A1A1A] p-2">
                            <img
                              src={seoData.site_favicon}
                              alt="Favicon"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Input
                              value={seoData.site_favicon || ''}
                              onChange={(e) => setSeoData({ ...seoData, site_favicon: e.target.value })}
                              className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                              placeholder="/favicon.ico or https://..."
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*,.ico"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const originalValue = seoData.site_favicon;
                                setSeoData({ ...seoData, site_favicon: 'Uploading...' });

                                try {
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `favicon-${Date.now()}.${fileExt}`;

                                  const { error: uploadError } = await supabase.storage
                                    .from('seo-assets')
                                    .upload(fileName, file, { upsert: true });

                                  if (uploadError) {
                                    if (uploadError.message.includes('not found')) {
                                      toast({
                                        title: "Storage bucket not found",
                                        description: "Please create 'seo-assets' bucket in Supabase Storage.",
                                        variant: "destructive"
                                      });
                                      setSeoData({ ...seoData, site_favicon: originalValue });
                                      return;
                                    }
                                    throw uploadError;
                                  }

                                  const { data: { publicUrl } } = supabase.storage
                                    .from('seo-assets')
                                    .getPublicUrl(fileName);

                                  setSeoData({ ...seoData, site_favicon: publicUrl });
                                  toast({
                                    title: "Favicon Uploaded!",
                                    description: "Your favicon has been uploaded. Refresh your page to see it.",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Upload Failed",
                                    description: (error as Error).message,
                                    variant: "destructive"
                                  });
                                  setSeoData({ ...seoData, site_favicon: originalValue });
                                }
                              }}
                            />
                            <div className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer">
                              <Image className="w-4 h-4" />
                              Upload Favicon
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Open Graph */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-green-500" />
                      Social Sharing (Open Graph)
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Control how your site appears when shared on Facebook, LinkedIn, WhatsApp, etc.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* OG Image Upload */}
                    <div className="space-y-3">
                      <Label className="text-gray-300">Social Share Image</Label>
                      <p className="text-xs text-gray-500">
                        Recommended: 1200 x 630 pixels. This appears when your site is shared on social media.
                      </p>

                      {/* Image Preview */}
                      {seoData.og_image && (
                        <div className="relative w-full max-w-md aspect-[1200/630] rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1A1A1A]">
                          <img
                            src={seoData.og_image}
                            alt="OG Image Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Upload Area */}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            value={seoData.og_image || ''}
                            onChange={(e) => setSeoData({ ...seoData, og_image: e.target.value })}
                            className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="https://staykedarnath.in/og-image.png"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // Show loading
                              const originalValue = seoData.og_image;
                              setSeoData({ ...seoData, og_image: 'Uploading...' });

                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `og-image-${Date.now()}.${fileExt}`;

                                const { error: uploadError } = await supabase.storage
                                  .from('seo-assets')
                                  .upload(fileName, file, { upsert: true });

                                if (uploadError) {
                                  // Try creating bucket if it doesn't exist
                                  if (uploadError.message.includes('not found')) {
                                    toast({
                                      title: "Storage bucket not found",
                                      description: "Please create 'seo-assets' bucket in Supabase Storage.",
                                      variant: "destructive"
                                    });
                                    setSeoData({ ...seoData, og_image: originalValue });
                                    return;
                                  }
                                  throw uploadError;
                                }

                                const { data: { publicUrl } } = supabase.storage
                                  .from('seo-assets')
                                  .getPublicUrl(fileName);

                                setSeoData({ ...seoData, og_image: publicUrl });
                                toast({
                                  title: "Image Uploaded!",
                                  description: "Your social share image has been uploaded.",
                                });
                              } catch (error) {
                                toast({
                                  title: "Upload Failed",
                                  description: (error as Error).message,
                                  variant: "destructive"
                                });
                                setSeoData({ ...seoData, og_image: originalValue });
                              }
                            }}
                          />
                          <div className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer">
                            <Image className="w-4 h-4" />
                            Upload Image
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Site Name</Label>
                        <Input
                          value={seoData.og_site_name || ''}
                          onChange={(e) => setSeoData({ ...seoData, og_site_name: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="StayKedarnath"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Locale</Label>
                        <Input
                          value={seoData.og_locale || ''}
                          onChange={(e) => setSeoData({ ...seoData, og_locale: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="en_IN"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Twitter Card */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Twitter className="w-5 h-5 text-sky-500" />
                      Twitter Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Twitter Handle</Label>
                        <Input
                          value={seoData.twitter_handle || ''}
                          onChange={(e) => setSeoData({ ...seoData, twitter_handle: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="@staykedarnath"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Card Type</Label>
                        <select
                          value={seoData.twitter_card_type || 'summary_large_image'}
                          onChange={(e) => setSeoData({ ...seoData, twitter_card_type: e.target.value })}
                          className="w-full h-10 px-3 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] text-white"
                        >
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">Summary Large Image</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics & Verification */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-500" />
                      Analytics & Verification
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Connect your site to Google Analytics and Search Console.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Google Analytics ID</Label>
                        <Input
                          value={seoData.google_analytics_id || ''}
                          onChange={(e) => setSeoData({ ...seoData, google_analytics_id: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Google Search Console Verification</Label>
                        <Input
                          value={seoData.google_search_console_verification || ''}
                          onChange={(e) => setSeoData({ ...seoData, google_search_console_verification: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="verification code"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Organization Schema */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-500" />
                      Business Information (for Google Rich Results)
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      This information appears in Google's Knowledge Panel and rich results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Organization Name</Label>
                        <Input
                          value={seoData.org_name || ''}
                          onChange={(e) => setSeoData({ ...seoData, org_name: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Phone</Label>
                        <Input
                          value={seoData.org_phone || ''}
                          onChange={(e) => setSeoData({ ...seoData, org_phone: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Email</Label>
                        <Input
                          value={seoData.org_email || ''}
                          onChange={(e) => setSeoData({ ...seoData, org_email: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                    </div>

                    <Separator className="bg-[#2A2A2A]" />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Street Address</Label>
                        <Input
                          value={(seoData.org_address || {}).streetAddress || ''}
                          onChange={(e) => setSeoData({
                            ...seoData,
                            org_address: { ...(seoData.org_address || {}), streetAddress: e.target.value }
                          })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">City</Label>
                        <Input
                          value={(seoData.org_address || {}).addressLocality || ''}
                          onChange={(e) => setSeoData({
                            ...seoData,
                            org_address: { ...(seoData.org_address || {}), addressLocality: e.target.value }
                          })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">State/Region</Label>
                        <Input
                          value={(seoData.org_address || {}).addressRegion || ''}
                          onChange={(e) => setSeoData({
                            ...seoData,
                            org_address: { ...(seoData.org_address || {}), addressRegion: e.target.value }
                          })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Postal Code</Label>
                        <Input
                          value={(seoData.org_address || {}).postalCode || ''}
                          onChange={(e) => setSeoData({
                            ...seoData,
                            org_address: { ...(seoData.org_address || {}), postalCode: e.target.value }
                          })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sitemap Settings */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-500" />
                      Sitemap Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure automatic sitemap generation for search engines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                      <div>
                        <Label className="text-white">Enable Sitemap</Label>
                        <p className="text-sm text-gray-500">Generate sitemap.xml automatically</p>
                      </div>
                      <Switch
                        checked={seoData.sitemap_enabled}
                        onCheckedChange={(checked) => setSeoData({ ...seoData, sitemap_enabled: checked })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                        <Label className="text-gray-300">Include Blogs</Label>
                        <Switch
                          checked={seoData.sitemap_include_blogs}
                          onCheckedChange={(checked) => setSeoData({ ...seoData, sitemap_include_blogs: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                        <Label className="text-gray-300">Include Attractions</Label>
                        <Switch
                          checked={seoData.sitemap_include_attractions}
                          onCheckedChange={(checked) => setSeoData({ ...seoData, sitemap_include_attractions: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                        <Label className="text-gray-300">Include Packages</Label>
                        <Switch
                          checked={seoData.sitemap_include_packages}
                          onCheckedChange={(checked) => setSeoData({ ...seoData, sitemap_include_packages: checked })}
                        />
                      </div>
                    </div>

                    {/* Generate Sitemap Button */}
                    <div className="pt-4 border-t border-[#2A2A2A]">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Generate Sitemap</Label>
                          <p className="text-sm text-gray-500">Download sitemap.xml containing all your pages</p>
                        </div>
                        <Button
                          type="button"
                          onClick={handleGenerateSitemap}
                          disabled={isGeneratingSitemap}
                          className={`min-w-[160px] ${sitemapGenerated ? 'bg-green-600 hover:bg-green-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                        >
                          {isGeneratingSitemap ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : sitemapGenerated ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Downloaded!
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download Sitemap
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                    disabled={saveSeoMutation.isPending}
                  >
                    {saveSeoMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save SEO Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}