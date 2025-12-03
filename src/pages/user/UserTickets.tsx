import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Ticket, Plus, Search, Clock, CheckCircle2, 
    MessageSquare, AlertCircle, RefreshCw, Filter,
    ArrowRight, Calendar, Loader2
} from "lucide-react";
import { Helmet } from "react-helmet";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface TicketData {
    id: string;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    support_categories?: {
        name: string;
    };
    message_count?: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    open: { label: "Open", color: "text-blue-700", bgColor: "bg-blue-100", icon: <Clock className="w-3.5 h-3.5" /> },
    in_progress: { label: "In Progress", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: <RefreshCw className="w-3.5 h-3.5" /> },
    waiting_customer: { label: "Needs Reply", color: "text-orange-700", bgColor: "bg-orange-100", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    waiting_internal: { label: "Under Review", color: "text-purple-700", bgColor: "bg-purple-100", icon: <Clock className="w-3.5 h-3.5" /> },
    resolved: { label: "Resolved", color: "text-green-700", bgColor: "bg-green-100", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    closed: { label: "Closed", color: "text-gray-700", bgColor: "bg-gray-100", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
};

export default function UserTickets() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("support_tickets")
                .select(`
                    *,
                    support_categories (name)
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Get message counts for each ticket
            const ticketsWithCounts = await Promise.all(
                (data || []).map(async (ticket) => {
                    const { count } = await supabase
                        .from("ticket_messages")
                        .select("*", { count: "exact", head: true })
                        .eq("ticket_id", ticket.id);
                    return { ...ticket, message_count: count || 0 };
                })
            );

            setTickets(ticketsWithCounts);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    const openTicketsCount = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;
    const needsReplyCount = tickets.filter(t => t.status === "waiting_customer").length;

    if (!user) {
        return (
            <>
                <Nav />
                <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Please sign in to view your tickets</p>
                        <Button onClick={() => navigate("/auth")}>Sign In</Button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Support Tickets | StayKedarnath</title>
            </Helmet>
            <Nav />
            
            <div className="min-h-screen bg-gray-50 pt-20">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Support Tickets</h1>
                                <p className="text-gray-600 mt-1">View and manage your support requests</p>
                            </div>
                            <Button 
                                onClick={() => navigate("/support/raise")}
                                className="bg-[#0071c2] hover:bg-[#005999]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Ticket
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                                <p className="text-sm text-gray-600">Total Tickets</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-2xl font-bold text-blue-700">{openTicketsCount}</p>
                                <p className="text-sm text-blue-600">Open</p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4">
                                <p className="text-2xl font-bold text-orange-700">{needsReplyCount}</p>
                                <p className="text-sm text-orange-600">Needs Reply</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4">
                                <p className="text-2xl font-bold text-green-700">
                                    {tickets.filter(t => t.status === "resolved").length}
                                </p>
                                <p className="text-sm text-green-600">Resolved</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="waiting_customer">Needs Reply</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="max-w-6xl mx-auto px-4 pb-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0071c2]" />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Ticket className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchQuery || statusFilter !== "all" ? "No tickets found" : "No support tickets yet"}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery || statusFilter !== "all" 
                                    ? "Try adjusting your search or filters"
                                    : "When you create a support ticket, it will appear here"
                                }
                            </p>
                            {!searchQuery && statusFilter === "all" && (
                                <Button 
                                    onClick={() => navigate("/support/raise")}
                                    className="bg-[#0071c2] hover:bg-[#005999]"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Ticket
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTickets.map((ticket, index) => {
                                const status = statusConfig[ticket.status] || statusConfig.open;
                                return (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={`/support/ticket/${ticket.ticket_number}`}
                                            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-[#0071c2]/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono text-xs text-gray-500">
                                                            {ticket.ticket_number}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                                            {status.icon}
                                                            {status.label}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                                                            {ticket.priority}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-[#0071c2] transition-colors truncate">
                                                        {ticket.subject}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatDate(ticket.created_at)}
                                                        </span>
                                                        {ticket.support_categories && (
                                                            <span>{ticket.support_categories.name}</span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            {ticket.message_count} messages
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#0071c2] transition-colors flex-shrink-0" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
