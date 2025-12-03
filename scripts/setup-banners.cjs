const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const professionalBanners = [
    {
        title: 'Winter Special - Kedarnath Yatra 2025',
        subtitle: 'Book now and save up to 30% on all pilgrimage packages',
        position: 'homepage',
        link_url: '/packages',
        link_text: 'View Packages',
        is_active: true,
        display_order: 1,
        target_devices: ['desktop', 'mobile', 'tablet'],
        target_pages: ['*'],
        background_color: '#0071c2',
        text_color: '#ffffff'
    },
    {
        title: 'Early Bird Discount - Plan Ahead',
        subtitle: 'Reserve your spot early and get exclusive deals on Char Dham Yatra',
        position: 'hero',
        link_url: '/packages',
        link_text: 'Explore Packages',
        is_active: true,
        display_order: 1,
        target_devices: ['desktop', 'mobile', 'tablet'],
        target_pages: ['/', '/packages'],
        background_color: '#003580',
        text_color: '#ffffff'
    },
    {
        title: 'Complete Char Dham Package Available',
        subtitle: 'Experience the divine journey with our premium all-inclusive packages',
        position: 'package',
        link_url: '/packages',
        link_text: 'Learn More',
        is_active: true,
        display_order: 1,
        target_devices: ['desktop', 'mobile', 'tablet'],
        target_pages: ['/packages*'],
        background_color: '#1a73e8',
        text_color: '#ffffff'
    },
    {
        title: 'Travel Tips & Essential Guides',
        subtitle: 'Read our comprehensive blog for complete travel preparation tips',
        position: 'blog',
        link_url: '/blog',
        link_text: 'Read Articles',
        is_active: true,
        display_order: 1,
        target_devices: ['desktop', 'mobile', 'tablet'],
        target_pages: ['/blog*'],
        background_color: '#34a853',
        text_color: '#ffffff'
    },
    {
        title: 'Limited Time Group Booking Offer!',
        subtitle: 'Special rates available for group bookings - Contact us today',
        position: 'sidebar',
        link_url: '/contact',
        link_text: 'Get Quote',
        is_active: true,
        display_order: 1,
        target_devices: ['desktop', 'tablet'],
        target_pages: ['*'],
        background_color: '#ea4335',
        text_color: '#ffffff'
    },
    {
        title: 'Welcome to StayKedar!',
        subtitle: 'Get 15% off on your first booking with us',
        position: 'popup',
        link_url: '/packages',
        link_text: 'Claim Offer',
        is_active: true,
        display_order: 1,
        target_devices: ['desktop', 'mobile', 'tablet'],
        target_pages: ['/'],
        background_color: '#fbbc04',
        text_color: '#000000'
    }
];

async function setupBanners() {
    try {
        console.log('\n🚀 PROFESSIONAL BANNER SETUP\n');
        console.log('═'.repeat(60));

        // Check database connection
        const { data: test, error: checkError } = await supabase
            .from('banners')
            .select('count')
            .limit(1);

        if (checkError) {
            console.error('\n❌ DATABASE ERROR: Banners table not found!\n');
            console.error('Required Steps:');
            console.error('1. Open Supabase Dashboard');
            console.error('2. Go to SQL Editor');
            console.error('3. Run migration: supabase/migrations/20251203_banners_system.sql\n');
            console.error('Error details:', checkError.message);
            process.exit(1);
        }

        console.log('✅ Database connected successfully\n');

        // Clear old data
        console.log('🗑️  Removing old banner data...');
        await supabase.from('banners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ Database cleared\n');

        // Insert banners
        console.log('📝 Creating professional banners:\n');
        let count = 0;

        for (const banner of professionalBanners) {
            const { error } = await supabase
                .from('banners')
                .insert(banner)
                .select();

            if (error) {
                console.error(`   ❌ ${banner.title}:`, error.message);
            } else {
                count++;
                const position = banner.position.toUpperCase().padEnd(10);
                console.log(`   ${count}. [${position}] ${banner.title}`);
            }
        }

        // Verify
        console.log(`\n📊 VERIFICATION\n`);
        const { data: final } = await supabase
            .from('banners')
            .select('id, title, position, is_active')
            .order('position');

        console.log(`✅ Successfully created ${final.length} banners\n`);
        console.log('═'.repeat(60));
        console.log('\nBANNERS IN DATABASE:\n');
        final.forEach((b, i) => {
            const status = b.is_active ? '🟢' : '🔴';
            const pos = b.position.toUpperCase().padEnd(12);
            console.log(`${status} ${(i + 1)}.`.padEnd(6) + `[${pos}] ${b.title}`);
        });
        console.log('\n' + '═'.repeat(60));

        console.log('\n🎉 SUCCESS!\n');
        console.log('Next Steps:');
        console.log('  • Visit http://localhost:5173 to see banners');
        console.log('  • Manage banners in Admin Panel');
        console.log('  • Upload custom images for better branding\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

setupBanners();
