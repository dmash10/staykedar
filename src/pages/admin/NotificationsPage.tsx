import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Settings, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

// Mock notifications
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'New Booking Confirmed',
        message: 'Booking #BK-7829 has been confirmed for Mountain View Resort.',
        type: 'success',
        read: false,
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'New Support Ticket',
        message: 'A new high priority ticket #TKT-1002 has been created.',
        type: 'warning',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '3',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight at 2 AM.',
        type: 'info',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        title: 'Payment Failed',
        message: 'Payment for booking #BK-7820 failed.',
        type: 'error',
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <AdminLayout title="Notifications">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A]">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 ml-2">
                                        {notifications.filter(n => !n.read).length} New
                                    </Badge>
                                )}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark all read
                                </Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setFilter('all')}
                                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${filter === 'all' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${filter === 'unread' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                            >
                                Unread
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${filter === 'read' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                            >
                                Read
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                                <p className="text-gray-400">No notifications found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#2A2A2A]">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 flex items-start gap-4 hover:bg-[#1A1A1A] transition-colors ${!notification.read ? 'bg-[#161616]' : ''}`}
                                    >
                                        <div className={`mt-1 p-2 rounded-full bg-[#2A2A2A]`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                    title="Mark as read"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteNotification(notification.id)}
                                                className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
