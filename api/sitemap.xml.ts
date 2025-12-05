/**
 * Vercel Serverless Function: Dynamic Sitemap Generator
 * 
 * This generates a sitemap with all dynamic content from Supabase.
 * Access at: https://staykedarnath.in/api/sitemap.xml
 * 
 * ENVIRONMENT VARIABLES REQUIRED IN VERCEL DASHBOARD:
 * - SUPABASE_URL (your Supabase project URL)
 * - SUPABASE_ANON_KEY (your Supabase anon key)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Vercel uses env vars directly (without VITE_ prefix for serverless)
// Fall back to VITE_ prefixed for compatibility
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const BASE_URL = 'https://staykedarnath.in';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
  image?: { loc: string; title?: string };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set cache headers
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  // Check if we have valid credentials
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials');
    // Return static sitemap if DB is unavailable
    return res.status(200).send(generateStaticSitemap());
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Static pages
  const staticPages: SitemapURL[] = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/stays', changefreq: 'daily', priority: 0.95 },
    { loc: '/packages', changefreq: 'weekly', priority: 0.95 },
    { loc: '/car-rentals', changefreq: 'weekly', priority: 0.9 },
    { loc: '/driver-registration', changefreq: 'monthly', priority: 0.7 },
    { loc: '/blog', changefreq: 'daily', priority: 0.9 },
    { loc: '/attractions', changefreq: 'weekly', priority: 0.85 },
    { loc: '/help', changefreq: 'weekly', priority: 0.8 },
    { loc: '/help/faq', changefreq: 'weekly', priority: 0.85 },
    { loc: '/about', changefreq: 'monthly', priority: 0.6 },
    { loc: '/contact', changefreq: 'monthly', priority: 0.6 },
    { loc: '/partner-with-us', changefreq: 'monthly', priority: 0.5 },
    { loc: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/terms-and-conditions', changefreq: 'yearly', priority: 0.3 },
    { loc: '/cancellation-policy', changefreq: 'yearly', priority: 0.3 },
  ];

  try {
    // Fetch dynamic content in parallel
    // Note: Using correct table names - 'properties' for stays, 'packages' with 'title' field
    const [blogPosts, attractions, helpArticles, packages, properties] = await Promise.all([
      supabase.from('blog_posts').select('slug, updated_at, featured_image, title').eq('published', true),
      supabase.from('attractions').select('slug, updated_at, main_image, name').eq('is_active', true),
      supabase.from('help_articles').select('slug, updated_at').eq('is_published', true),
      supabase.from('packages').select('slug, updated_at, images, title'),
      supabase.from('properties').select('id, updated_at, images, name').eq('is_active', true),
    ]);

    // Build URLs array
    const urls: SitemapURL[] = [...staticPages];

    // Add blog posts
    if (blogPosts.data) {
      blogPosts.data.forEach(post => {
        urls.push({
          loc: `/blog/${post.slug}`,
          lastmod: post.updated_at,
          changefreq: 'weekly',
          priority: 0.7,
          image: post.featured_image ? { loc: post.featured_image, title: post.title } : undefined
        });
      });
    }

    // Add attractions
    if (attractions.data) {
      attractions.data.forEach(attraction => {
        urls.push({
          loc: `/attractions/${attraction.slug}`,
          lastmod: attraction.updated_at,
          changefreq: 'monthly',
          priority: 0.7,
          image: attraction.main_image ? { loc: attraction.main_image, title: attraction.name } : undefined
        });
      });
    }

    // Add help articles
    if (helpArticles.data) {
      helpArticles.data.forEach(article => {
        urls.push({
          loc: `/help/article/${article.slug}`,
          lastmod: article.updated_at,
          changefreq: 'monthly',
          priority: 0.5
        });
      });
    }

    // Add packages
    if (packages.data) {
      packages.data.forEach(pkg => {
        urls.push({
          loc: `/packages/${pkg.slug}`,
          lastmod: pkg.updated_at,
          changefreq: 'weekly',
          priority: 0.8,
          image: pkg.images?.[0] ? { loc: pkg.images[0], title: pkg.title } : undefined
        });
      });
    }

    // Add properties (stays)
    if (properties.data) {
      properties.data.forEach(property => {
        urls.push({
          loc: `/stays/${property.id}`,
          lastmod: property.updated_at,
          changefreq: 'weekly',
          priority: 0.8,
          image: property.images?.[0] ? { loc: property.images[0], title: property.name } : undefined
        });
      });
    }

    // Generate XML
    const xml = generateSitemapXML(urls);
    
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Fall back to static sitemap on error
    return res.status(200).send(generateStaticSitemap());
  }
}

function generateStaticSitemap(): string {
  const staticUrls = [
    { loc: '/', priority: 1.0 },
    { loc: '/stays', priority: 0.95 },
    { loc: '/packages', priority: 0.95 },
    { loc: '/blog', priority: 0.9 },
    { loc: '/attractions', priority: 0.85 },
    { loc: '/help', priority: 0.8 },
    { loc: '/help/faq', priority: 0.85 },
    { loc: '/about', priority: 0.6 },
    { loc: '/contact', priority: 0.6 },
  ];
  
  const urlEntries = staticUrls.map(url => `  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function generateSitemapXML(urls: SitemapURL[]): string {
  const urlEntries = urls.map(url => {
    let entry = `  <url>
    <loc>${BASE_URL}${url.loc}</loc>`;
    
    if (url.lastmod) {
      entry += `
    <lastmod>${new Date(url.lastmod).toISOString().split('T')[0]}</lastmod>`;
    }
    
    entry += `
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;
    
    if (url.image) {
      entry += `
    <image:image>
      <image:loc>${escapeXml(url.image.loc)}</image:loc>`;
      if (url.image.title) {
        entry += `
      <image:title>${escapeXml(url.image.title)}</image:title>`;
      }
      entry += `
    </image:image>`;
    }
    
    entry += `
  </url>`;
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
