import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    Search, ArrowLeft, Ticket, Clock, AlertCircle,
    Loader2, MessageSquare
} from "lucide-react";
import { Helmet } from "react-helmet";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface TicketPreview {
    id: string;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    category?: string;
    created_at: string;
    updated_at: string;
    guest_email?: string;
    support_categories?: {
        name: string;
    };
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    open: { label: "Open", color: "text-blue-700", bgColor: "bg-blue-100" },
    in_progress: { label: "In Progress", color: "text-yellow-700", bgColor: "bg-yellow-100" },
    waiting_customer: { label: "Awaiting Your Reply", color: "text-orange-700", bgColor: "bg-orange-100" },
    waiting_internal: { label: "Under Review", color: "text-purple-700", bgColor: "bg-purple-100" },
    resolved: { label: "Resolved", color: "text-green-700", bgColor: "bg-green-100" },
    closed: { label: "Closed", color: "text-gray-700", bgColor: "bg-gray-100" },
};

export default function TrackTicket() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [ticketNumber, setTicketNumber] = useState("");
    const [email, setEmail] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [ticket, setTicket] = useState<TicketPreview | null>(null);
    const [notFound, setNotFound] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ticketNumber.trim()) {
            toast({
                title: "Enter Ticket Number",
                description: "Please enter your ticket number to search",
                variant: "destructive",
            });
            return;
        }

        setIsSearching(true);
        setNotFound(false);
        setTicket(null);

        try {
            // Use RPC for secure guest access
            const { data, error } = await supabase
                .rpc('get_ticket_by_number', { p_ticket_number: ticketNumber.trim().toUpperCase() });

            if (error) {
                console.error("Ticket search error:", error);
                setNotFound(true);
                return;
            }

            if (!data) {
                setNotFound(true);
                return;
            }

            // Parse returned JSONB data
            // data is already a Json object thanks to rpc returning jsonb, but we might need to cast
            const ticketData = data as any;

            // If email is provided, verify it matches
            if (email && ticketData.guest_email && ticketData.guest_email.toLowerCase() !== email.toLowerCase()) {
                setNotFound(true);
                toast({
                    title: "Verification Failed",
                    description: "The email doesn't match our records for this ticket",
                    variant: "destructive",
                });
                return;
            }

            // Map category to the expected format
            setTicket({
                id: ticketData.id,
                ticket_number: ticketData.ticket_number,
                subject: ticketData.subject,
                status: ticketData.status,
                priority: ticketData.priority,
                category: ticketData.category,
                created_at: ticketData.created_at,
                updated_at: ticketData.updated_at,
                guest_email: ticketData.guest_email,
                support_categories: ticketData.category ? { name: ticketData.category } : undefined
            });
        } catch (error) {
            console.error("Search error:", error);
            setNotFound(true);
        } finally {
            setIsSearching(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Input style without blue outline
    const inputStyle = "border-gray-300 focus:border-gray-400 focus:ring-0 outline-none";

    return (
        <>
            <Helmet>
                <title>Track Support Ticket | StayKedarnath</title>
                <meta name="description" content="Track the status of your support ticket" />
            </Helmet>
            <Nav />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0A1628] via-[#0F2167] to-[#1E3A8A] py-10 md:py-14">
                    <div className="max-w-2xl mx-auto px-4">
                        <Link
                            to="/help"
                            className="inline-flex items-center gap-2 text-white hover:text-white/90 mb-5 transition-colors text-sm bg-white/15 px-3 py-1.5 rounded-full border border-white/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Help Center
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            Track Your Ticket
                        </h1>
                        <p className="text-blue-200 text-sm md:text-base">
                            Enter your ticket number to check the status
                        </p>
                    </div>
                </div>

                {/* Search Section */}
                <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ticket Number *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., TKT-20241202-1234"
                                    value={ticketNumber}
                                    onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                                    className={`h-12 font-mono text-base ${inputStyle}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address (Optional - for verification)
                                </label>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`h-11 ${inputStyle}`}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSearching}
                                className="w-full h-12 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 mr-2" />
                                        Find Ticket
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Not Found Message */}
                        {notFound && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800">Ticket Not Found</p>
                                        <p className="text-sm text-red-600 mt-1">
                                            We couldn't find a ticket with that number. Please check and try again.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Ticket Found */}
                        {ticket && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6"
                            >
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">Ticket Found</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status]?.bgColor} ${statusConfig[ticket.status]?.color}`}>
                                            {statusConfig[ticket.status]?.label || ticket.status}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Ticket className="w-4 h-4" />
                                            <span className="font-mono">{ticket.ticket_number}</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-3">{ticket.subject}</h4>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Category</p>
                                                <p className="font-medium text-gray-900">
                                                    {ticket.support_categories?.name || "General"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Priority</p>
                                                <p className="font-medium text-gray-900 capitalize">{ticket.priority}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Created</p>
                                                <p className="font-medium text-gray-900">{formatDate(ticket.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Last Updated</p>
                                                <p className="font-medium text-gray-900">{formatDate(ticket.updated_at)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => navigate(`/support/ticket/${ticket.ticket_number}`)}
                                        className="w-full h-11 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        View Full Ticket & Reply
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have a ticket yet?{" "}
                            <Link to="/support/raise" className="text-[#0071c2] hover:underline font-medium">
                                Create a new support request
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
