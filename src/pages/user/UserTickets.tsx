import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

export default function UserTickets() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Form state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('other');
    const [priority, setPriority] = useState('low');
    const [message, setMessage] = useState('');

    const { data: tickets, isLoading, refetch } = useQuery({
        queryKey: ['user-tickets'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Create ticket
            const { data: ticket, error: ticketError } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: user.id,
                    subject,
                    category,
                    priority,
                    status: 'open'
                })
                .select()
                .single();

            if (ticketError) throw ticketError;

            // 2. Create initial message
            const { error: messageError } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: ticket.id,
                    sender_id: user.id,
                    message,
                    is_admin: false
                });

            if (messageError) throw messageError;

            toast({
                title: 'Ticket Created',
                description: 'We have received your request and will respond shortly.',
            });

            setIsCreateOpen(false);
            setSubject('');
            setMessage('');
            setCategory('other');
            refetch();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            open: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-amber-100 text-amber-800',
            closed: 'bg-green-100 text-green-800',
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || styles.open}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-gray-500 mt-1">Track and manage your support requests</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Support Ticket</DialogTitle>
                            <DialogDescription>
                                Describe your issue and we'll help you resolve it.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief summary of the issue"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="booking">Booking Issue</SelectItem>
                                            <SelectItem value="payment">Payment</SelectItem>
                                            <SelectItem value="account">Account</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Description</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Please provide details..."
                                    className="min-h-[100px]"
                                    required
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Submit Ticket'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : tickets?.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
                        <p className="text-gray-500 mb-4">You haven't created any support tickets.</p>
                        <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                            Create your first ticket
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets?.map((ticket) => (
                        <Link key={ticket.id} to={`/dashboard/tickets/${ticket.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg text-gray-900">{ticket.subject}</h3>
                                                {getStatusBadge(ticket.status)}
                                                <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Created on {format(new Date(ticket.created_at), 'MMM dd, yyyy')} • ID: #{ticket.id.slice(0, 8)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${ticket.priority === 'high' || ticket.priority === 'critical'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {ticket.priority.toUpperCase()} Priority
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
