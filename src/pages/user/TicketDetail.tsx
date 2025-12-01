import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, ArrowLeft, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TicketDetail() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch ticket details
    const { data: ticket, isLoading: isTicketLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('id', ticketId)
                .single();

            if (error) throw error;
            return data;
        }
    });

    // Fetch messages
    const { data: messages, isLoading: isMessagesLoading } = useQuery({
        queryKey: ['ticket-messages', ticketId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ticket_messages')
                .select(`
          *,
          sender:sender_id (
            email
          )
        `)
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data;
        },
        // Poll for new messages every 5 seconds
        refetchInterval: 5000
    });

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: ticketId,
                    sender_id: user.id,
                    message: content,
                    is_admin: false
                });

            if (error) throw error;
        },
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: 'Failed to send message',
                variant: 'destructive',
            });
        }
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessageMutation.mutate(newMessage);
    };

    if (isTicketLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">Ticket not found</h2>
                <Button onClick={() => navigate('/dashboard/tickets')} className="mt-4">
                    Back to Tickets
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/tickets')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {ticket.subject}
                        <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                            {ticket.status.toUpperCase()}
                        </Badge>
                    </h1>
                    <p className="text-sm text-gray-500">
                        Ticket #{ticket.id.slice(0, 8)} • {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-gray-200 shadow-sm">
                <CardContent className="flex-1 p-0 flex flex-col h-full">
                    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                        <div className="space-y-6">
                            {messages?.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.is_admin ? 'flex-row' : 'flex-row-reverse'}`}
                                >
                                    <Avatar className="w-8 h-8 mt-1">
                                        <AvatarFallback className={msg.is_admin ? 'bg-blue-600 text-white' : 'bg-gray-200'}>
                                            {msg.is_admin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`max-w-[80%] rounded-lg p-4 ${msg.is_admin
                                                ? 'bg-gray-100 text-gray-900 rounded-tl-none'
                                                : 'bg-blue-600 text-white rounded-tr-none'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <span className={`text-xs mt-2 block ${msg.is_admin ? 'text-gray-500' : 'text-blue-100'}`}>
                                            {format(new Date(msg.created_at), 'HH:mm')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-gray-50">
                        {ticket.status === 'closed' ? (
                            <div className="text-center text-gray-500 py-2 bg-gray-100 rounded-lg">
                                This ticket has been closed. You cannot send new messages.
                            </div>
                        ) : (
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1"
                                    disabled={sendMessageMutation.isPending}
                                />
                                <Button
                                    type="submit"
                                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {sendMessageMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
