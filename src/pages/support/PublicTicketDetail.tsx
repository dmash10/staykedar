import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
    ArrowLeft, Send, Loader2, User, 
    Headphones, AlertCircle, CheckCircle2, MessageSquare,
    Clock, RefreshCw, Check, CheckCheck
} from "lucide-react";
import { Helmet } from "react-helmet";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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
    guest_name: string | null;
    guest_email: string | null;
    user_id: string | null;
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

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
    open: { label: "Open", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    in_progress: { label: "In Progress", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
    waiting_customer: { label: "Awaiting Your Reply", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    resolved: { label: "Resolved", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
    closed: { label: "Closed", color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
    low: { label: "Low", color: "text-gray-600" },
    medium: { label: "Medium", color: "text-blue-600" },
    high: { label: "High", color: "text-orange-600" },
    urgent: { label: "Urgent", color: "text-red-600" },
    critical: { label: "Critical", color: "text-red-700" },
};

export default function PublicTicketDetail() {
    const { ticketNumber } = useParams<{ ticketNumber: string }>();
    const { toast } = useToast();
    const navigate = useNavigate();
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<any>(null);
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [adminLastReadAt, setAdminLastReadAt] = useState<string | null>(null);
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

    // Check user on mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
        };
        checkUser();
    }, []);

    // Fetch ticket and set up real-time subscription
    useEffect(() => {
        if (!ticketNumber) return;

        const fetchTicketData = async () => {
            setIsLoading(true);
            try {
                // Fetch ticket
                const { data: ticketData, error: ticketError } = await supabase
                    .from("support_tickets")
                    .select("*")
                    .eq("ticket_number", ticketNumber)
                    .single();

                if (ticketError || !ticketData) {
                    setNotFound(true);
                    setIsLoading(false);
                    return;
                }

                setTicket(ticketData);

                // Fetch messages
                const { data: messagesData } = await supabase
                    .from("ticket_messages")
                    .select("*")
                    .eq("ticket_id", ticketData.id)
                    .order("created_at", { ascending: true });

                setMessages(messagesData || []);
                setIsLoading(false);
                
                // Scroll after messages load (force scroll on initial load)
                setTimeout(() => scrollToBottom(true), 100);

                // Set up real-time subscription for new messages
                const messagesSubscription = supabase
                    .channel(`ticket-messages-${ticketData.id}`)
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
                            // Only add if not already in the list (avoid duplicates from optimistic updates)
                            setMessages(prev => {
                                const exists = prev.some(m => m.id === newMsg.id);
                                if (exists) return prev;
                                return [...prev, newMsg];
                            });
                            // Scroll if at bottom OR if it's our own message
                            const isOwnMessage = !newMsg.is_admin;
                            setTimeout(() => scrollToBottom(isOwnMessage), 50);
                        }
                    )
                    .subscribe();

                // Set up real-time subscription for ticket status changes
                const ticketSubscription = supabase
                    .channel(`ticket-status-${ticketData.id}`)
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

                // Subscribe to typing indicator and read receipts
                let typingTimeout: NodeJS.Timeout | null = null;
                const typingChannel = supabase.channel(`typing-${ticketData.id}`);
                typingChannel
                    .on('broadcast', { event: 'typing' }, (payload) => {
                        if (payload.payload?.is_admin) {
                            setIsTyping(true);
                            // Only scroll if user is already at bottom
                            setTimeout(() => scrollToBottom(false), 50);
                            // Auto-hide after 2 seconds if no new typing event
                            if (typingTimeout) clearTimeout(typingTimeout);
                            typingTimeout = setTimeout(() => setIsTyping(false), 2000);
                        }
                    })
                    .on('broadcast', { event: 'read' }, (payload) => {
                        if (payload.payload?.is_admin && payload.payload?.timestamp) {
                            // Admin has read messages up to this timestamp
                            setAdminLastReadAt(payload.payload.timestamp);
                        }
                    })
                    .on('broadcast', { event: 'message_sent' }, () => {
                        // New message arrived, stop typing indicator immediately
                        if (typingTimeout) clearTimeout(typingTimeout);
                        setIsTyping(false);
                    })
                    .subscribe();
                typingChannelRef.current = typingChannel;
                
                // Broadcast that user is viewing (to mark admin messages as read)
                // Only send when tab is visible and focused (like WhatsApp)
                const sendReadReceipt = () => {
                    // Only send if document is visible (not in background tab)
                    if (document.visibilityState === 'visible' && document.hasFocus()) {
                        typingChannel.send({
                            type: 'broadcast',
                            event: 'read',
                            payload: { is_admin: false, timestamp: new Date().toISOString() }
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

                // Polling fallback every 5 seconds
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

                // Cleanup subscriptions on unmount
                return () => {
                    messagesSubscription.unsubscribe();
                    ticketSubscription.unsubscribe();
                    if (typingChannelRef.current) typingChannelRef.current.unsubscribe();
                    clearInterval(pollInterval);
                    if ((window as any).readReceiptCleanup) (window as any).readReceiptCleanup();
                };

            } catch (error) {
                console.error("Error fetching ticket:", error);
                setNotFound(true);
                setIsLoading(false);
            }
        };

        fetchTicketData();
    }, [ticketNumber, scrollToBottom]);

    // Scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Broadcast typing indicator when user types (debounced)
    const lastTypingBroadcast = useRef<number>(0);
    const broadcastTyping = useCallback(() => {
        const now = Date.now();
        // Only broadcast every 1.5 seconds to avoid spam
        if (typingChannelRef.current && ticket && now - lastTypingBroadcast.current > 1500) {
            lastTypingBroadcast.current = now;
            typingChannelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { is_admin: false }
            });
        }
    }, [ticket]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !ticket || isSending) return;

        const messageText = newMessage.trim();
        setNewMessage("");
        setIsSending(true);
        
        // Focus back on input
        inputRef.current?.focus();

        // Create optimistic message
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            ticket_id: ticket.id,
            sender_type: "user",
            message: messageText,
            is_admin: false,
            sender_id: user?.id || null,
            created_at: new Date().toISOString(),
        };
        
        // Add optimistic message immediately
        setMessages(prev => [...prev, optimisticMessage]);
        setTimeout(scrollToBottom, 10);

        try {
            const insertData: any = {
                ticket_id: ticket.id,
                sender_type: "user",
                message: messageText,
                is_admin: false,
            };

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
                setMessages(prev => prev.filter(m => m.id !== tempId));
                throw messageError;
            }

            // Replace optimistic message with real one
            if (newMsg) {
                setMessages(prev => prev.map(m => m.id === tempId ? newMsg : m));
            }
            
            // Broadcast that message was sent (to stop typing indicator on admin side)
            if (typingChannelRef.current) {
                typingChannelRef.current.send({
                    type: 'broadcast',
                    event: 'message_sent',
                    payload: {}
                });
            }

            // Update ticket status if needed
            const newStatus = ticket.status === "waiting_customer" || ticket.status === "resolved" ? "open" : ticket.status;
            if (newStatus !== ticket.status) {
                await supabase
                    .from("support_tickets")
                    .update({ 
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", ticket.id);
                
                setTicket(prev => prev ? { ...prev, status: newStatus } : null);
            }

        } catch (error: any) {
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

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + 
               " · " + date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <>
                <Nav />
                <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0071c2]" />
                </div>
                <Footer />
            </>
        );
    }

    if (notFound || !ticket) {
        return (
            <>
                <Helmet>
                    <title>Ticket Not Found | StayKedarnath</title>
                </Helmet>
                <Nav />
                <div className="min-h-screen bg-gray-50 pt-20">
                    <div className="max-w-xl mx-auto px-4 py-16 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h1>
                        <p className="text-gray-600 mb-6">Please check the ticket number and try again.</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Button 
                                variant="outline" 
                                onClick={() => navigate("/support/track")}
                                className="border-gray-300 text-gray-700"
                            >
                                Track Another
                            </Button>
                            <Button 
                                onClick={() => navigate("/support/raise")} 
                                className="bg-[#0071c2] hover:bg-[#005999] text-white"
                            >
                                New Ticket
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const status = statusConfig[ticket.status] || statusConfig.open;
    const priority = priorityConfig[ticket.priority] || priorityConfig.medium;

    return (
        <>
            <Helmet>
                <title>{ticket.ticket_number} | StayKedarnath Support</title>
            </Helmet>
            <Nav />
            
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-5xl mx-auto px-3 md:px-4 pt-2 pb-4">
                    <Link 
                        to="/help" 
                        className="inline-flex items-center gap-2 text-[#0071c2] hover:text-[#005999] mb-2 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Help
                    </Link>

                    {/* Mobile Header */}
                    <div className="lg:hidden mb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{ticket.ticket_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>{status.label}</span>
                        </div>
                        <h1 className="text-base font-bold text-gray-900 line-clamp-2">{ticket.subject}</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        {/* Chat Area */}
                        <div className="lg:col-span-8 order-2 lg:order-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)', minHeight: '350px' }}>
                                {/* Desktop Header */}
                                <div className="hidden lg:flex px-4 py-2 border-b border-gray-100 items-center gap-3 bg-white">
                                    <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{ticket.ticket_number}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>{status.label}</span>
                                    <h1 className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</h1>
                                </div>

                                {/* Messages */}
                                <div 
                                    ref={messagesContainerRef} 
                                    className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
                                >
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                                            <p className="text-sm font-medium">No messages yet</p>
                                            <p className="text-xs mt-1">Start the conversation below</p>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((msg, index) => {
                                                const isUser = !msg.is_admin;
                                                const isTemp = msg.id.startsWith('temp-');
                                                // Check if admin has read this specific message:
                                                // 1. They replied after this message, OR
                                                // 2. They viewed the chat AFTER this message was sent
                                                const hasReplyAfter = isUser && messages.slice(index + 1).some(m => m.is_admin);
                                                const wasReadByAdmin = isUser && !isTemp && adminLastReadAt && 
                                                    new Date(msg.created_at) <= new Date(adminLastReadAt);
                                                const isRead = hasReplyAfter || wasReadByAdmin;
                                                
                                                return (
                                                    <div 
                                                        key={msg.id} 
                                                        className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                                                    >
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            isUser ? "bg-[#0071c2]" : "bg-slate-700"
                                                        }`}>
                                                            {isUser ? (
                                                                <User className="w-3.5 h-3.5 text-white" />
                                                            ) : (
                                                                <Headphones className="w-3.5 h-3.5 text-white" />
                                                            )}
                                                        </div>
                                                        <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
                                                            <div className={`inline-block px-3 py-1.5 rounded-2xl text-sm ${
                                                                isUser 
                                                                    ? "bg-[#0071c2] text-white rounded-tr-sm" 
                                                                    : "bg-slate-200 text-gray-900 rounded-tl-sm"
                                                            } ${isTemp ? "opacity-70" : ""}`}>
                                                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                                            </div>
                                                            {/* Time and read receipt for user messages */}
                                                            <div className={`flex items-center gap-1 mt-0.5 ${isUser ? "justify-end" : "justify-start"}`}>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {formatMessageTime(msg.created_at)}
                                                                </span>
                                                                {isUser && (
                                                                    <span className="flex items-center">
                                                                        {isTemp ? (
                                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                                        ) : isRead ? (
                                                                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                                                        ) : (
                                                                            <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            
                                            {/* Typing Indicator */}
                                            {isTyping && (
                                                <div className="flex gap-2 items-end">
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-600">
                                                        <Headphones className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-1.5">
                                                        <div className="flex gap-0.5 items-center h-4">
                                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDuration: '1s' }}></span>
                                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></span>
                                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.4s' }}></span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mb-0.5">typing...</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Input Area */}
                                {ticket.status !== "closed" ? (
                                    <div className="border-t border-gray-200 p-2 bg-white">
                                        <div className="flex gap-2 items-center">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value);
                                                    broadcastTyping();
                                                }}
                                                onKeyDown={handleKeyDown}
                                                disabled={isSending}
                                                className="flex-1 px-3 py-2 rounded-full border border-gray-200 focus:border-[#0071c2] outline-none text-sm bg-gray-50 focus:bg-white"
                                            />
                                            <Button 
                                                onClick={handleSendMessage} 
                                                disabled={!newMessage.trim() || isSending} 
                                                className="bg-[#0071c2] hover:bg-[#005999] h-9 w-9 rounded-full p-0 flex-shrink-0"
                                            >
                                                {isSending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t p-3 bg-gray-50 text-center">
                                        <p className="text-sm text-gray-600">
                                            This ticket is closed. 
                                            <Link to="/support/raise" className="text-[#0071c2] ml-1 hover:underline">Create new →</Link>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 order-1 lg:order-2 space-y-2">
                            {ticket.status === "waiting_customer" && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-orange-600" />
                                        <p className="font-medium text-orange-800 text-sm">Your reply needed</p>
                                    </div>
                                </div>
                            )}
                            {ticket.status === "resolved" && (
                                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <p className="font-medium text-green-800 text-sm">Resolved</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-lg shadow-sm border p-3">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-[#0071c2]" />
                                    Ticket Details
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase block">Status</span>
                                        <span className={`font-medium text-xs ${status.color}`}>{status.label}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase block">Priority</span>
                                        <span className={`font-medium text-xs ${priority.color}`}>{priority.label}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase block">Category</span>
                                        <span className="font-medium text-gray-900 text-xs capitalize">{ticket.category || "General"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase block">Created</span>
                                        <span className="text-gray-700 text-xs">{formatDate(ticket.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
