import React from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import WeatherWidget from '@/components/tools/WeatherWidget';
import { CloudRain, Info } from 'lucide-react';

export default function WeatherCheckPage() {
    const pageTitle = "Is it Raining in Kedarnath Right Now? | Live Weather Check";
    const pageDesc = "Check live weather status for Kedarnath Temple. Instant rain, snow, and temperature updates for pilgrims.";

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <link rel="canonical" href="https://staykedarnath.in/tools/is-it-raining-in-kedarnath" />
            </Helmet>

            <div className="min-h-screen bg-background flex flex-col">
                <PageHeader
                    title="Kedarnath Rain Check"
                    description="Instant live weather updates for the temple valley"
                />

                <Container className="py-12 flex-grow">
                    <div className="max-w-md mx-auto">
                        <WeatherWidget className="mb-8" />

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3 text-amber-800 dark:text-amber-200 text-sm">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>
                                Weather in the Himalayas changes rapidly. Always carry a raincoat and warm layers even if the forecast says sunny.
                            </p>
                        </div>

                        <div className="mt-12 prose dark:prose-invert">
                            <h3>About Kedarnath Weather</h3>
                            <p>
                                The weather at Kedarnath (3,583m) is unpredictable.
                                <strong>Afternoon showers</strong> are very common even in summer.
                            </p>
                            <ul>
                                <li><strong>Summer (May-Jun):</strong> Pleasant days, cold nights. Occasional rain.</li>
                                <li><strong>Monsoon (Jul-Aug):</strong> Heavy rainfall. Landslide risk.</li>
                                <li><strong>Pre-Winter (Sep-Oct):</strong> Best views. Cold but clear.</li>
                            </ul>
                        </div>

                        <div className="mt-8 prose dark:prose-invert">
                            <h3>Real Questions from Pilgrims</h3>
                            <div className="not-prose space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-sm">Does the Helicopter fly if it drizzles?</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Rarely. Choppers need clear visibility. Even light rain or fog at the helipad (Phata/Sersi) often grounds flights for hours. Always have a backup trek plan.</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-sm">Can I trek in the rain?</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Yes, but the path gets slippery with mule dung and mud. Wear trekking shoes with good grip, not sports shoes. A ₹50 plastic raincoat from Sonprayag is a lifesaver.</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-sm">Is it freezing in June?</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Days are sunny (15°C+), but nights drop to 2-5°C near the temple. You typically only need heavy woolens for the night stay or early morning Darshan.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container >

                <Footer />
            </div >
        </>
    );
}
