import { useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import { CRMBoard } from '@/components/admin/crm/CRMBoard';
import { LeadDetailsDrawer } from '@/components/admin/crm/ChatDrawer';
import { AddLeadDialog } from '@/components/admin/crm/AddLeadDialog';
import { Lead } from '@/components/admin/crm/LeadCard';
import {
    Search, Filter, MessageSquarePlus, Flame, Users, BadgeIndianRupee,
    List, LayoutGrid, Calendar, Phone, ArrowRight, MoreVertical,
    CheckCircle2, XCircle, Clock, AlertTriangle, ArchiveRestore, ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { GlassCard } from '@/components/admin/dashboard/GlassCard';
import { DataGrid, NeonStatusBadge } from '@/components/admin/ui/DataGrid';

// --- MOCK DATA ---
const MOCK_LEADS: Lead[] = [
    {
        id: 'mock-1',
        customer_name: 'Amit Sharma',
        customer_phone: '+91 9876543210',
        status: 'new',
        budget_category: 'premium',
        guests: 4,
        is_urgent: true,
        created_at: new Date().toISOString(),
        notes: 'Needs heavy transport arrangement',
        source: 'manual'
    },
    {
        id: 'mock-2',
        customer_name: 'Priya Singh',
        customer_phone: '+91 9988776655',
        status: 'contacted',
        budget_category: 'standard',
        guests: 2,
        is_urgent: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Honeymoon couple, quiet room',
        source: 'website'
    },
    {
        id: 'mock-3',
        customer_name: 'Rahul Verma',
        customer_phone: '+91 8877665544',
        status: 'ai_calling',
        budget_category: 'budget',
        guests: 1,
        is_urgent: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        notes: 'Solo bike rider',
        source: 'referral'
    }
];



export function LeadsPageContent() {
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const { toast } = useToast();

    // Filters State
    const [search, setSearch] = useState("");
    const [urgentOnly, setUrgentOnly] = useState(false);
    const [highValue, setHighValue] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    // Query Client for Cache Updates
    const queryClient = useQueryClient();

    // Fetch Leads
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['stay_leads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('stay_leads')
                .select('*')
                .order('created_at', { ascending: false });

            // Fallback to mock if DB empty or error (for demo resilience)
            if (error || !data || data.length === 0) return MOCK_LEADS;
            return data as Lead[];
        }
    });

    // Archive Lead Handler
    const handleArchiveLead = async (leadId: string) => {
        try {
            const { error } = await (supabase
                .from('stay_leads') as any)
                .update({ status: 'archived' })
                .eq('id', leadId);

            if (error) throw error;

            toast({ title: "Lead Archived", description: "Lead moved to archive." });
            queryClient.invalidateQueries({ queryKey: ['stay_leads'] });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Filter Logic
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const isArchived = lead.status === 'archived';
            if (!showArchived && isArchived) return false;
            if (showArchived && !isArchived) return false; // Show ONLY archived when toggle is on? Or show BOTH? User said "Show Archived", usually implies "Include Archived". Let's stick to "Include" or "View Archive Mode". Let's do "View Archive Mode" to keep board clean.
            // Actually, "View Archive" usually toggles a different view. Let's make it simple: If showArchived is true, show ONLY archived. If false, show ONLY active.
            if (showArchived !== isArchived) return false;

            const matchesSearch = !search || lead.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
                lead.customer_phone?.includes(search);
            const matchesUrgent = !urgentOnly || lead.is_urgent;
            const matchesHighValue = !highValue || (lead.guests >= 5 || lead.budget_category === 'premium');
            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

            return matchesSearch && matchesUrgent && matchesHighValue && matchesStatus;
        });
    }, [leads, search, urgentOnly, highValue, statusFilter, showArchived]);

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
        setIsChatOpen(true);
    };

    const handleExport = () => {
        const headers = ['Name', 'Phone', 'Status', 'Guests', 'Budget', 'Created'];
        const rows = filteredLeads.map(l => [
            `"${l.customer_name}"`,
            `"${l.customer_phone}"`,
            l.status,
            l.guests,
            l.budget_category,
            new Date(l.created_at || Date.now()).toLocaleDateString()
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111] p-3 rounded-xl border border-[#222]">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')} className="w-auto">
                        <TabsList className="bg-[#1A1A1A] border border-[#333]">
                            <TabsTrigger value="list"><List className="w-4 h-4 mr-2" /> List</TabsTrigger>
                            <TabsTrigger value="kanban"><LayoutGrid className="w-4 h-4 mr-2" /> Kanban</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="h-8 w-px bg-[#333] hidden md:block" />

                    <div className="relative w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="pl-9 bg-[#000] border-[#333] text-sm h-9"
                        />
                    </div>

                    <Button
                        variant={urgentOnly ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setUrgentOnly(!urgentOnly)}
                        className={`h-9 border-[#333] transition-all duration-200 active:scale-95 ${urgentOnly ? '' : 'bg-[#1A1A1A] text-gray-400 hover:text-white hover:border-white/20'}`}
                    >
                        <Flame className={`w-4 h-4 mr-2 ${urgentOnly ? 'fill-current' : ''}`} /> Urgent
                    </Button>

                    <Button
                        variant={showArchived ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setShowArchived(!showArchived)}
                        className={`h-9 border border-transparent ${showArchived ? 'bg-amber-900/20 text-amber-400 border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> {showArchived ? 'Active Leads' : 'Archived'}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        className="h-9 border border-slate-800 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-2"
                    >
                        <ArrowUp className="w-4 h-4 rotate-45" /> Export
                    </Button>
                </div>

                <Button
                    onClick={() => setIsAddLeadOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <MessageSquarePlus className="w-4 h-4 mr-2" /> Add New Lead
                </Button>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden min-h-0">
                {viewMode === 'list' ? (
                    <div className="h-full overflow-hidden flex flex-col p-4 bg-[#0f0f0f] border-t border-[#252525]">
                        <DataGrid<Lead>
                            data={filteredLeads}
                            pageSize={10}
                            selectable={true}
                            onRowClick={handleLeadClick}
                            onExport={() => {
                                // Custom CSV Export logic if needed, otherwise DataGrid handles it
                                const headers = ['Name', 'Phone', 'Status', 'Guests', 'Budget', 'Created'];
                                const rows = filteredLeads.map(l => [
                                    `"${l.customer_name}"`,
                                    `"${l.customer_phone}"`,
                                    l.status,
                                    l.guests,
                                    l.budget_category,
                                    new Date(l.created_at).toLocaleDateString()
                                ].join(','));
                                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            columns={[
                                {
                                    key: 'customer_name',
                                    label: 'Customer',
                                    sortable: true,
                                    width: '250px',
                                    render: (lead) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-gray-300 border border-white/10">
                                                {lead.customer_name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200 text-sm flex items-center gap-2">
                                                    {lead.customer_name}
                                                    {lead.is_urgent && <Flame className="w-3 h-3 text-red-500 fill-red-500" />}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.customer_phone}</span>
                                                    <span className="text-slate-600">|</span>
                                                    <span className="capitalize text-slate-400">{lead.source?.replace('_', ' ') || 'Manual'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    sortable: true,
                                    width: '120px',
                                    render: (lead) => (
                                        <NeonStatusBadge
                                            status={lead.status?.replace('_', ' ') || 'New'}
                                            type={
                                                lead.status === 'confirmed' ? 'success' :
                                                    lead.status === 'contacted' ? 'warning' :
                                                        lead.status === 'new' ? 'info' : 'neutral'
                                            }
                                        />
                                    )
                                },
                                {
                                    key: 'details',
                                    label: 'Details',
                                    render: (lead) => (
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-slate-900/50 text-slate-400 border-slate-800 text-[10px] flex gap-1 items-center font-mono">
                                                <Users className="w-3 h-3" /> {lead.guests}
                                            </Badge>
                                            <Badge variant="outline" className="bg-slate-900/50 text-slate-400 border-slate-800 text-[10px] capitalize font-mono">
                                                {lead.budget_category}
                                            </Badge>
                                        </div>
                                    )
                                },
                                {
                                    key: 'created_at',
                                    label: 'Created',
                                    sortable: true,
                                    width: '150px',
                                    render: (lead) => (
                                        <div className="flex flex-col text-xs text-slate-400 font-mono">
                                            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                                            <span className="text-slate-600">{format(new Date(lead.created_at), 'h:mm a')}</span>
                                        </div>
                                    )
                                }
                            ]}
                            actions={(lead) => (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={(e) => { e.stopPropagation(); handleLeadClick(lead); }}>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}
                        />
                    </div>
                ) : (
                    <CRMBoard
                        onLeadClick={handleLeadClick}
                        leads={filteredLeads}
                        onArchive={handleArchiveLead}
                    />
                )}
            </div>

            {/* Lead Details Drawer (Replaces Chat) */}
            <LeadDetailsDrawer
                lead={selectedLead}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            {/* Manual Add Lead Dialog */}
            <AddLeadDialog
                open={isAddLeadOpen}
                onOpenChange={setIsAddLeadOpen}
            />
        </div>
    );
}

export default function LeadsPage() {
    return (
        <>
            <LeadsPageContent />
        </>
    );
}
