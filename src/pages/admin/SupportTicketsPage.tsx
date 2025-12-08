import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Search, Filter, MoreVertical, Eye, MessageSquare,
    Clock, CheckCircle2, AlertCircle, RefreshCw, User,
    Loader2, Ticket, Flag, Calendar, ArrowUpDown, Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketData {
    id: string;
    ticket_number: string;
    subject: string;
    description?: string;
    status: string;
    priority: string;
    category?: string;
    created_at: string;
    updated_at: string;
    user_id: string | null;
    guest_email: string | null;
    guest_name: string | null;
    assigned_to?: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    open: { label: "Open", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    in_progress: { label: "In Progress", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
    waiting_customer: { label: "Waiting Customer", color: "text-orange-400", bgColor: "bg-orange-500/20" },
    waiting_internal: { label: "Under Review", color: "text-purple-400", bgColor: "bg-purple-500/20" },
    resolved: { label: "Resolved", color: "text-green-400", bgColor: "bg-green-500/20" },
    closed: { label: "Closed", color: "text-gray-400", bgColor: "bg-gray-500/20" },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    low: { label: "Low", color: "text-gray-400", bgColor: "bg-gray-500/20" },
    medium: { label: "Medium", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    high: { label: "High", color: "text-orange-400", bgColor: "bg-orange-500/20" },
    urgent: { label: "Urgent", color: "text-red-400", bgColor: "bg-red-500/20" },
};

export default function SupportTicketsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "priority">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [activeTab, setActiveTab] = useState("support");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("support_tickets")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            toast({
                title: "Error",
                description: "Failed to load tickets",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateTicketStatus = async (ticketId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("support_tickets")
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    ...(newStatus === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
                    ...(newStatus === "closed" ? { closed_at: new Date().toISOString() } : {}),
                })
                .eq("id", ticketId);

            if (error) throw error;

            // Log activity
            await supabase
                .from("ticket_activity_log")
                .insert({
                    ticket_id: ticketId,
                    user_id: user?.id,
                    action: "status_changed",
                    new_value: newStatus,
                });

            toast({
                title: "Status Updated",
                description: `Ticket status changed to ${statusConfig[newStatus]?.label || newStatus}`,
            });

            fetchTickets();
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update ticket status",
                variant: "destructive",
            });
        }
    };

    const updateTicketPriority = async (ticketId: string, newPriority: string) => {
        try {
            const { error } = await supabase
                .from("support_tickets")
                .update({
                    priority: newPriority,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", ticketId);

            if (error) throw error;

            toast({
                title: "Priority Updated",
                description: `Ticket priority changed to ${priorityConfig[newPriority]?.label || newPriority}`,
            });

            fetchTickets();
        } catch (error) {
            console.error("Error updating priority:", error);
            toast({
                title: "Error",
                description: "Failed to update ticket priority",
                variant: "destructive",
            });
        }
    };

    // Filter tickets based on active tab mostly
    const currentTabTickets = tickets.filter(ticket => {
        const isContactForm = ticket.subject === "Contact Form Message";
        return activeTab === "contact" ? isContactForm : !isContactForm;
    });

    const filteredTickets = currentTabTickets
        .filter((ticket) => {
            const matchesSearch =
                ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
            const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        })
        .sort((a, b) => {
            if (sortBy === "priority") {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                const diff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                    (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
                return sortOrder === "desc" ? diff : -diff;
            }
            const dateA = new Date(a[sortBy]).getTime();
            const dateB = new Date(b[sortBy]).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Stats - calculated based on current filtered tab set to make them relevant
    const openCount = currentTabTickets.filter(t => t.status === "open").length;
    const inProgressCount = currentTabTickets.filter(t => t.status === "in_progress").length;
    const waitingCount = currentTabTickets.filter(t => t.status === "waiting_customer").length;
    const urgentCount = currentTabTickets.filter(t => t.priority === "urgent" && !["resolved", "closed"].includes(t.status)).length;

    return (
        <AdminLayout title="Support Tickets">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">Support Tickets</h1>
                    <p className="text-gray-400">Manage and respond to customer support requests</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A] mb-6">
                        <TabsTrigger value="support" className="data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white text-gray-400">
                            <Ticket className="w-4 h-4 mr-2" />
                            Support Tickets
                        </TabsTrigger>
                        <TabsTrigger value="contact" className="data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white text-gray-400">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Messages
                        </TabsTrigger>
                    </TabsList>

                    {/* Stats Cards - Dynamic based on tab */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{openCount}</p>
                                    <p className="text-xs text-gray-400">Open</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{inProgressCount}</p>
                                    <p className="text-xs text-gray-400">In Progress</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{waitingCount}</p>
                                    <p className="text-xs text-gray-400">Waiting Reply</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{urgentCount}</p>
                                    <p className="text-xs text-gray-400">Urgent</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-40 bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                    <SelectItem value="all" className="text-white">All Status</SelectItem>
                                    <SelectItem value="open" className="text-white">Open</SelectItem>
                                    <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                                    <SelectItem value="waiting_customer" className="text-white">Waiting Customer</SelectItem>
                                    <SelectItem value="resolved" className="text-white">Resolved</SelectItem>
                                    <SelectItem value="closed" className="text-white">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-full md:w-40 bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                    <SelectItem value="all" className="text-white">All Priority</SelectItem>
                                    <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                                    <SelectItem value="high" className="text-white">High</SelectItem>
                                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                                    <SelectItem value="low" className="text-white">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                                }}
                                className="border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A]"
                            >
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                {sortOrder === "desc" ? "Newest" : "Oldest"}
                            </Button>
                        </div>
                    </div>

                    {/* Tickets Table */}
                    <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-16">
                                <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No {activeTab === "contact" ? "messages" : "tickets"} found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                        <TableHead className="text-gray-400">Ticket</TableHead>
                                        <TableHead className="text-gray-400">Customer</TableHead>
                                        <TableHead className="text-gray-400">Category</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400">Priority</TableHead>
                                        <TableHead className="text-gray-400">Created</TableHead>
                                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTickets.map((ticket) => {
                                        const status = statusConfig[ticket.status] || statusConfig.open;
                                        const priority = priorityConfig[ticket.priority] || priorityConfig.medium;

                                        return (
                                            <TableRow
                                                key={ticket.id}
                                                className="border-[#2A2A2A] hover:bg-[#0A0A0A] cursor-pointer"
                                                onClick={() => navigate(`/admin/tickets/${ticket.ticket_number}`)}
                                            >
                                                <TableCell>
                                                    <div>
                                                        <p className="font-mono text-xs text-gray-500">{ticket.ticket_number}</p>
                                                        <p className="font-medium text-white truncate max-w-[200px]">{ticket.subject}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-white">{ticket.guest_name || "User"}</p>
                                                            <p className="text-xs text-gray-500">{ticket.guest_email || "Registered User"}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-300 capitalize">
                                                        {ticket.category || "General"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priority.bgColor} ${priority.color}`}>
                                                        {priority.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm text-gray-300">{getTimeAgo(ticket.created_at)}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(ticket.created_at)}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                            <DropdownMenuItem
                                                                onClick={() => navigate(`/admin/tickets/${ticket.ticket_number}`)}
                                                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                                                            <DropdownMenuItem
                                                                onClick={() => updateTicketStatus(ticket.id, "in_progress")}
                                                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
                                                            >
                                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                                Mark In Progress
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => updateTicketStatus(ticket.id, "resolved")}
                                                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                Mark Resolved
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => updateTicketStatus(ticket.id, "closed")}
                                                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                Close Ticket
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                                                            <DropdownMenuItem
                                                                onClick={() => updateTicketPriority(ticket.id, "urgent")}
                                                                className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]"
                                                            >
                                                                <Flag className="w-4 h-4 mr-2" />
                                                                Set Urgent
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
