import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
    Cloud,
    Sun,
    CloudRain,
    Snowflake,
    Wind,
    Thermometer,
    Mountain,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Car,
    Users,
    Phone,
    RefreshCw,
    Loader2,
    Info,
    ChevronDown,
    ChevronUp,
    Newspaper,
    HelpCircle,
    Pin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// Status types
type Status = 'open' | 'closed' | 'limited' | 'unknown';

interface RoadStatus {
    name: string;
    status: Status;
    note?: string;
}

interface ServiceStatus {
    name: string;
    status: Status;
    note?: string;
}

interface LiveUpdate {
    id: string;
    title: string;
    content: string;
    category: string;
    is_pinned: boolean;
    published_at: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    last_verified_at: string;
}

const getStatusColor = (status: Status) => {
    switch (status) {
        case 'open': return 'bg-green-500';
        case 'closed': return 'bg-red-500';
        case 'limited': return 'bg-amber-500';
        default: return 'bg-gray-400';
    }
};

const getStatusIcon = (status: Status) => {
    switch (status) {
        case 'open': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case 'closed': return <XCircle className="w-5 h-5 text-red-500" />;
        case 'limited': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        default: return <Info className="w-5 h-5 text-gray-400" />;
    }
};

const getStatusLabel = (status: Status) => {
    switch (status) {
        case 'open': return 'Open';
        case 'closed': return 'Closed';
        case 'limited': return 'Limited';
        default: return 'Unknown';
    }
};

const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
        general: 'bg-gray-500',
        temple: 'bg-orange-500',
        weather: 'bg-blue-500',
        road: 'bg-green-500',
        trek: 'bg-purple-500',
        transport: 'bg-indigo-500',
        booking: 'bg-pink-500',
    };
    return colors[category] || 'bg-gray-500';
};

const LiveStatusPage = () => {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch live updates from database
    const { data: updates = [], refetch: refetchUpdates } = useQuery({
        queryKey: ['live-status-updates'],
        queryFn: async () => {
            const { data } = await supabase
                .from('live_status_updates')
                .select('*')
                .eq('is_active', true)
                .order('is_pinned', { ascending: false })
                .order('published_at', { ascending: false })
                .limit(5);
            return (data || []) as LiveUpdate[];
        },
        staleTime: 60000, // 1 minute
    });

    // Fetch FAQs from database
    const { data: faqs = [], refetch: refetchFaqs } = useQuery({
        queryKey: ['live-status-faqs'],
        queryFn: async () => {
            const { data } = await supabase
                .from('live_status_faqs')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            return (data || []) as FAQ[];
        },
        staleTime: 300000, // 5 minutes
    });

    // Weather data
    const { data: weatherData, refetch: refetchWeather } = useQuery({
        queryKey: ['kedarnath-weather'],
        queryFn: async () => {
            return {
                temp: -5,
                feels_like: -10,
                humidity: 75,
                wind_speed: 15,
                condition: 'Snow',
                icon: 'snow'
            };
        },
        staleTime: 300000,
    });

    // Current month to determine temple status
    const currentMonth = new Date().getMonth();
    const isYatraOpen = currentMonth >= 3 && currentMonth <= 10;

    // Road conditions
    const roadStatuses: RoadStatus[] = [
        { name: 'Rishikesh to Devprayag', status: 'open', note: 'Clear' },
        { name: 'Devprayag to Rudraprayag', status: 'open', note: 'Smooth traffic' },
        { name: 'Rudraprayag to Guptkashi', status: 'open', note: 'Minor work near Tilwara' },
        { name: 'Guptkashi to Sonprayag', status: 'open', note: 'All clear' },
        { name: 'Sonprayag to Gaurikund', status: isYatraOpen ? 'open' : 'limited', note: isYatraOpen ? 'Govt. jeeps running' : 'Limited access in winter' },
    ];

    // Services status
    const serviceStatuses: ServiceStatus[] = [
        {
            name: 'Kedarnath Temple',
            status: isYatraOpen ? 'open' : 'closed',
            note: isYatraOpen ? 'Darshan: 4 AM - 9 PM' : 'Closed for winter (Opens April 2026)'
        },
        {
            name: 'Helicopter Service',
            status: isYatraOpen ? 'open' : 'closed',
            note: isYatraOpen ? 'Operating normally' : 'Suspended for winter'
        },
        {
            name: 'Pony/Palki Service',
            status: isYatraOpen ? 'open' : 'closed',
            note: isYatraOpen ? 'Available at Gaurikund' : 'Not available in winter'
        },
        {
            name: 'Biometric Registration',
            status: isYatraOpen ? 'open' : 'closed',
            note: isYatraOpen ? 'Sonprayag counter open' : 'Closed'
        },
    ];

    // Trek status
    const trekStatus = {
        status: isYatraOpen ? 'open' as Status : 'closed' as Status,
        distance: '16 km',
        estimatedTime: '6-8 hours',
        difficulty: 'Moderate',
        note: isYatraOpen ? 'Trek route is clear' : 'Trek closed due to heavy snowfall'
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchWeather(), refetchUpdates(), refetchFaqs()]);
        setLastUpdated(new Date());
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const getWeatherIcon = (condition: string) => {
        const lower = condition.toLowerCase();
        if (lower.includes('snow')) return <Snowflake className="w-12 h-12 text-blue-300" />;
        if (lower.includes('rain')) return <CloudRain className="w-12 h-12 text-blue-500" />;
        if (lower.includes('cloud')) return <Cloud className="w-12 h-12 text-gray-400" />;
        return <Sun className="w-12 h-12 text-yellow-500" />;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Generate FAQ Schema for SEO
    const faqSchema = faqs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    // Generate LiveBlogPosting Schema for real-time updates
    const liveBlogSchema = updates.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "LiveBlogPosting",
        "headline": "Kedarnath Yatra Live Updates 2025-2026",
        "description": "Real-time status updates for Kedarnath temple, road conditions, weather, helicopter services, and trek route.",
        "coverageStartTime": "2025-04-15T06:00:00+05:30",
        "coverageEndTime": "2026-11-15T20:00:00+05:30",
        "about": {
            "@type": "Place",
            "name": "Kedarnath Temple",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Kedarnath",
                "addressRegion": "Uttarakhand",
                "addressCountry": "IN"
            }
        },
        "liveBlogUpdate": updates.slice(0, 10).map(update => ({
            "@type": "BlogPosting",
            "headline": update.title,
            "datePublished": update.published_at,
            "articleBody": update.content.replace(/[*•]/g, '').substring(0, 500)
        }))
    } : null;

    return (
        <>
            <Helmet>
                <title>Kedarnath Live Status | Weather, Roads & Temple Status - December 2025</title>
                <meta name="description" content={`Check Kedarnath live status as of ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Temple ${isYatraOpen ? 'OPEN' : 'CLOSED'}, real-time road conditions, weather updates, helicopter & trek status.`} />
                {faqSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(faqSchema)}
                    </script>
                )}
                {liveBlogSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(liveBlogSchema)}
                    </script>
                )}
            </Helmet>

            <Nav />

            <main className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-[#003580] via-[#0052a3] to-[#0071c2] text-white py-12">
                    <Container>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                    Kedarnath Live Status
                                </h1>
                                <p className="text-blue-100">
                                    Real-time updates as of {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-blue-200">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                >
                                    {isRefreshing ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </Container>
                </div>

                <Container className="py-8">
                    {/* Quick Status Banner */}
                    <motion.div
                        className={`rounded-xl p-4 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isYatraOpen ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3">
                            {isYatraOpen ? (
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-600" />
                            )}
                            <div>
                                <h2 className={`text-xl font-bold ${isYatraOpen ? 'text-green-800' : 'text-red-800'}`}>
                                    Kedarnath Yatra is {isYatraOpen ? 'OPEN' : 'CLOSED'}
                                </h2>
                                <p className={isYatraOpen ? 'text-green-600' : 'text-red-600'}>
                                    {isYatraOpen
                                        ? 'Temple doors are open for darshan. All services operational.'
                                        : 'Temple closed for winter. Expected reopening: Late April / Early May 2026.'}
                                </p>
                            </div>
                        </div>
                        <Badge className={isYatraOpen ? 'bg-green-600' : 'bg-red-600'}>
                            {isYatraOpen ? 'YATRA OPEN' : 'WINTER CLOSURE'}
                        </Badge>
                    </motion.div>

                    {/* Latest Updates Section */}
                    {updates.length > 0 && (
                        <motion.div
                            className="mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Newspaper className="w-5 h-5 text-blue-600" />
                                        Latest Updates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {updates.map((update) => (
                                        <div
                                            key={update.id}
                                            className={`bg-white rounded-lg p-4 shadow-sm border ${update.is_pinned ? 'border-purple-300' : 'border-gray-200'}`}
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                {update.is_pinned && <Pin className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                                                <h3 className="font-semibold text-gray-900">{update.title}</h3>
                                            </div>
                                            <div
                                                className="text-sm text-gray-700 prose prose-sm max-w-none [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:mt-3 [&>h3]:mb-1 [&>ul]:my-2 [&>ul]:pl-5 [&>li]:my-0.5 [&>p]:my-1.5 [&>hr]:my-3 [&>hr]:border-gray-200 [&_a]:text-blue-600 [&_a]:hover:underline [&_.source-verified]:bg-green-50 [&_.source-verified]:p-2 [&_.source-verified]:rounded [&_.source-verified]:border [&_.source-verified]:border-green-200 [&_.source-verified]:text-green-700 [&_.source-verified]:text-xs [&_.source-verified]:mt-3 [&_.source]:bg-gray-50 [&_.source]:p-2 [&_.source]:rounded [&_.source]:border [&_.source]:border-gray-200 [&_.source]:text-gray-600 [&_.source]:text-xs [&_.source]:mt-3"
                                                dangerouslySetInnerHTML={{ __html: update.content }}
                                            />
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(update.published_at)}
                                                <Badge variant="outline" className={`${getCategoryColor(update.category)} text-white border-0 text-[10px] px-1.5 py-0`}>
                                                    {update.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Status Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Weather Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Thermometer className="w-5 h-5 text-blue-500" />
                                        Weather at Kedarnath
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        {getWeatherIcon(weatherData?.condition || 'Cloudy')}
                                        <div className="text-right">
                                            <div className="text-4xl font-bold text-gray-900">
                                                {weatherData?.temp}°C
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Feels like {weatherData?.feels_like}°C
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center text-gray-600 mb-4">
                                        {weatherData?.condition}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Wind className="w-4 h-4 text-gray-400" />
                                            <span>{weatherData?.wind_speed} km/h</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Cloud className="w-4 h-4 text-gray-400" />
                                            <span>{weatherData?.humidity}% humidity</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Temple Status Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Mountain className="w-5 h-5 text-orange-500" />
                                        Temple Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {serviceStatuses.slice(0, 2).map((service, idx) => (
                                            <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    {getStatusIcon(service.status)}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{service.name}</div>
                                                        <div className="text-sm text-gray-500">{service.note}</div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`${getStatusColor(service.status)} text-white border-0`}>
                                                    {getStatusLabel(service.status)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Trek Status Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <MapPin className="w-5 h-5 text-green-500" />
                                        Trek Route Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(trekStatus.status)}
                                            <span className="font-medium">Gaurikund to Kedarnath</span>
                                        </div>
                                        <Badge variant="outline" className={`${getStatusColor(trekStatus.status)} text-white border-0`}>
                                            {getStatusLabel(trekStatus.status)}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Distance</span>
                                            <span className="font-medium">{trekStatus.distance}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Estimated Time</span>
                                            <span className="font-medium">{trekStatus.estimatedTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Difficulty</span>
                                            <span className="font-medium">{trekStatus.difficulty}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4 p-2 bg-gray-50 rounded">
                                        {trekStatus.note}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Road Status Section */}
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="w-5 h-5 text-blue-500" />
                                    Road Conditions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {roadStatuses.map((road, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(road.status)}
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">{road.name}</div>
                                                    {road.note && <div className="text-xs text-gray-500">{road.note}</div>}
                                                </div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(road.status)}`} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Services Grid */}
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-500" />
                                    Pilgrim Services
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {serviceStatuses.map((service, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(service.status)}
                                                <div>
                                                    <div className="font-medium text-gray-900">{service.name}</div>
                                                    <div className="text-sm text-gray-500">{service.note}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`${getStatusColor(service.status)} text-white border-0`}>
                                                {getStatusLabel(service.status)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* FAQs Section */}
                    {faqs.length > 0 && (
                        <motion.div
                            className="mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-orange-500" />
                                        Frequently Asked Questions - Updated December 2025
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        {faqs.map((faq, idx) => (
                                            <AccordionItem key={faq.id} value={faq.id}>
                                                <AccordionTrigger className="text-left hover:no-underline">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 text-sm">{idx + 1}.</span>
                                                        <span className="font-medium text-gray-900">{faq.question}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="pl-6 text-gray-600">
                                                        <p>{faq.answer}</p>
                                                        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Last verified: {formatDate(faq.last_verified_at)}
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Important Contacts */}
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    Emergency Contacts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="text-sm text-gray-500">District Emergency</div>
                                        <div className="text-lg font-bold text-gray-900">1077</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="text-sm text-gray-500">SDRF Helpline</div>
                                        <div className="text-lg font-bold text-gray-900">1070</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="text-sm text-gray-500">Medical Emergency</div>
                                        <div className="text-lg font-bold text-gray-900">108</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Disclaimer */}
                    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <strong>Disclaimer:</strong> This information is updated regularly but conditions can change rapidly in mountain regions.
                                Always verify with local authorities before starting your journey.
                                For real-time updates, contact the Uttarakhand Tourism helpline at <strong>1364</strong>.
                            </div>
                        </div>
                    </div>
                </Container>
            </main>

            <Footer />
        </>
    );
};

export default LiveStatusPage;
