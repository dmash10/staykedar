import React from 'react';
import { Helmet } from 'react-helmet-async';
import BudgetCalculator from '@/components/tools/BudgetCalculator';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';

export default function BudgetCalculatorPage() {
    const pageTitle = "Kedarnath Yatra Budget Calculator 2026 | Estimate Trip Cost";
    const pageDesc = "Calculate your Kedarnath trip cost instantly. Estimates for helicopter, pony, hotels, and taxi from Haridwar/Rishikesh. Plan your budget for the 2026 Yatra.";

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta name="keywords" content="kedarnath trip cost, kedarnath budget calculator, kedarnath helicopter price, char dham yatra cost, haridwar to kedarnath taxi fare" />
                <link rel="canonical" href="https://staykedarnath.in/tools/kedarnath-budget-calculator" />
            </Helmet>

            <div className="min-h-screen bg-background">
                <PageHeader
                    title="Yatra Budget Calculator"
                    description="Plan your finances for a hassle-free pilgrimage"
                />

                <Container className="py-12">
                    <BudgetCalculator />

                    {/* SEO Content Section */}
                    <div className="mt-16 max-w-4xl mx-auto prose dark:prose-invert">
                        <h2>How to Calculate Your Kedarnath Trip Cost</h2>
                        <p>
                            Planning a trip to Kedarnath Dham requires careful budgeting, as costs can vary significantly based on your mode of transport and accommodation choices.
                            Our <strong>Kedarnath Budget Calculator</strong> helps you estimate the total expense for your group.
                        </p>

                        <h3>Major Cost Components</h3>
                        <ul>
                            <li><strong>Transport:</strong> A shared taxi from Haridwar/Rishikesh to Sonprayag costs approx. ₹1,000-1,500 per person. Private taxis range from ₹5,000 to ₹7,000 per day.</li>
                            <li><strong>Accommodation:</strong> Hotels in Guptkashi, Phata, and Sonprayag range from ₹1,500 (Budget) to ₹8,000+ (Luxury) per night. Prices peak in May and June.</li>
                            <li><strong>Helicopter:</strong> Tickets are government-regulated (approx ₹5,500 - ₹8,000 round trip) but booking through agents often incurs extra service fees.</li>
                            <li><strong>Pony/Palki:</strong> If you cannot trek the 16km, a pony costs around ₹2,500-3,000 one way, while a Palki (sedan chair) can cost ₹8,000+.</li>
                        </ul>

                        <h3>Tips for Saving Money</h3>
                        <p>
                            To reduce your <em>Kedarnath trip cost</em>, create a group of 4-6 people to split taxi costs.
                            Booking homestays in villages like Sersi or Narayankoti is often 30% cheaper than Sonprayag.
                            Avoid peak weekends (Sat/Sun) for lower rates.
                        </p>
                        <h3>Frequently Asked Questions about Yatra Costs</h3>
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-bold text-sm">Does the helicopter price fluctuate?</h4>
                                <p className="text-sm text-muted-foreground mt-1">Officially, no. The government sets the rate (approx ₹5,500 - ₹8,000). However, "black market" or urgent tickets from agents can cost double. Book via the official IRCTC HeliYatra website to avoid this.</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-bold text-sm">Are there hidden costs I should know?</h4>
                                <p className="text-sm text-muted-foreground mt-1">Yes. Hot water buckets can cost ₹50-₹100 at base camps. Charging phones might be charged at ₹50. Prices for tea/Maggi double as you climb higher.</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-bold text-sm">Is it cheaper to book hotels online or on arrival?</h4>
                                <p className="text-sm text-muted-foreground mt-1">For May-June (Peak), book online months in advance or you might pay 3x on arrival or sleep in a dormitory. For Sept-Oct, offline negotiation works well.</p>
                            </div>
                        </div>
                    </div>
                </Container>

                <Footer />
            </div>
        </>
    );
}
