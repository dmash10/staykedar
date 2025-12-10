import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Search, Activity, User, Settings, FileText, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function ActivityLogsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['admin-activity-logs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('admin_activity_logs')
                .select(`
          *,
          admin:admin_users (
            email
          )
        `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data;
        }
    });

    const filteredLogs = logs?.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = actionFilter === 'all' || log.action === actionFilter;
        return matchesSearch && matchesFilter;
    });

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'settings':
                return <Settings className="h-4 w-4 text-orange-400" />;
            case 'user':
                return <User className="h-4 w-4 text-purple-400" />;
            case 'report':
                return <FileText className="h-4 w-4 text-blue-400" />;
            default:
                return <Activity className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <>
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader className="pb-4 border-b border-[#2A2A2A]">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg font-medium">System Activity</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-8 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-slate-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-[180px] bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectValue placeholder="Filter by Action" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="update_settings">Settings Update</SelectItem>
                                    <SelectItem value="export_report">Report Export</SelectItem>
                                    <SelectItem value="delete_user">User Deletion</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#1A1A1A]">
                            <TableRow className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                <TableHead className="text-slate-400">Time</TableHead>
                                <TableHead className="text-slate-400">Admin</TableHead>
                                <TableHead className="text-slate-400">Action</TableHead>
                                <TableHead className="text-slate-400">Entity</TableHead>
                                <TableHead className="text-slate-400">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                        Loading logs...
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                        No activity logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs?.map((log) => (
                                    <TableRow key={log.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]/50">
                                        <TableCell className="text-slate-400 font-mono text-xs">
                                            {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-3 w-3 text-blue-500" />
                                                <span className="text-sm">{log.admin?.email || 'Unknown'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-[#1A1A1A] text-slate-300 border-[#2A2A2A]">
                                                {log.action.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-300 capitalize">
                                                {getActionIcon(log.entity_type)}
                                                {log.entity_type}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-xs font-mono max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
