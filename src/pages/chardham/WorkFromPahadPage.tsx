import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    Wifi,
    Mountain,
    Coffee,
    Laptop,
    MapPin,
    Star,
    Check,
    Phone,
    Users,
    Building,
    TreePine,
    Sun,
    Cloud
} from 'lucide-react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Remote work friendly locations
const WORK_LOCATIONS = [
    {
        name: 'Guptkashi',
        tagline: 'The Digital Nomad Hub',
        distance: '45 km from Kedarnath',
        altitude: '1,319m',
        connectivity: '4G Available',
        avgTemp: '18-25°C',
        image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
        properties: 12,
        highlights: ['Stable Internet', 'Cafes', 'Co-working Spaces']
    },
    {
        name: 'Ukhimath',
        tagline: 'Winter Remote Paradise',
        distance: '41 km from Kedarnath',
        altitude: '1,311m',
        connectivity: '4G Available',
        avgTemp: '15-22°C',
        image: 'https://images.unsplash.com/photo-1598887142487-3c830902891d?w=800&q=80',
        properties: 8,
        highlights: ['Mountain Views', 'Quiet Environment', 'Budget Friendly']
    },
    {
        name: 'Chopta',
        tagline: 'Mini Switzerland of India',
        distance: '75 km from Kedarnath',
        altitude: '2,680m',
        connectivity: '3G/4G Patchy',
        avgTemp: '10-18°C',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
        properties: 6,
        highlights: ['Pristine Nature', 'Trekking Base', 'Stargazing']
    },
    {
        name: 'Phata',
        tagline: 'Helipad Town Connectivity',
        distance: '32 km from Kedarnath',
        altitude: '1,524m',
        connectivity: '4G Strong',
        avgTemp: '16-23°C',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
        properties: 10,
        highlights: ['Best Connectivity', 'Helicopter Access', 'Modern Stays']
    }
];

// Why Work from Pahad benefits
const BENEFITS = [
    {
        icon: Mountain,
        title: 'Escape the City Chaos',
        description: 'Trade traffic jams for mountain trails. Work with the Himalayas as your backdrop.'
    },
    {
        icon: Wifi,
        title: 'Reliable Connectivity',
        description: 'Most locations have 4G coverage. We verify internet speed before listing properties.'
    },
    {
        icon: Coffee,
        title: 'Lower Cost of Living',
        description: 'Accommodation, food, and daily expenses are 40-60% cheaper than metro cities.'
    },
    {
        icon: Sun,
        title: 'Perfect Weather',
        description: 'Pleasant temperatures year-round. No need for expensive AC bills.'
    },
    {
        icon: Users,
        title: 'Growing Community',
        description: 'Join fellow remote workers, freelancers, and digital nomads building a community.'
    },
    {
        icon: TreePine,
        title: 'Work-Life Balance',
        description: 'Finish work and go trekking. Weekends at beautiful temples and waterfalls.'
    }
];

// Featured stays for remote workers
const FEATURED_STAYS = [
    {
        id: 1,
        name: 'Mountain View Homestay',
        location: 'Guptkashi',
        price: 1200,
        rating: 4.8,
        reviews: 45,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        amenities: ['High-Speed WiFi', 'Workspace Desk', 'Mountain View', 'Meals Included'],
        badge: 'Top Rated for Remote Work'
    },
    {
        id: 2,
        name: 'Digital Nomad Camp',
        location: 'Chopta',
        price: 1500,
        rating: 4.6,
        reviews: 32,
        image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
        amenities: ['Dedicated WiFi', 'Power Backup', 'Workspace', 'Community Kitchen'],
        badge: 'Best for Long Stays'
    },
    {
        id: 3,
        name: 'Riverside Cottage',
        location: 'Ukhimath',
        price: 900,
        rating: 4.5,
        reviews: 28,
        image: 'https://images.unsplash.com/photo-1563276632-482a15c32484?w=600&q=80',
        amenities: ['WiFi', 'Quiet Zone', 'Garden', 'Homemade Food'],
        badge: 'Budget Friendly'
    }
];

const WorkFromPahadPage = () => {
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    const handleWhatsAppInquiry = () => {
        const message = encodeURIComponent(
            `Hi! I'm interested in Work from Pahad stays in ${selectedLocation || 'Kedarnath region'}. Please share available long-stay options.`
        );
        window.open(`https://wa.me/919027475942?text=${message}`, '_blank');
    };

    return (
        <>
            <Helmet>
                <title>Work from Pahad | Remote Work from Mountains | StayKedarnath</title>
                <meta name="description" content="Work remotely from the Himalayas. Find WiFi-enabled stays near Kedarnath with stable internet, workspaces, and mountain views. Perfect for digital nomads and remote workers." />
                <meta name="keywords" content="work from mountains, remote work india, digital nomad kedarnath, work from pahad, workation uttarakhand" />
            </Helmet>

            <Nav />

            <main className="min-h-screen bg-gray-50">

                {/* Hero Section - Matching Stays Page Design */}
                <section className="bg-[#003580] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#003580] via-[#00458a] to-[#003580]" />
                    <Container className="relative z-10 pt-16 pb-16">
                        <div className="flex flex-col items-start text-left">
                            <Badge className="bg-white/20 text-white border-none mb-4 text-sm">
                                🏔️ New: Work from Pahad Program
                            </Badge>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                Work from the Mountains<br className="hidden md:block" />
                                <span className="text-yellow-300">Not Just on Weekends</span>
                            </h1>
                            <p className="text-base md:text-xl text-white/90 max-w-2xl mb-8">
                                Escape to the Himalayas. Find remote-work friendly stays with reliable WiFi,
                                workspaces, and stunning views. Join the growing community of digital nomads.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                                    onClick={handleWhatsAppInquiry}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Inquire for Long Stays
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white/10"
                                    onClick={() => document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Explore Locations
                                </Button>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* Why Work from Pahad Section */}
                <Container className="py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Why Work from Pahad?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            More than just a vacation. A lifestyle upgrade that boosts productivity and well-being.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BENEFITS.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#003580]/30 hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 bg-[#003580]/10 rounded-lg flex items-center justify-center mb-4">
                                    <benefit.icon className="w-6 h-6 text-[#003580]" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-gray-600 text-sm">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>

                {/* Locations Section */}
                <section id="locations" className="bg-gray-100 py-16">
                    <Container>
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                Remote Work Friendly Locations
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Each location verified for internet connectivity and remote work amenities.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {WORK_LOCATIONS.map((loc, index) => (
                                <motion.div
                                    key={loc.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    onClick={() => setSelectedLocation(loc.name)}
                                    className={`bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-xl transition-all border-2 ${selectedLocation === loc.name ? 'border-[#003580]' : 'border-transparent'
                                        }`}
                                >
                                    <div className="h-40 overflow-hidden relative">
                                        <img
                                            src={loc.image}
                                            alt={loc.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-white/90 text-gray-800 text-xs">
                                                {loc.properties} stays
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-1">{loc.name}</h3>
                                        <p className="text-sm text-[#003580] font-medium mb-2">{loc.tagline}</p>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3" />
                                                <span>{loc.distance}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-3 h-3" />
                                                <span>{loc.connectivity}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Cloud className="w-3 h-3" />
                                                <span>{loc.avgTemp}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {loc.highlights.map(h => (
                                                <Badge key={h} variant="secondary" className="text-xs bg-gray-100">
                                                    {h}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Container>
                </section>

                {/* Featured Stays Section */}
                <Container className="py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Featured Workation Stays
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Handpicked properties with verified WiFi, dedicated workspaces, and long-stay discounts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURED_STAYS.map((stay, index) => (
                            <motion.div
                                key={stay.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={stay.image}
                                        alt={stay.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-[#003580] text-white text-xs">
                                            {stay.badge}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{stay.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {stay.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-[#003580]/10 px-2 py-1 rounded">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-semibold text-[#003580]">{stay.rating}</span>
                                            <span className="text-xs text-gray-500">({stay.reviews})</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {stay.amenities.slice(0, 3).map(amenity => (
                                            <span key={amenity} className="text-xs text-gray-600 flex items-center gap-1">
                                                <Check className="w-3 h-3 text-green-500" />
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <span className="text-xl font-bold text-[#003580]">₹{stay.price.toLocaleString()}</span>
                                            <span className="text-sm text-gray-500">/night</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-[#003580] hover:bg-[#00254d]"
                                            onClick={handleWhatsAppInquiry}
                                        >
                                            Inquire Now
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white"
                            onClick={() => window.location.href = '/stays'}
                        >
                            <Building className="w-4 h-4 mr-2" />
                            View All Stays
                        </Button>
                    </div>
                </Container>

                {/* CTA Section */}
                <section className="bg-[#003580] py-16">
                    <Container>
                        <div className="text-center text-white">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                Ready to Start Your Mountain Work Life?
                            </h2>
                            <p className="text-white/80 max-w-2xl mx-auto mb-8">
                                Tell us your requirements - duration, budget, location preference.
                                We'll find the perfect stay for your remote work adventure.
                            </p>
                            <Button
                                size="lg"
                                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                                onClick={handleWhatsAppInquiry}
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Talk to Our Team
                            </Button>
                        </div>
                    </Container>
                </section>

            </main>

            <Footer />
        </>
    );
};

export default WorkFromPahadPage;
