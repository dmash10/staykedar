import { useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { InventoryKPIs } from '@/components/admin/inventory/InventoryKPIs';
import { SurgeControl } from '@/components/admin/inventory/SurgeControl';
import { QuickAddProperty } from '@/components/admin/inventory/QuickAddProperty';
import { InventoryAnalytics } from '@/components/admin/inventory/InventoryAnalytics';
import {
    Zap, Search, LayoutGrid, List, Filter, MapPin,
    MoreVertical, Edit2, Save, X, Trash2, History, Database,
    CheckCircle, AlertCircle, TrendingUp, Building2, Download
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
    DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/admin/dashboard/GlassCard';
// import { Database as DBTypes } from "@/integrations/supabase/types";
import { DataGrid, NeonStatusBadge } from '@/components/admin/ui/DataGrid';

// Type definition
// type Property = DBTypes['public']['Tables']['blind_properties']['Row'];
type Property = any;

// --- MOCK DATA SEEDER ---
const MOCK_PROPERTIES = [
    {
        internal_name: "Hotel Shiva Palace",
        display_name: "Premium Hill View Stay",
        location_slug: "sonprayag",
        category: "premium",
        base_price: 3500,
        surge_price: 5000,
        is_active: true,
        rating: 4.5,
        total_rooms: 12
    },
    {
        internal_name: "Guptkashi Inn",
        display_name: "Budget Pilgrim Halt",
        location_slug: "guptkashi",
        category: "budget",
        base_price: 1200,
        surge_price: 1500,
        is_active: true,
        rating: 3.8,
        total_rooms: 20
    },
    {
        internal_name: "Kedar Valley Resort",
        display_name: "Luxury Valley Resort",
        location_slug: "phata",
        category: "luxury",
        base_price: 8000,
        surge_price: 12000,
        is_active: false,
        rating: 4.9,
        total_rooms: 8
    },
    {
        internal_name: "Sitapur Grand",
        display_name: "Standard Yatra Stay",
        location_slug: "sitapur",
        category: "standard",
        base_price: 2500,
        surge_price: 2500,
        is_active: true,
        rating: 4.2,
        total_rooms: 15
    }
];

export function InventoryManagerContent() {
    // -- STATE --
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [density, setDensity] = useState<'compact' | 'normal'>('normal');
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLocation, setFilterLocation] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    // Inline Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Property>>({});
    const [isSeeding, setIsSeeding] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // -- QUERIES --
    const { data: properties = [], isLoading } = useQuery({
        queryKey: ['blind_properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blind_properties' as any)
                .select('*')
                .order('internal_name', { ascending: true });
            if (error) throw error;
            return data as Property[];
        },
        staleTime: 1000 * 60 * 5 // 5 mins
    });

    const isUsingMock = properties.length === 0;
    const displayProperties = isUsingMock ? MOCK_PROPERTIES.map((p, i) => ({ ...p, id: `mock-${i}` })) as Property[] : properties;

    // -- MUTATIONS --
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            if (id.startsWith('mock')) {
                toast({ title: "Simulation", description: `Property ${is_active ? 'Activated' : 'Deactivated'}` });
                return;
            }
            const { error } = await (supabase.from('blind_properties') as any).update({ is_active }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            if (!isUsingMock) queryClient.invalidateQueries({ queryKey: ['blind_properties'] });
            toast({ title: "Status Updated" });
        }
    });

    const updatePropertyMutation = useMutation({
        mutationFn: async (id: string) => {
            if (id.startsWith('mock')) {
                toast({ title: "Simulation", description: "Values updated locally." });
                setEditingId(null);
                return;
            }
            if (!editValues) return;
            const { error } = await (supabase.from('blind_properties') as any).update(editValues).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            if (!isUsingMock) queryClient.invalidateQueries({ queryKey: ['blind_properties'] });
            setEditingId(null);
            setEditValues({});
            toast({ title: "Property Updated" });
        }
    });

    // -- ACTIONS --
    const handleEditStart = (item: Property) => {
        setEditingId(item.id);
        setEditValues({
            base_price: item.base_price,
            surge_price: item.surge_price,
            category: item.category
        });
    };

    const handleSave = (id: string) => updatePropertyMutation.mutate(id);

    const handleSeedData = async () => {
        setIsSeeding(true);
        try {
            const { error } = await supabase.from('blind_properties' as any).insert(MOCK_PROPERTIES as any);
            if (error) throw error;
            toast({ title: "Mock Data Seeded", description: "Refresh to see DB data." });
            queryClient.invalidateQueries({ queryKey: ['blind_properties'] });
        } catch (e: any) {
            toast({ title: "Seeding Failed", description: e.message, variant: "destructive" });
        } finally {
            setIsSeeding(false);
        }
    };

    // -- FILTERING --
    const filteredProperties = useMemo(() => {
        return displayProperties.filter(p => {
            const matchesSearch = (p.internal_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = filterLocation === 'all' || p.location_slug === filterLocation;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' ? p.is_active : !p.is_active);

            return matchesSearch && matchesLocation && matchesStatus;
        });
    }, [displayProperties, searchTerm, filterLocation, filterStatus]);

    // -- KANBAN COLUMNS --
    const kanbanColumns = useMemo(() => {
        return {
            'Premium': filteredProperties.filter(p => p.category === 'premium'),
            'Standard': filteredProperties.filter(p => p.category === 'standard'),
            'Budget': filteredProperties.filter(p => p.category === 'budget'),
            'Inactive': filteredProperties.filter(p => !p.is_active),
        };
    }, [filteredProperties]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* 1. HEADER & KPI */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <InventoryKPIs />
                <QuickAddProperty />
            </div>

            {/* 2. TOOLBAR */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-[#111] p-2 rounded-lg border border-[#222]">
                <div className="flex items-center gap-2 w-full xl:w-auto">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                        <TabsList className="bg-[#1A1A1A] border border-[#333]">
                            <TabsTrigger value="list"><List className="w-4 h-4 mr-2" /> List</TabsTrigger>
                            <TabsTrigger value="kanban"><LayoutGrid className="w-4 h-4 mr-2" /> Board</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="h-8 w-px bg-[#333] mx-2 hidden xl:block"></div>
                    <div className="relative flex-1 xl:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search hotels, owners..."
                            className="pl-9 bg-[#000] border-[#333] text-sm h-9"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto px-1">
                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                        <SelectTrigger className="w-[140px] h-9 bg-[#1A1A1A] border-[#333] text-xs"><SelectValue placeholder="Location" /></SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#333] text-gray-400">
                            <SelectItem value="all">All Locations</SelectItem>
                            <SelectItem value="sonprayag">Sonprayag</SelectItem>
                            <SelectItem value="guptkashi">Guptkashi</SelectItem>
                            <SelectItem value="phata">Phata</SelectItem>
                            <SelectItem value="sitapur">Sitapur</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[110px] h-9 bg-[#1A1A1A] border-[#333] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#333] text-gray-400">
                            <SelectItem value="all">Status: All</SelectItem>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 w-9 px-0 bg-[#1A1A1A] border-[#333]"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#333] text-gray-300">
                            <DropdownMenuLabel>View Settings</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#333]" />
                            <DropdownMenuItem onClick={() => setDensity('compact')} className="hover:bg-[#252525]">Compact View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDensity('normal')} className="hover:bg-[#252525]">Comfortable View</DropdownMenuItem>
                            {isUsingMock && (
                                <>
                                    <DropdownMenuSeparator className="bg-[#333]" />
                                    <DropdownMenuItem onClick={handleSeedData} className="text-yellow-500 hover:bg-[#252525]" disabled={isSeeding}>
                                        <Database className="w-4 h-4 mr-2" /> Seed Database
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" className="h-9 bg-[#1A1A1A] border-[#333] text-gray-300 hover:bg-[#222]"
                        onClick={() => {
                            const csv = [["Internal Name", "Display Name", "Location", "Category", "Base Price", "Surge Price", "Status"]].concat(filteredProperties.map(p => [
                                p.internal_name || '',
                                p.display_name || '',
                                p.location_slug || '',
                                p.category || '',
                                String(p.base_price),
                                String(p.surge_price),
                                p.is_active ? 'Active' : 'Inactive'
                            ]));
                            const blob = new Blob([csv.map(e => e.join(",")).join("\n")], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = 'inventory_export.csv'; a.click();
                        }}
                    >
                        <Download className="w-3.5 h-3.5 mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* 3. MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* LEFT: GRID/KANBAN */}
                <div className="lg:col-span-3">
                    {viewMode === 'list' ? (
                        <DataGrid<Property>
                            title="Property Portfolio"
                            data={filteredProperties}
                            searchable={false} // We have external search in this complex page
                            icon={<Building2 className="w-5 h-5" />}
                            columns={[
                                {
                                    key: 'internal_name',
                                    label: 'Property',
                                    sortable: true,
                                    render: (row) => (
                                        <div>
                                            {editingId === row.id ? (
                                                <Input
                                                    value={editValues.display_name || row.display_name || ''}
                                                    onChange={(e) => setEditValues(prev => ({ ...prev, display_name: e.target.value }))}
                                                    className="h-7 text-xs bg-[#222]"
                                                />
                                            ) : (
                                                <p className="font-medium text-white">{row.display_name}</p>
                                            )}
                                            <p className="text-xs text-slate-500">{row.internal_name} • <span className="uppercase">{row.location_slug}</span></p>
                                        </div>
                                    )
                                },
                                {
                                    key: 'is_active',
                                    label: 'Status',
                                    sortable: true,
                                    width: '120px',
                                    render: (row) => (
                                        <div className="flex justify-center">
                                            <Switch
                                                checked={row.is_active || false}
                                                onCheckedChange={(checked) => toggleStatusMutation.mutate({ id: row.id, is_active: checked })}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>
                                    )
                                },
                                {
                                    key: 'base_price',
                                    label: 'Pricing (Base/Surge)',
                                    render: (row) => (
                                        <div className="font-mono text-xs">
                                            {editingId === row.id ? (
                                                <div className="flex gap-1 items-center">
                                                    <Input className="w-16 h-6 p-1 bg-[#222]" type="number" value={editValues.base_price} onChange={e => setEditValues(p => ({ ...p, base_price: Number(e.target.value) }))} />
                                                    <span className="text-slate-500">/</span>
                                                    <Input className="w-16 h-6 p-1 bg-[#222]" type="number" value={editValues.surge_price} onChange={e => setEditValues(p => ({ ...p, surge_price: Number(e.target.value) }))} />
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-slate-300">₹{row.base_price}</span>
                                                    <span className="text-slate-600 mx-1">/</span>
                                                    <span className="text-amber-500">₹{row.surge_price}</span>
                                                </>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'category',
                                    label: 'Tier',
                                    sortable: true,
                                    render: (row) => <Badge variant="outline" className={`capitalize ${row.category === 'luxury' ? 'border-amber-500 text-amber-500' : 'border-slate-700 text-slate-400'}`}>{row.category}</Badge>
                                }
                            ]}
                            actions={(row) => (
                                editingId === row.id ? (
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => handleSave(row.id)}><Save className="w-3 h-3" /></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => handleEditStart(row)}><Edit2 className="w-3 h-3" /></Button>
                                    </div>
                                )
                            )}
                            onExport={() => {
                                const csv = [["Internal Name", "Display Name", "Location", "Category", "Base Price", "Surge Price", "Status"]].concat(filteredProperties.map(p => [
                                    p.internal_name || '',
                                    p.display_name || '',
                                    p.location_slug || '',
                                    p.category || '',
                                    String(p.base_price),
                                    String(p.surge_price),
                                    p.is_active ? 'Active' : 'Inactive'
                                ]));
                                const blob = new Blob([csv.map(e => e.join(",")).join("\n")], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = 'inventory_export.csv'; a.click();
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full items-start">
                            {Object.entries(kanbanColumns).map(([groupName, items]) => (
                                items.length > 0 && (
                                    <div key={groupName} className="bg-[#111] border border-[#222] rounded-lg p-3 flex flex-col gap-3">
                                        <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${groupName === 'Inactive' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                {groupName}
                                            </h4>
                                            <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-800">{items.length}</Badge>
                                        </div>
                                        {items.map(prop => (
                                            <GlassCard key={prop.id} className="p-3 bg-[#161616] border-[#252525] group hover:border-[#333] transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-200">{prop.display_name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase">{prop.internal_name}</p>
                                                    </div>
                                                    <Badge variant={prop.is_active ? "default" : "destructive"} className="text-[9px] h-5">
                                                        {prop.is_active ? 'ON' : 'OFF'}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500">Rate</p>
                                                        <p className="font-mono text-sm text-green-400 font-bold">₹{prop.surge_price}</p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleEditStart(prop)}>
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: SIDEBAR */}
                <div className="lg:col-span-1 space-y-6">
                    <SurgeControl />
                </div>

            </div>

            {/* 4. FULL WIDTH ANALYTICS */}
            <InventoryAnalytics />
        </div >

    );
}

export default function InventoryManager() {
    return (
        <>
            <InventoryManagerContent />
        </>
    );
}
