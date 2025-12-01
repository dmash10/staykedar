import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Send,
    User,
    Mail,
    Phone,
    Calendar,
    MessageSquare,
    Clock,
    AlertTriangle,
    CheckCircle,
    FileText,
    Zap,
    StickyNote,
    Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function AdminTicketDetail() {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [internalNote, setInternalNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);

    // Fetch ticket details
    const { data: ticket, isLoading: isTicketLoading } = useQuery({
        queryKey: ['admin-ticket', ticketId],
        queryFn: async () => {
            const isTicketNumber = ticketId?.startsWith('TKT-');

            if (isTicketNumber) {
                const { data, error } = await supabase.rpc('get_ticket_by_number', {
                    p_ticket_number: ticketId
                });
                if (error) throw error;
                return data?.[0];
            } else {
                const { data, error } = await supabase
                    .from('support_tickets')
                    .select('*')
                    .eq('id', ticketId)
                    .single();
                if (error) throw error;
                return data;
            }
        },
        enabled: !!ticketId,
    });

    // Fetch user profile for registered users
    const { data: userProfile } = useQuery({
        queryKey: ['user-profile', ticket?.user_id],
        queryFn: async () => {
            if (!ticket?.user_id) return null;
            const { data, error } = await supabase
                .from('customer_details')
                .select('*')
                .eq('id', ticket.user_id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!ticket?.user_id,
    });

    // Fetch messages
    const { data: messages, isLoading: isMessagesLoading } = useQuery({
        queryKey: ['ticket-messages', ticketId],
        queryFn: async () => {
            if (!ticket?.id) return [];
            const { data, error } = await supabase
                .from('ticket_messages')
                .select('*')
                .eq('ticket_id', ticket.id)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data;
        },
        enabled: !!ticket?.id,
        refetchInterval: 5000,
    });

    // Fetch internal notes
    const { data: internalNotes } = useQuery({
        queryKey: ['internal-notes', ticket?.id],
        queryFn: async () => {
            if (!ticket?.id) return [];
            const { data, error } = await supabase.rpc('get_internal_notes', {
                p_ticket_id: ticket.id
            });
            if (error) throw error;
            return data;
        },
        enabled: !!ticket?.id,
    });

    // Fetch canned responses
    const { data: cannedResponses } = useQuery({
        queryKey: ['canned-responses'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_canned_responses', {
                p_category: null
            });
            if (error) throw error;
            return data;
        },
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!ticket?.id) throw new Error('Ticket not found');

            const { data, error } = await supabase.rpc('create_admin_message', {
                p_ticket_id: ticket.id,
                p_message: content
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-messages'] });
            setMessage('');
            toast.success('Message sent');
        },
        onError: () => {
            toast.error('Failed to send message');
        }
    });

    // Add internal note mutation
    const addNoteMutation = useMutation({
        mutationFn: async (note: string) => {
            if (!ticket?.id) throw new Error('Ticket not found');

            const { data, error } = await supabase.rpc('add_internal_note', {
                p_ticket_id: ticket.id,
                p_note: note
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['internal-notes'] });
            setInternalNote('');
            setShowNoteInput(false);
            toast.success('Internal note added');
        },
        onError: () => {
            toast.error('Failed to add note');
        }
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            const { error } = await supabase.rpc('update_ticket_status', {
                p_ticket_number: ticket?.ticket_number || ticketId!,
                p_new_status: newStatus
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ticket'] });
            toast.success('Status updated');
        },
        onError: () => {
            toast.error('Failed to update status');
        }
    });

    const handleSendMessage = () => {
        if (!message.trim()) return;
        sendMessageMutation.mutate(message);
    };

    const handleAddNote = () => {
        if (!internalNote.trim()) return;
        addNoteMutation.mutate(internalNote);
    };

    const insertCannedResponse = (content: string) => {
        setMessage(content);
    };

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const displayName = userProfile?.name || ticket?.guest_name || 'Guest User';
    const displayEmail = userProfile?.email || ticket?.guest_email || 'N/A';
    const displayPhone = userProfile?.phone_number || ticket?.guest_phone || 'N/A';

    if (isTicketLoading) {
        return (
            <AdminLayout title="Ticket Details">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-slate-400">Loading ticket...</div>
                </div>
            </AdminLayout>
        );
    }

    if (!ticket) {
        return (
            <AdminLayout title="Ticket Details">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-slate-400">Ticket not found</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Ticket Details">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
                {/* Header */}
                <div className="bg-slate-800/50 border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/tickets')}
                                className="text-slate-400 hover:text-slate-100"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Tickets
                            </Button>
                            <Separator orientation="vertical" className="h-6 bg-slate-700" />
                            <div>
                                <h1 className="text-xl font-bold text-slate-100">
                                    {ticket.ticket_number || `#${ticket.id.slice(0, 8)}`}
                                </h1>
                                <p className="text-sm text-slate-400">{ticket.subject}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                                {ticket.category}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Main Content - 3 Column Layout */}
                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                    {/* Left Sidebar - User Profile */}
                    <div className="col-span-3 bg-slate-800/30 border-r border-slate-700 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* User Avatar and Name */}
                            <div className="text-center">
                                <Avatar className="h-24 w-24 mx-auto mb-4 ring-2 ring-slate-700">
                                    <AvatarImage src={userProfile?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-semibold text-slate-100">{displayName}</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {ticket.user_id ? 'Registered User' : 'Guest'}
                                </p>
                            </div>

                            <Separator className="bg-slate-700" />

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Contact Information
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-400">Email</p>
                                            <p className="text-sm text-slate-200 break-all">{displayEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400">Phone</p>
                                            <p className="text-sm text-slate-200">{displayPhone}</p>
                                        </div>
                                    </div>

                                    {userProfile?.created_at && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-400">Member Since</p>
                                                <p className="text-sm text-slate-200">
                                                    {format(new Date(userProfile.created_at), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-slate-700" />

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Quick Actions
                                </h4>
                                {displayEmail !== 'N/A' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                                        onClick={() => window.open(`mailto:${displayEmail}`, '_blank')}
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email Customer
                                    </Button>
                                )}
                                {displayPhone !== 'N/A' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                                        onClick={() => window.open(`tel:${displayPhone}`, '_blank')}
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Customer
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center - Conversation */}
                    <div className="col-span-6 flex flex-col bg-slate-900/30">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {isMessagesLoading ? (
                                <div className="text-center text-slate-400">Loading messages...</div>
                            ) : (
                                <>
                                    {messages?.map((msg: any) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 ${msg.is_admin ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            <Avatar className="h-10 w-10 flex-shrink-0">
                                                {msg.is_admin ? (
                                                    <AvatarFallback className="bg-blue-500 text-white">
                                                        <User className="h-5 w-5" />
                                                    </AvatarFallback>
                                                ) : (
                                                    <>
                                                        <AvatarImage src={userProfile?.avatar_url || undefined} />
                                                        <AvatarFallback className="bg-slate-700 text-slate-300">
                                                            {getInitials(displayName)}
                                                        </AvatarFallback>
                                                    </>
                                                )}
                                            </Avatar>
                                            <div className={`flex-1 max-w-[70%] ${msg.is_admin ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {msg.is_admin ? (
                                                        <>
                                                            <span className="text-xs text-slate-400">
                                                                {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : ''}
                                                            </span>
                                                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                                                Support Team
                                                            </Badge>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-medium text-slate-300">{displayName}</span>
                                                            <span className="text-xs text-slate-400">
                                                                {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : ''}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div
                                                    className={`rounded-2xl p-4 ${msg.is_admin
                                                        ? 'bg-blue-500/20 border border-blue-500/30'
                                                        : 'bg-slate-800/50 border border-slate-700'
                                                        }`}
                                                >
                                                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Internal Notes */}
                                    {internalNotes && internalNotes.length > 0 && (
                                        <div className="space-y-3 mt-6">
                                            <div className="flex items-center gap-2">
                                                <StickyNote className="h-4 w-4 text-amber-400" />
                                                <h4 className="text-sm font-semibold text-amber-400">Internal Notes</h4>
                                            </div>
                                            {internalNotes.map((note: any) => (
                                                <div key={note.id} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-medium text-amber-400">
                                                            {note.admin_name || 'Admin'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {note.created_at ? format(new Date(note.created_at), 'MMM dd, HH:mm') : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{note.note}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Message Input Area */}
                        <div className="border-t border-slate-700 p-4 bg-slate-800/50 space-y-3">
                            {/* Canned Responses */}
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                                        >
                                            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                                            Quick Replies
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-slate-800 border-slate-700 w-64">
                                        <DropdownMenuLabel className="text-slate-300">Canned Responses</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-700" />
                                        {cannedResponses?.map((response: any) => (
                                            <DropdownMenuItem
                                                key={response.id}
                                                onClick={() => insertCannedResponse(response.content)}
                                                className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer hover:text-white"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{response.title}</span>
                                                    {response.shortcut && (
                                                        <span className="text-xs text-slate-400">{response.shortcut}</span>
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNoteInput(!showNoteInput)}
                                    className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    <StickyNote className="h-4 w-4 mr-2 text-amber-500" />
                                    Internal Note
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateStatusMutation.mutate('closed')}
                                    className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-green-900/30 hover:text-green-400 hover:border-green-500/50"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    Resolve
                                </Button>
                            </div>

                            {/* Internal Note Input */}
                            {showNoteInput && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2">
                                    <label className="text-xs font-medium text-amber-400">Add Internal Note (Admin Only)</label>
                                    <Textarea
                                        value={internalNote}
                                        onChange={(e) => setInternalNote(e.target.value)}
                                        placeholder="This note won't be visible to the customer..."
                                        className="bg-slate-900/50 border-amber-500/30 text-slate-200 min-h-[60px]"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleAddNote}
                                            disabled={!internalNote.trim()}
                                            className="bg-amber-500 hover:bg-amber-600"
                                        >
                                            Save Note
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setShowNoteInput(false);
                                                setInternalNote('');
                                            }}
                                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="flex gap-2">
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your response..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    className="bg-slate-900/50 border-slate-700 text-slate-200 min-h-[80px] resize-none"
                                    disabled={ticket.status === 'closed'}
                                />
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || ticket.status === 'closed'}
                                        className="bg-blue-500 hover:bg-blue-600"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">
                                Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Shift+Enter</kbd> for new line
                            </p>
                        </div>
                    </div>

                    {/* Right Sidebar - Ticket Info & Actions */}
                    <div className="col-span-3 bg-slate-800/30 border-l border-slate-700 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Status & Priority */}
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-slate-300">Ticket Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-2 block">Status</label>
                                        <Select
                                            value={ticket.status}
                                            onValueChange={(value) => updateStatusMutation.mutate(value)}
                                        >
                                            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="open" className="text-blue-400 focus:text-white hover:text-white">Open</SelectItem>
                                                <SelectItem value="in_progress" className="text-amber-400 focus:text-white hover:text-white">In Progress</SelectItem>
                                                <SelectItem value="closed" className="text-green-400 focus:text-white hover:text-white">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 mb-2 block">Priority</label>
                                        <Badge variant="outline" className="w-full justify-center py-2 border-slate-600 text-slate-300">
                                            {ticket.priority}
                                        </Badge>
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 mb-2 block">Category</label>
                                        <Badge variant="outline" className="w-full justify-center py-2 border-slate-600 text-slate-300">
                                            {ticket.category}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-slate-300">Timeline</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-500/20 p-2 rounded">
                                            <Clock className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400">Created</p>
                                            <p className="text-sm text-slate-200">
                                                {ticket.created_at ? format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-green-500/20 p-2 rounded">
                                            <MessageSquare className="h-4 w-4 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400">Last Updated</p>
                                            <p className="text-sm text-slate-200">
                                                {ticket.updated_at ? format(new Date(ticket.updated_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-purple-500/20 p-2 rounded">
                                            <FileText className="h-4 w-4 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400">Total Messages</p>
                                            <p className="text-sm text-slate-200">{messages?.length || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
