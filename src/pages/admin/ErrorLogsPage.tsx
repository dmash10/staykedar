import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  Search, 
  Loader2,
  Bug,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace: string;
  url: string;
  user_id: string;
  user_agent: string;
  ip_address: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  is_resolved: boolean;
  resolved_by: string;
  resolved_at: string;
  created_at: string;
}

export default function ErrorLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch error logs
  const { data: errors, isLoading, refetch } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ErrorLog[];
    }
  });

  // Mark as resolved mutation
  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('error_logs')
        .update({ 
          is_resolved: true, 
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] });
      toast({ title: "Resolved!", description: "Error marked as resolved." });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('error_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] });
      toast({ title: "Deleted!", description: "Error log deleted." });
    }
  });

  // Clear all resolved
  const clearResolvedMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('error_logs')
        .delete()
        .eq('is_resolved', true);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] });
      toast({ title: "Cleared!", description: "All resolved errors cleared." });
    }
  });

  const handleViewDetail = (error: ErrorLog) => {
    setSelectedError(error);
    setIsDetailOpen(true);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      error: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return styles[severity as keyof typeof styles] || styles.info;
  };

  // Filter errors
  const filteredErrors = errors?.filter(err => {
    const matchesSearch = err.error_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          err.error_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || err.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'resolved' && err.is_resolved) ||
                          (statusFilter === 'unresolved' && !err.is_resolved);
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Stats
  const criticalCount = errors?.filter(e => e.severity === 'critical' && !e.is_resolved).length || 0;
  const unresolvedCount = errors?.filter(e => !e.is_resolved).length || 0;

  if (isLoading) {
    return (
      <AdminLayout title="Error Logs">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Error Logs">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Bug className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Errors</p>
                <p className="text-xl font-bold text-white">{errors?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Critical</p>
                <p className="text-xl font-bold text-white">{criticalCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Unresolved</p>
                <p className="text-xl font-bold text-white">{unresolvedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Resolved</p>
                <p className="text-xl font-bold text-white">{(errors?.length || 0) - unresolvedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-400" />
                Error Logs
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search errors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-48 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                {(errors?.length || 0) - unresolvedCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => clearResolvedMutation.mutate()}
                    className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    Clear Resolved
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-gray-400">Severity</TableHead>
                    <TableHead className="text-gray-400">Error</TableHead>
                    <TableHead className="text-gray-400 hidden md:table-cell">URL</TableHead>
                    <TableHead className="text-gray-400 hidden lg:table-cell">Time</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No errors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredErrors?.map((error) => (
                      <TableRow key={error.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                        <TableCell>
                          <Badge className={getSeverityBadge(error.severity)}>
                            {getSeverityIcon(error.severity)}
                            <span className="ml-1 capitalize">{error.severity}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white font-medium text-sm">{error.error_type}</p>
                            <p className="text-gray-500 text-xs line-clamp-1 max-w-xs">{error.error_message}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-gray-400 text-sm max-w-[200px] truncate">
                          {error.url || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-400 text-sm">
                          {formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {error.is_resolved ? (
                            <Badge className="bg-green-500/20 text-green-400">Resolved</Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-400">Open</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(error)}
                              className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!error.is_resolved && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resolveMutation.mutate(error.id)}
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(error.id)}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {getSeverityIcon(selectedError?.severity || 'error')}
              Error Details
            </DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Type</p>
                  <p className="text-white font-medium">{selectedError.error_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Severity</p>
                  <Badge className={getSeverityBadge(selectedError.severity)}>
                    {selectedError.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Time</p>
                  <p className="text-gray-300">{format(new Date(selectedError.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="text-gray-300">{selectedError.is_resolved ? 'Resolved' : 'Open'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Message</p>
                <p className="text-white bg-[#0A0A0A] p-3 rounded-lg">{selectedError.error_message}</p>
              </div>

              {selectedError.url && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">URL</p>
                  <p className="text-blue-400 bg-[#0A0A0A] p-3 rounded-lg break-all">{selectedError.url}</p>
                </div>
              )}

              {selectedError.stack_trace && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Stack Trace</p>
                  <pre className="text-xs text-gray-300 bg-[#0A0A0A] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {selectedError.stack_trace}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2A2A2A]">
                {selectedError.ip_address && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">IP Address</p>
                    <p className="text-gray-300">{selectedError.ip_address}</p>
                  </div>
                )}
                {selectedError.user_agent && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">User Agent</p>
                    <p className="text-gray-300 text-sm truncate">{selectedError.user_agent}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

