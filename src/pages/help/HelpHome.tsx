import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpCenterLayout from '@/components/help/HelpCenterLayout';
import HelpArticlesBrowser from '@/components/help/HelpArticlesBrowser';
import HelpSearch from '@/components/help/HelpSearch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Search,
    MessageSquare,
    Package,
    HelpCircle,
    XCircle
} from 'lucide-react';

export default function HelpHome() {
    const navigate = useNavigate();

    return (
        <HelpCenterLayout showSearch={false}>
            {/* Hero Section */}
            <section className="bg-[#0F2167] py-16 px-4 sm:px-6 lg:px-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>

                <div className="relative z-50 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                        <HelpCircle className="w-4 h-4" />
                        <span>24/7 Support Center</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight">
                        How can we help you today?
                    </h1>

                    <div className="mb-8">
                        <HelpSearch />
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-white" onClick={() => navigate('/dashboard/bookings')}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">My Bookings</h3>
                                    <p className="text-xs text-gray-500">Manage your reservations</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-white" onClick={() => navigate('/support/track')}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Track Ticket</h3>
                                    <p className="text-xs text-gray-500">Check support status</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-white" onClick={() => navigate('/cancellation')}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-red-50 p-2.5 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                                    <XCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Cancellations</h3>
                                    <p className="text-xs text-gray-500">Refunds & policies</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Knowledge Base Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Knowledge Base</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Browse all our help articles by category or search for specific topics.</p>
                </div>

                <HelpArticlesBrowser />
            </section>

            {/* FAQ Section */}
            <section className="bg-secondary/30 py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600">Quick answers to the most common questions we receive.</p>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <AccordionItem value="item-1" className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium text-gray-900 hover:text-blue-600 hover:no-underline py-6">
                                How do I cancel my booking?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                                You can cancel your booking by going to "My Bookings" in your dashboard. Select the booking you wish to cancel and click the "Cancel Booking" button. Please review our cancellation policy first to understand any applicable fees.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium text-gray-900 hover:text-blue-600 hover:no-underline py-6">
                                What payment methods do you accept?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                                We accept all major credit and debit cards (Visa, MasterCard, RuPay), UPI payments (Google Pay, PhonePe, Paytm), and Net Banking from all major Indian banks.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium text-gray-900 hover:text-blue-600 hover:no-underline py-6">
                                Is it safe to travel to Kedarnath now?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                                We monitor weather and safety conditions 24/7. You can check the "Weather Updates" section in the footer for real-time information. We always recommend checking official government advisories before your trip.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium text-gray-900 hover:text-blue-600 hover:no-underline py-6">
                                How do I get my refund?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                                Refunds are processed automatically to the original payment method within 5-7 business days after a cancellation is approved. If you haven't received it after 7 days, please contact support.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto bg-[#0F2167] rounded-3xl p-12 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">Still need help?</h2>
                        <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
                            Our dedicated support team is available 24/7 to assist you with any issues or questions you might have.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-lg border-0" onClick={() => navigate('/support/raise')}>
                                Contact Support
                            </Button>
                            <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold" onClick={() => navigate('/contact')}>
                                View Contact Options
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </HelpCenterLayout>
    );
}
