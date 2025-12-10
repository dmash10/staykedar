import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Bell,
    CheckCircle2,
    XCircle,
    ShoppingCart,
    Users,
    AlertTriangle,
    CreditCard,
    MessageSquare,
    Settings,
    Loader2,
    Clock,
    Check,
    Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Notification type icons and colors
const NOTIFICATION_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    booking: { icon: ShoppingCart, color: 'text-green-400', bg: 'bg-green-500/10' },
    lead: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    refund: { icon: CreditCard, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    support: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    payment: { icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    alert: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    system: { icon: Settings, color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    priority: string;
    created_at: string;
}

export default function NotificationCenter() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications
    const { data: notifications, isLoading } = useQuery({
        queryKey: ['admin-notifications'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('admin_notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as Notification[];
        },
        staleTime: 10000,
    });

    // Subscribe to real-time notifications
    useEffect(() => {
        const channel = supabase
            .channel('admin-notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'admin_notifications',
                },
                (payload) => {
                    // Invalidate query to refetch
                    queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });

                    // Show browser notification if supported
                    if ('Notification' in window && Notification.permission === 'granted') {
                        const notification = payload.new as Notification;
                        new Notification(notification.title, {
                            body: notification.message,
                            icon: '/favicon.ico',
                        });
                    }
                }
            )
            .subscribe();

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await supabase
                .from('admin_notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    // Mark all as read
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('admin_notifications')
                .update({ is_read: true })
                .eq('is_read', false);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    // Clear all notifications
    const clearAllMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('admin_notifications')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsReadMutation.mutate(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    // Count unread
    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-96 max-h-[500px] overflow-hidden bg-[#111111] border-[#2A2A2A] text-white"
            >
                <DropdownMenuLabel className="flex items-center justify-between py-3 px-4 border-b border-[#2A2A2A]">
                    <span className="text-lg font-semibold">Notifications</span>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsReadMutation.mutate()}
                                className="text-xs text-blue-400 hover:text-blue-300 h-6 px-2"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </DropdownMenuLabel>

                <div className="max-h-[380px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    ) : notifications && notifications.length > 0 ? (
                        notifications.map((notification) => {
                            const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system;
                            const Icon = config.icon;

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex items-start gap-3 p-4 cursor-pointer focus:bg-[#1A1A1A] border-b border-[#2A2A2A] last:border-0 ${!notification.is_read ? 'bg-blue-500/5' : ''
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {notification.priority === 'urgent' && (
                                        <Badge className="bg-red-500/10 text-red-400 text-xs flex-shrink-0">Urgent</Badge>
                                    )}
                                </DropdownMenuItem>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    )}
                </div>

                {notifications && notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                        <div className="p-2 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    navigate('/admin/notifications');
                                    setIsOpen(false);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                                View All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearAllMutation.mutate()}
                                className="text-red-400 hover:text-red-300 text-xs"
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Clear All
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
