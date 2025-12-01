import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, ArrowLeft, User, ShieldCheck } from "lucide-react";
import Container from "@/components/Container";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import { format } from "date-fns";

export default function PublicTicketDetail() {
    const [searchParams] = useSearchParams();
    const ticketNumber = searchParams.get("ticket_number");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState("");

    // Fetch Ticket Details
    const { data: ticket, isLoading: isTicketLoading, error: ticketError } = useQuery({
        queryKey: ["public-ticket", ticketNumber],
        queryFn: async () => {
            if (!ticketNumber) throw new Error("Missing ticket number");

            const { data, error } = await supabase.rpc("get_ticket_by_number", {
                p_ticket_number: ticketNumber
            });

            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Invalid Ticket Number");

            return data[0];
        },
        enabled: !!ticketNumber,
        retry: false
    });

    // Fetch Messages
    const { data: messages } = useQuery({
        queryKey: ["public-ticket-messages", ticketNumber],
        queryFn: async () => {
            if (!ticketNumber) return [];

            const { data, error } = await supabase.rpc("get_ticket_messages_by_number", {
                p_ticket_number: ticketNumber
            });

            if (error) throw error;
            return data || [];
        },
        enabled: !!ticket && !!ticketNumber,
    });

    // Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (message: string) => {
            if (!ticketNumber) throw new Error("Missing ticket number");

            const { data, error } = await supabase.rpc("create_ticket_message", {
                p_ticket_number: ticketNumber,
                p_message: message
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            setNewMessage("");
            queryClient.invalidateQueries({ queryKey: ["public-ticket-messages"] });
            toast({
                title: "Message Sent",
                description: "Your reply has been added to the ticket.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            open: "bg-blue-100 text-blue-800 border-blue-200",
            in_progress: "bg-amber-100 text-amber-800 border-amber-200",
            closed: "bg-green-100 text-green-800 border-green-200",
        };
        return (
            <Badge className={`${styles[status as keyof typeof styles] || styles.open} border`}>
                {status.replace("_", " ").toUpperCase()}
            </Badge>
        );
    };

    if (!ticketNumber) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50/30">
                <Nav />
                <Container className="flex-grow flex items-center justify-center">
                    <Card className="max-w-md w-full text-center p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-red-600 mb-3">Invalid Access</h2>
                        <p className="text-gray-600 mb-6">Ticket Number is required.</p>
                        <Button asChild size="lg">
                            <Link to="/support/track">Go to Tracking Page</Link>
                        </Button>
                    </Card>
                </Container>
                <Footer />
            </div>
        );
    }

    if (isTicketLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50/30">
                <Nav />
                <Container className="flex-grow flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </Container>
                <Footer />
            </div>
        );
    }

    if (ticketError || !ticket) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50/30">
                <Nav />
                <Container className="flex-grow flex items-center justify-center">
                    <Card className="max-w-md w-full text-center p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-red-600 mb-3">Ticket Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find a ticket with the provided ID. Please check your Ticket Number.
                        </p>
                        <Button asChild size="lg">
                            <Link to="/support/track">Try Again</Link>
                        </Button>
                    </Card>
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50/30">
            <Helmet>
                <title>Ticket #{ticket.ticket_number} | Staykedar Support</title>
            </Helmet>
            <Nav />

            <main className="flex-grow py-12">
                <Container>
                    <div className="mb-8">
                        <Link to="/support/track" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mb-6 font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Tracking
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {ticket.subject}
                                </h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {getStatusBadge(ticket.status)}
                                    <span className="text-gray-500">
                                        Ticket #{ticket.ticket_number}
                                    </span>
                                    {ticket.created_at && (
                                        <span className="text-gray-400">
                                            • {format(new Date(ticket.created_at), "MMM dd, yyyy")}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Badge variant="outline" className="text-sm px-4 py-2 border-primary/30">
                                {ticket.category}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content: Messages */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-4">
                                {messages?.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_type === "admin" ? "justify-start" : "justify-end"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl p-5 ${msg.sender_type === "admin"
                                                    ? "bg-white border-2 border-gray-200 shadow-sm"
                                                    : "bg-primary/10 border-2 border-primary/20"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                {msg.sender_type === "admin" ? (
                                                    <>
                                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                                        <span className="text-sm font-bold text-primary">Support Team</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm font-bold text-gray-600">You</span>
                                                    </>
                                                )}
                                                {msg.created_at && (
                                                    <span className="text-xs text-gray-400 ml-auto">
                                                        {format(new Date(msg.created_at), "h:mm a, MMM dd")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Box */}
                            {ticket.status !== "closed" && (
                                <Card className="border-2 shadow-lg">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-xl">Add a Reply</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSendMessage} className="space-y-4">
                                            <Textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message here..."
                                                className="min-h-[120px] text-base"
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                                                >
                                                    {sendMessageMutation.isPending ? (
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    ) : (
                                                        <Send className="w-5 h-5 mr-2" />
                                                    )}
                                                    Send Reply
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar: Details */}
                        <div className="space-y-6">
                            <Card className="border-2 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl">Ticket Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-1">Status</p>
                                        <p className="text-base font-medium capitalize">{ticket.status.replace("_", " ")}</p>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-semibold text-gray-500 mb-1">Category</p>
                                        <p className="text-base font-medium capitalize">{ticket.category}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Container>
            </main>

            <Footer />
        </div>
    );
}
