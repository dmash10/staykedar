import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
    ArrowLeft, Send, Loader2, User, Headphones, 
    Clock, CheckCircle2, AlertCircle,
    MessageSquare, Mail, Phone, Calendar, Check, CheckCheck
} from "lucide-react";

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
    guest_phone?: string | null;
}

interface Message {
    id: string;
    ticket_id?: string;
    message: string;
    sender_type: string;
    sender_id: string | null;
    is_admin: boolean;
    created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    open: { label: "Open", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    in_progress: { label: "In Progress", color: "text-amber-400", bgColor: "bg-amber-500/20" },
    waiting_customer: { label: "Awaiting Reply", color: "text-orange-400", bgColor: "bg-orange-500/20" },
    resolved: { label: "Resolved", color: "text-green-400", bgColor: "bg-green-500/20" },
    closed: { label: "Closed", color: "text-gray-400", bgColor: "bg-gray-500/20" },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    low: { label: "Low", color: "text-gray-400", bgColor: "bg-gray-500/20" },
    medium: { label: "Medium", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    high: { label: "High", color: "text-orange-400", bgColor: "bg-orange-500/20" },
    urgent: { label: "Urgent", color: "text-red-400", bgColor: "bg-red-500/20" },
    critical: { label: "Critical", color: "text-red-500", bgColor: "bg-red-600/20" },
};

export default function AdminTicketDetail() {
    const { ticketNumber } = useParams<{ ticketNumber: string }>();
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isCustomerTyping, setIsCustomerTyping] = useState(false);
    const [customerLastReadAt, setCustomerLastReadAt] = useState<string | null>(null);
    const typingChannelRef = useRef<any>(null);

    // Check if user is at bottom of chat
    const isAtBottom = useCallback(() => {
        if (!messagesContainerRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        // Consider "at bottom" if within 100px of the bottom
        return scrollHeight - scrollTop - clientHeight < 100;
    }, []);

    // Scroll to bottom of messages (only if already at bottom or forced)
    const scrollToBottom = useCallback((force = false) => {
        if (messagesContainerRef.current && (force || isAtBottom())) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [isAtBottom]);

    // Fetch ticket and set up real-time subscription
    useEffect(() => {
        if (!ticketNumber) return;

        let messagesSubscription: any;
        let ticketSubscription: any;

        const fetchTicketData = async () => {
            setIsLoading(true);
            try {
                const { data: ticketData, error: ticketError } = await supabase
                    .from("support_tickets")
                    .select("*")
                    .eq("ticket_number", ticketNumber)
                    .single();

                if (ticketError || !ticketData) {
                    console.error("Ticket fetch error:", ticketError);
                    toast({
                        title: "Error",
                        description: "Ticket not found",
                        variant: "destructive",
                    });
                    navigate("/admin/tickets");
                    return;
                }

                setTicket(ticketData);

                const { data: messagesData, error: messagesError } = await supabase
                    .from("ticket_messages")
                    .select("*")
                    .eq("ticket_id", ticketData.id)
                    .order("created_at", { ascending: true });

                if (messagesError) {
                    console.error("Messages fetch error:", messagesError);
                }

                setMessages(messagesData || []);
                setIsLoading(false);
                
                // Scroll after messages load
                setTimeout(scrollToBottom, 100);

                // Set up real-time subscription for new messages
                messagesSubscription = supabase
                    .channel(`admin-ticket-messages-${ticketData.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'ticket_messages',
                            filter: `ticket_id=eq.${ticketData.id}`
                        },
                        (payload) => {
                            console.log("New message received:", payload);
                            const newMsg = payload.new as Message;
                            // Only add if not already in the list
                            setMessages(prev => {
                                const exists = prev.some(m => m.id === newMsg.id);
                                if (exists) return prev;
                                return [...prev, newMsg];
                            });
                            // Scroll if at bottom OR if it's our own message
                            const isOwnMessage = newMsg.is_admin;
                            setTimeout(() => scrollToBottom(isOwnMessage), 50);
                        }
                    )
                    .subscribe();

                // Set up real-time subscription for ticket changes
                ticketSubscription = supabase
                    .channel(`admin-ticket-status-${ticketData.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'support_tickets',
                            filter: `id=eq.${ticketData.id}`
                        },
                        (payload) => {
                            console.log("Ticket updated:", payload);
                            setTicket(prev => prev ? { ...prev, ...payload.new } : null);
                        }
                    )
                    .subscribe();

                // Subscribe to customer typing indicator and read receipts
                let typingTimeout: NodeJS.Timeout | null = null;
                const typingChannel = supabase.channel(`typing-${ticketData.id}`);
                typingChannel
                    .on('broadcast', { event: 'typing' }, (payload) => {
                        if (!payload.payload?.is_admin) {
                            setIsCustomerTyping(true);
                            // Only scroll if already at bottom (like WhatsApp)
                            setTimeout(() => scrollToBottom(false), 50);
                            // Auto-hide after 2 seconds if no new typing event
                            if (typingTimeout) clearTimeout(typingTimeout);
                            typingTimeout = setTimeout(() => setIsCustomerTyping(false), 2000);
                        }
                    })
                    .on('broadcast', { event: 'read' }, (payload) => {
                        if (!payload.payload?.is_admin && payload.payload?.timestamp) {
                            // Customer has read messages up to this timestamp
                            setCustomerLastReadAt(payload.payload.timestamp);
                        }
                    })
                    .on('broadcast', { event: 'message_sent' }, () => {
                        // New message arrived, stop typing indicator immediately
                        if (typingTimeout) clearTimeout(typingTimeout);
                        setIsCustomerTyping(false);
                    })
                    .subscribe();
                typingChannelRef.current = typingChannel;
                
                // Broadcast that admin is viewing (to mark customer messages as read)
                // Only send when tab is visible and focused (like WhatsApp)
                const sendReadReceipt = () => {
                    // Only send if document is visible (not in background tab)
                    if (document.visibilityState === 'visible' && document.hasFocus()) {
                        typingChannel.send({
                            type: 'broadcast',
                            event: 'read',
                            payload: { is_admin: true, timestamp: new Date().toISOString() }
                        });
                    }
                };
                
                // Send read receipt when tab becomes visible
                const handleVisibilityChange = () => {
                    if (document.visibilityState === 'visible') {
                        sendReadReceipt();
                    }
                };
                
                // Send read receipt when window gains focus
                const handleFocus = () => sendReadReceipt();
                
                document.addEventListener('visibilitychange', handleVisibilityChange);
                window.addEventListener('focus', handleFocus);
                
                // Send initial read receipt if already visible
                if (document.visibilityState === 'visible' && document.hasFocus()) {
                    setTimeout(sendReadReceipt, 1000);
                }
                
                // Store cleanup functions
                (window as any).readReceiptCleanup = () => {
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                    window.removeEventListener('focus', handleFocus);
                };

                // Polling fallback
                const pollInterval = setInterval(async () => {
                    const { data: newMessages } = await supabase
                        .from("ticket_messages")
                        .select("*")
                        .eq("ticket_id", ticketData.id)
                        .order("created_at", { ascending: true });
                    
                    if (newMessages) {
                        setMessages(prev => {
                            if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
                                return newMessages;
                            }
                            return prev;
                        });
                    }

                    const { data: updatedTicket } = await supabase
                        .from("support_tickets")
                        .select("*")
                        .eq("id", ticketData.id)
                        .single();
                        
                    if (updatedTicket) {
                        setTicket(prev => {
                            if (JSON.stringify(prev) !== JSON.stringify(updatedTicket)) {
                                return updatedTicket;
                            }
                            return prev;
                        });
                    }
                }, 5000);

                // Store interval ID to clear it later
                (window as any).pollInterval = pollInterval;

            } catch (error) {
                console.error("Error fetching ticket:", error);
                setIsLoading(false);
            }
        };

        fetchTicketData();

        // Cleanup subscriptions on unmount
        return () => {
            if (messagesSubscription) messagesSubscription.unsubscribe();
            if (ticketSubscription) ticketSubscription.unsubscribe();
            if (typingChannelRef.current) typingChannelRef.current.unsubscribe();
            if ((window as any).pollInterval) clearInterval((window as any).pollInterval);
            if ((window as any).readReceiptCleanup) (window as any).readReceiptCleanup();
        };
    }, [ticketNumber, navigate, toast, scrollToBottom]);

    // Scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Broadcast typing indicator when admin types (debounced)
    const lastTypingBroadcast = useRef<number>(0);
    const broadcastTyping = useCallback(() => {
        const now = Date.now();
        // Only broadcast every 1.5 seconds to avoid spam
        if (typingChannelRef.current && ticket && now - lastTypingBroadcast.current > 1500) {
            lastTypingBroadcast.current = now;
            typingChannelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { is_admin: true }
            });
        }
    }, [ticket]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !ticket) return;

        const messageText = newMessage.trim();
        setIsSending(true);
        
        // Optimistically add message to UI immediately
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            ticket_id: ticket.id,
            sender_type: "admin",
            message: messageText,
            is_admin: true,
            sender_id: user?.id || null,
            created_at: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("");
        
        // Scroll to bottom after adding message
        setTimeout(scrollToBottom, 50);

        try {
            const insertData: any = {
                ticket_id: ticket.id,
                sender_type: "admin",
                message: messageText,
                is_admin: true,
            };

            // Only add sender_id if user exists
            if (user?.id) {
                insertData.sender_id = user.id;
            }

            const { data: newMsg, error: messageError } = await supabase
                .from("ticket_messages")
                .insert(insertData)
                .select()
                .single();

            if (messageError) {
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
                console.error("Message insert error:", messageError);
                throw messageError;
            }

            // Replace optimistic message with real one
            if (newMsg) {
                setMessages(prev => prev.map(m => 
                    m.id === optimisticMessage.id ? newMsg : m
                ));
            }
            
            // Broadcast that message was sent (to stop typing indicator on user side)
            if (typingChannelRef.current) {
                typingChannelRef.current.send({
                    type: 'broadcast',
                    event: 'message_sent',
                    payload: {}
                });
            }

            // Update ticket status locally
            setTicket(prev => prev ? { ...prev, status: "waiting_customer" } : null);

            // Update in database
            await supabase
                .from("support_tickets")
                .update({
                    status: "waiting_customer",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", ticket.id);
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to send message",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const updateTicketStatus = async (newStatus: string) => {
        if (!ticket) return;

        // Update locally immediately
        setTicket(prev => prev ? { ...prev, status: newStatus } : null);

        try {
            const { error } = await supabase
                .from("support_tickets")
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", ticket.id);

            if (error) {
                // Revert on error
                setTicket(prev => prev ? { ...prev, status: ticket.status } : null);
                throw error;
            }

            toast({
                title: "Status Updated",
                description: `Ticket marked as ${statusConfig[newStatus]?.label || newStatus}`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to update status",
                variant: "destructive",
            });
        }
    };

    const updateTicketPriority = async (newPriority: string) => {
        if (!ticket) return;

        // Update locally immediately
        setTicket(prev => prev ? { ...prev, priority: newPriority } : null);

        try {
            const { error } = await supabase
                .from("support_tickets")
                .update({ 
                    priority: newPriority,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", ticket.id);

            if (error) {
                // Revert on error
                setTicket(prev => prev ? { ...prev, priority: ticket.priority } : null);
                throw error;
            }

            toast({ title: "Priority Updated" });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update priority",
                variant: "destructive",
            });
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

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + 
               " · " + date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    if (isLoading) {
        return (
            <AdminLayout title="Ticket Details">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0071c2]" />
                </div>
            </AdminLayout>
        );
    }

    if (!ticket) {
        return (
            <AdminLayout title="Ticket Details">
                <div className="p-6 text-center">
                    <p className="text-gray-400">Ticket not found</p>
                </div>
            </AdminLayout>
        );
    }

    const status = statusConfig[ticket.status] || statusConfig.open;
    const priority = priorityConfig[ticket.priority] || priorityConfig.medium;

    return (
        <AdminLayout title={`Ticket ${ticket.ticket_number}`}>
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate("/admin/tickets")}
                        className="flex items-center gap-2 text-[#0071c2] hover:text-[#005999] mb-3 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tickets
                    </button>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500 bg-[#1A1A1A] px-2 py-0.5 rounded">{ticket.ticket_number}</span>
                        <Badge className={`${status.bgColor} ${status.color} border-0 text-xs`}>{status.label}</Badge>
                        <Badge className={`${priority.bgColor} ${priority.color} border-0 text-xs`}>{priority.label}</Badge>
                    </div>
                    <h1 className="text-lg font-semibold text-white">{ticket.subject}</h1>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Chat Box */}
                    <div className="lg:col-span-2 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden flex flex-col h-[500px]">
                        {/* Chat Header */}
                        <div className="px-4 py-2.5 border-b border-[#2A2A2A] bg-[#0F0F0F] flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#0071c2]" />
                            <span className="font-medium text-white text-sm">Conversation</span>
                            <span className="text-xs text-gray-500 bg-[#2A2A2A] px-1.5 py-0.5 rounded-full">{messages.length}</span>
                        </div>

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0A0A0A]">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                                        <p className="text-sm">No messages yet</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg, index) => {
                                            const isTemp = msg.id.startsWith('temp-');
                                            // Check if customer has read this specific message:
                                            // 1. They replied after this message, OR
                                            // 2. They viewed the chat AFTER this message was sent
                                            const hasReplyAfter = msg.is_admin && messages.slice(index + 1).some(m => !m.is_admin);
                                            const wasReadByCustomer = msg.is_admin && !isTemp && customerLastReadAt && 
                                                new Date(msg.created_at) <= new Date(customerLastReadAt);
                                            const isRead = hasReplyAfter || wasReadByCustomer;
                                            
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex gap-2 ${msg.is_admin ? "flex-row-reverse" : ""}`}
                                                >
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        msg.is_admin 
                                                            ? "bg-[#0071c2]" 
                                                            : "bg-gray-600"
                                                    }`}>
                                                        {msg.is_admin ? (
                                                            <Headphones className="w-3.5 h-3.5 text-white" />
                                                        ) : (
                                                            <User className="w-3.5 h-3.5 text-white" />
                                                        )}
                                                    </div>
                                                    <div className={`max-w-[80%] ${msg.is_admin ? "text-right" : ""}`}>
                                                        <div className={`inline-block px-3 py-1.5 rounded-2xl text-sm ${
                                                            msg.is_admin 
                                                                ? "bg-[#0071c2] text-white rounded-tr-sm" 
                                                                : "bg-[#2A2A2A] text-gray-200 rounded-tl-sm"
                                                        } ${isTemp ? "opacity-70" : ""}`}>
                                                            <p className="whitespace-pre-wrap">{msg.message}</p>
                                                        </div>
                                                        {/* Time and read receipt */}
                                                        <div className={`flex items-center gap-1 mt-0.5 ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                                                            <span className="text-[10px] text-gray-600">
                                                                {formatMessageTime(msg.created_at)}
                                                            </span>
                                                            {msg.is_admin && (
                                                                <span className="flex items-center">
                                                                    {isTemp ? (
                                                                        <Clock className="w-3 h-3 text-gray-500" />
                                                                    ) : isRead ? (
                                                                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                                                    ) : (
                                                                        <CheckCheck className="w-3.5 h-3.5 text-gray-500" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Customer Typing Indicator */}
                                        {isCustomerTyping && (
                                            <div className="flex gap-2 items-end">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600">
                                                    <User className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-2xl rounded-tl-sm px-3 py-1.5">
                                                    <div className="flex gap-0.5 items-center h-4">
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDuration: '1s' }}></span>
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></span>
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.4s' }}></span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-500 mb-0.5">typing...</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Box */}
                        {ticket.status !== "closed" ? (
                            <div className="border-t border-[#2A2A2A] p-3 bg-[#0F0F0F]">
                                {/* Quick Actions */}
                                <div className="flex gap-1.5 mb-2 flex-wrap">
                                    <button
                                        onClick={() => updateTicketStatus("resolved")}
                                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Resolve
                                    </button>
                                    <button
                                        onClick={() => updateTicketStatus("closed")}
                                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => updateTicketPriority("urgent")}
                                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    >
                                        Urgent
                                    </button>
                                    <button
                                        onClick={() => updateTicketStatus("in_progress")}
                                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                    >
                                        In Progress
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <Textarea
                                        ref={textareaRef}
                                        placeholder="Type your reply... (Enter to send)"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            broadcastTyping();
                                        }}
                                        onKeyDown={handleKeyDown}
                                        className="min-h-[50px] max-h-[100px] bg-[#1A1A1A] border-[#2A2A2A] text-white resize-none focus:border-[#0071c2] focus:ring-0 text-sm"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || isSending}
                                        className="bg-[#0071c2] hover:bg-[#005999] text-white h-[50px] w-[50px] p-0 flex-shrink-0"
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-[#2A2A2A] p-3 bg-[#0F0F0F] flex items-center justify-between">
                                <p className="text-gray-500 text-xs">Ticket closed</p>
                                <Button
                                    onClick={() => updateTicketStatus("open")}
                                    size="sm"
                                    className="bg-[#0071c2] hover:bg-[#005999] text-white text-xs h-7"
                                >
                                    Reopen
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Customer Card */}
                        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
                            <h3 className="text-xs text-gray-500 uppercase mb-3">Customer</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {(ticket.guest_name || "U").charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-white text-sm truncate">
                                        {ticket.guest_name || "Customer"}
                                    </p>
                                    <p className="text-xs text-gray-400">Customer</p>
                                </div>
                            </div>
                            {ticket.guest_email && (
                                <a href={`mailto:${ticket.guest_email}`} className="flex items-center gap-2 text-xs text-[#0071c2] hover:underline bg-[#0071c2]/10 rounded px-2 py-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="truncate">{ticket.guest_email}</span>
                                </a>
                            )}
                        </div>

                        {/* Ticket Details */}
                        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
                            <h3 className="text-xs text-gray-500 uppercase mb-3">Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Status</label>
                                    <Select value={ticket.status} onValueChange={updateTicketStatus}>
                                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                            <SelectItem value="open" className="text-white text-xs">Open</SelectItem>
                                            <SelectItem value="in_progress" className="text-white text-xs">In Progress</SelectItem>
                                            <SelectItem value="waiting_customer" className="text-white text-xs">Awaiting Reply</SelectItem>
                                            <SelectItem value="resolved" className="text-white text-xs">Resolved</SelectItem>
                                            <SelectItem value="closed" className="text-white text-xs">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Priority</label>
                                    <Select value={ticket.priority} onValueChange={updateTicketPriority}>
                                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                                            <SelectItem value="low" className="text-white text-xs">Low</SelectItem>
                                            <SelectItem value="medium" className="text-white text-xs">Medium</SelectItem>
                                            <SelectItem value="high" className="text-white text-xs">High</SelectItem>
                                            <SelectItem value="urgent" className="text-white text-xs">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="pt-2 border-t border-[#2A2A2A] space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Category</span>
                                        <span className="text-gray-300 capitalize">{ticket.category || "General"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Created</span>
                                        <span className="text-gray-400">{formatDate(ticket.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Updated</span>
                                        <span className="text-gray-400">{formatDate(ticket.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {ticket.description && (
                            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
                                <h3 className="text-xs text-gray-500 uppercase mb-2">Description</h3>
                                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
