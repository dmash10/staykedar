/**
 * Sitemap Generator for Programmatic SEO Pages
 * 
 * This script generates a sitemap.xml that fetches cities from Supabase.
 * Falls back to local JSON if Supabase is unavailable.
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://hvvldwgwvrtcdlwehxoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dmxkd2d3dnJ0Y2Rsd2VoeG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjI2MzYsImV4cCI6MjA3NjkzODYzNn0.RNPDPaS8huNjVJmr_3Nb9JGJM0J0jc4IQ3jJ9RM5yms';

// Base URL
const BASE_URL = 'https://staykedarnath.in';

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/attractions', priority: 0.9, changefreq: 'weekly' },
  { path: '/stays', priority: 0.9, changefreq: 'daily' },
  { path: '/packages', priority: 0.9, changefreq: 'weekly' },
  { path: '/car-rentals', priority: 0.9, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/weather', priority: 0.8, changefreq: 'daily' },
  { path: '/contact', priority: 0.6, changefreq: 'monthly' },
  { path: '/help', priority: 0.6, changefreq: 'monthly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/cancellation', priority: 0.4, changefreq: 'yearly' },
  { path: '/partner-with-us', priority: 0.7, changefreq: 'monthly' },
  { path: '/become-a-host', priority: 0.7, changefreq: 'monthly' },
  { path: '/driver-registration', priority: 0.7, changefreq: 'monthly' },
];

// Fetch cities from Supabase
async function fetchCitiesFromSupabase() {
  try {
    console.log('📡 Fetching cities from Supabase...');
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/seo_cities?is_active=eq.true&select=slug,name,is_featured,taxi_rates,updated_at`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}`);
    }

    const cities = await response.json();
    console.log(`✅ Fetched ${cities.length} cities from Supabase`);
    return cities;
  } catch (error) {
    console.log(`⚠️ Supabase fetch failed: ${error.message}`);
    console.log('📂 Falling back to local JSON file...');
    
    // Fallback to local JSON
    const citiesJson = await import('../src/data/cities.json', { with: { type: 'json' } });
    return citiesJson.default;
  }
}

// Fetch blog posts from Supabase
async function fetchBlogPostsFromSupabase() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&select=slug,updated_at`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}

// Fetch attractions from Supabase
async function fetchAttractionsFromSupabase() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/attractions?is_active=eq.true&select=slug,updated_at`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}

// Fetch packages from Supabase
async function fetchPackagesFromSupabase() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/packages?select=slug`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}

// Generate programmatic URLs
async function generateProgrammaticUrls(cities, blogPosts, attractions, packages) {
  const urls = [];
  const today = new Date().toISOString().split('T')[0];

  // For each city, generate multiple page types
  cities.forEach(city => {
    const hasTaxiService = city.taxi_rates?.drop_sonprayag_sedan > 0 || city.base_taxi_price > 0;
    const lastmod = city.updated_at ? city.updated_at.split('T')[0] : today;
    
    // 1. Taxi service pages
    if (hasTaxiService) {
      urls.push({
        path: `/taxi/${city.slug}`,
        priority: city.is_featured ? 0.8 : 0.7,
        changefreq: 'weekly',
        lastmod: lastmod
      });
    }

    // 2. Stays location pages
    urls.push({
      path: `/stays/location/${city.slug}`,
      priority: city.is_featured ? 0.8 : 0.7,
      changefreq: 'weekly',
      lastmod: lastmod
    });

    // 3. Attractions location pages
    urls.push({
      path: `/attractions/in/${city.slug}`,
      priority: city.is_featured ? 0.8 : 0.7,
      changefreq: 'weekly',
      lastmod: lastmod
    });

    // 4. Travel guide pages (pillar content - high priority)
    urls.push({
      path: `/guide/${city.slug}`,
      priority: city.is_featured ? 0.9 : 0.8,
      changefreq: 'weekly',
      lastmod: lastmod
    });

    // 5. Packages from city pages
    urls.push({
      path: `/packages/from/${city.slug}`,
      priority: city.is_featured ? 0.8 : 0.7,
      changefreq: 'weekly',
      lastmod: lastmod
    });
  });

  // Fetch and add routes from Supabase
  try {
    const routesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/seo_routes?select=slug,is_featured,updated_at&is_active=eq.true`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      }
    );
    
    if (routesResponse.ok) {
      const routes = await routesResponse.json();
      routes.forEach(route => {
        urls.push({
          path: `/route/${route.slug}`,
          priority: route.is_featured ? 0.9 : 0.8,
          changefreq: 'weekly',
          lastmod: route.updated_at ? route.updated_at.split('T')[0] : today
        });
      });
      console.log(`🛣️ ROUTES: ${routes.length}`);
    }
  } catch (e) {
    console.log('⚠️ Could not fetch routes:', e.message);
  }

  // Blog posts
  blogPosts.forEach(post => {
    const lastmod = post.updated_at ? post.updated_at.split('T')[0] : today;
    urls.push({
      path: `/blog/${post.slug}`,
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: lastmod
    });
  });

  // Attractions (if you have attraction detail pages)
  attractions.forEach(attraction => {
    const lastmod = attraction.updated_at ? attraction.updated_at.split('T')[0] : today;
    urls.push({
      path: `/attractions/${attraction.slug}`,
      priority: 0.7,
      changefreq: 'monthly',
      lastmod: lastmod
    });
  });

  // Packages
  packages.forEach(pkg => {
    urls.push({
      path: `/packages/${pkg.slug}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: today
    });
  });

  return urls;
}

// Generate XML sitemap
function generateSitemap(allUrls) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  allUrls.forEach(url => {
    xml += `  <url>
    <loc>${BASE_URL}${url.path}</loc>
    <lastmod>${url.lastmod || today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
`;
  });

  xml += '</urlset>';

  return xml;
}

// Print summary
function printSummary(cities, blogPosts, attractions, packages, programmaticUrls) {
  console.log('\n📍 SITEMAP GENERATED:\n');
  
  const taxiPages = programmaticUrls.filter(u => u.path.startsWith('/taxi/'));
  const staysPages = programmaticUrls.filter(u => u.path.startsWith('/stays/location/'));
  const attractionPages = programmaticUrls.filter(u => u.path.startsWith('/attractions/in/'));
  const guidePages = programmaticUrls.filter(u => u.path.startsWith('/guide/'));
  const routePages = programmaticUrls.filter(u => u.path.startsWith('/route/'));
  const packageCityPages = programmaticUrls.filter(u => u.path.startsWith('/packages/from/'));
  
  console.log(`🚗 TAXI PAGES: ${taxiPages.length}`);
  taxiPages.forEach(u => console.log(`   ${BASE_URL}${u.path}`));
  
  console.log(`\n🏨 STAYS PAGES: ${staysPages.length}`);
  staysPages.forEach(u => console.log(`   ${BASE_URL}${u.path}`));

  console.log(`\n🏔️ ATTRACTIONS PAGES: ${attractionPages.length}`);
  attractionPages.forEach(u => console.log(`   ${BASE_URL}${u.path}`));

  console.log(`\n📖 TRAVEL GUIDE PAGES: ${guidePages.length}`);
  guidePages.forEach(u => console.log(`   ${BASE_URL}${u.path}`));

  console.log(`\n🛣️ ROUTE PAGES: ${routePages.length}`);
  routePages.forEach(u => console.log(`   ${BASE_URL}${u.path}`));

  console.log(`\n🎁 PACKAGE CITY PAGES: ${packageCityPages.length}`);
  packageCityPages.forEach(u => console.log(`   ${BASE_URL}${u.path}`));

  if (blogPosts.length > 0) {
    console.log(`\n📝 BLOG POSTS: ${blogPosts.length}`);
  }

  if (attractions.length > 0) {
    console.log(`🎯 ATTRACTION DETAILS: ${attractions.length}`);
  }

  if (packages.length > 0) {
    console.log(`🎫 PACKAGES: ${packages.length}`);
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Cities: ${cities.length}`);
  console.log(`   Pages per City: 5 (taxi, stays, attractions, guide, packages)`);
  console.log(`   Route Pages: ${routePages.length}`);
  console.log(`   Programmatic Pages: ${programmaticUrls.length}`);
  console.log(`   Static Pages: ${staticPages.length}`);
  console.log(`   TOTAL URLs: ${programmaticUrls.length + staticPages.length}`);
}

// Main execution
async function main() {
  console.log('🚀 Generating Sitemap for StayKedarnath.in...\n');

  // Fetch all data from Supabase
  const [cities, blogPosts, attractions, packages] = await Promise.all([
    fetchCitiesFromSupabase(),
    fetchBlogPostsFromSupabase(),
    fetchAttractionsFromSupabase(),
    fetchPackagesFromSupabase(),
  ]);

  // Generate programmatic URLs (now async due to routes fetch)
  const programmaticUrls = await generateProgrammaticUrls(cities, blogPosts, attractions, packages);
  
  // Combine all URLs
  const allUrls = [...staticPages, ...programmaticUrls];

  // Generate sitemap XML
  const sitemapXml = generateSitemap(allUrls);

  // Write to public folder
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXml, 'utf-8');
  
  console.log(`✅ Sitemap saved: ${outputPath}`);
  
  // Print summary
  printSummary(cities, blogPosts, attractions, packages, programmaticUrls);

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Deploy your site');
  console.log('2. Submit to Google Search Console');
  console.log('3. Sitemap URL: https://staykedarnath.in/sitemap.xml');
}

main().catch(console.error);
