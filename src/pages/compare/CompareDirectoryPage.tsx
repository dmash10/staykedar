import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ArrowRightLeft } from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Import city data
import citiesData from '@/data/cities.json';

export default function CompareDirectoryPage() {
    const pageTitle = "Compare Kedarnath Route Cities | Distance & Cost Analysis";
    const pageDesc = "Compare distances, hotel rates, and vibes of all major cities on the Kedarnath Yatra route. Find the best stopover for your pilgrimage.";

    // Generate all unique pairs
    const comparisons = useMemo(() => {
        const pairs = [];
        for (let i = 0; i < citiesData.length; i++) {
            for (let j = i + 1; j < citiesData.length; j++) {
                // Only compare valid "Stops" effectively, or just all permutations
                // Let's limit to meaningful ones if needed, but for now allow all.
                const city1 = citiesData[i];
                const city2 = citiesData[j];

                // Skip if very far apart or irrelevant? No, programatic SEO benefits from long tail.

                // SEO Optimized Slug: city1-vs-city2-stay-for-kedarnath
                const seoSlug = `${city1.slug}-vs-${city2.slug}-stay-for-kedarnath`;

                pairs.push({
                    url: `/compare/${seoSlug}`,
                    title: `${city1.name} vs ${city2.name}`,
                    c1: city1,
                    c2: city2
                });
            }
        }
        return pairs;
    }, []);

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <link rel="canonical" href="https://staykedarnath.in/compare-cities" />
            </Helmet>

            <div className="min-h-screen bg-background">
                <PageHeader
                    title="City Comparisons"
                    description="Decing where to stay? Compare distances, costs and amenities."
                />

                <Container className="py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {comparisons.map((pair, idx) => (
                            <Link to={pair.url} key={idx} className="group">
                                <Card className="h-full hover:shadow-lg transition-all duration-300 border-dashed hover:border-solid border-slate-300 dark:border-slate-700">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                                <MapPin className="w-4 h-4" /> Compare
                                            </div>
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                                {pair.title}
                                            </h3>
                                            <div className="text-xs text-muted-foreground">
                                                {pair.c1.stay_vibe} vs {pair.c2.stay_vibe}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-16 text-center space-y-4 max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl">
                        <ArrowRightLeft className="w-12 h-12 mx-auto text-primary opacity-50 mb-4" />
                        <h3 className="text-2xl font-bold">Why Compare?</h3>
                        <p className="text-muted-foreground">
                            Choosing the right halt is crucial for a smooth Kedarnath Yatra.
                            Some pilgrims prefer the <strong>spiritual vibe of Rishikesh</strong>, while others prioritize the
                            <strong>convenience of Haridwar</strong> or the <strong>proximity of Sonprayag</strong>.
                        </p>
                    </div>
                </Container>
                <Footer />
            </div>
        </>
    );
}
