import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ClipboardCheck,
    Search,
    Filter,
    Building2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Camera,
    Droplets,
    Flame,
    Shield,
    Sparkles,
    MapPin,
    Calendar,
    Upload,
    RefreshCw,
    Loader2,
    ArrowUpRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

// Verification Checklist Items
const VERIFICATION_CHECKLIST = [
    { id: 'water_supply', label: 'Water Supply', icon: Droplets, description: 'Check water pressure and hot water availability' },
    { id: 'heating', label: 'Heating System', icon: Flame, description: 'Verify room heaters and blankets for winter' },
    { id: 'hygiene', label: 'Hygiene & Cleanliness', icon: Sparkles, description: 'Check bathroom, bedding, and common areas' },
    { id: 'safety', label: 'Safety & Security', icon: Shield, description: 'Fire exits, locks, and emergency procedures' },
    { id: 'photos', label: 'Photo Accuracy', icon: Camera, description: 'Verify listed photos match reality' },
    { id: 'location', label: 'Location Accuracy', icon: MapPin, description: 'Confirm address and accessibility' },
];

// Status Configuration
const VERIFICATION_STATUS = {
    verified: { label: 'Verified', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    pending: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    due: { label: 'Due Soon', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export default function PropertyVerificationPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [checklist, setChecklist] = useState<Record<string, boolean>>({});
    const [verificationNotes, setVerificationNotes] = useState('');

    // Fetch properties with verification status
    const { data: properties, isLoading } = useQuery({
        queryKey: ['admin-property-verification'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('id, name, location, phone, created_at, updated_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Calculate verification status for each property
            return (data || []).map(property => {
                const lastVerified = property.updated_at || property.created_at;
                const daysSinceVerified = differenceInDays(new Date(), parseISO(lastVerified));
                const nextDue = addDays(parseISO(lastVerified), 90); // 90-day verification cycle

                let status = 'verified';
                if (daysSinceVerified > 90) status = 'overdue';
                else if (daysSinceVerified > 75) status = 'due';
                else if (daysSinceVerified > 60) status = 'pending';

                return {
                    ...property,
                    lastVerified,
                    daysSinceVerified,
                    nextDue,
                    status,
                    completionScore: Math.max(0, 100 - (daysSinceVerified - 60) * 3),
                };
            });
        },
        staleTime: 60000,
    });

    // Filter properties
    const filteredProperties = properties?.filter(prop => {
        const matchesSearch = searchQuery === '' ||
            prop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prop.location?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    // Stats
    const stats = {
        total: properties?.length || 0,
        verified: properties?.filter(p => p.status === 'verified').length || 0,
        pending: properties?.filter(p => p.status === 'pending').length || 0,
        overdue: properties?.filter(p => p.status === 'overdue' || p.status === 'due').length || 0,
    };

    // Handle opening verification dialog
    const handleVerify = (property: any) => {
        setSelectedProperty(property);
        setChecklist({});
        setVerificationNotes('');
        setVerifyDialogOpen(true);
    };

    // Handle checkbox change
    const handleChecklistChange = (itemId: string, checked: boolean) => {
        setChecklist(prev => ({ ...prev, [itemId]: checked }));
    };

    // Calculate completion percentage
    const completionPercentage = Math.round(
        (Object.values(checklist).filter(Boolean).length / VERIFICATION_CHECKLIST.length) * 100
    );

    // Submit verification
    const submitVerification = async () => {
        if (completionPercentage < 100) {
            toast({
                title: 'Incomplete Checklist',
                description: 'Please complete all checklist items before submitting.',
                variant: 'destructive'
            });
            return;
        }

        // In a real app, this would save to a verifications table
        toast({
            title: 'Verification Submitted',
            description: `${selectedProperty.name} has been verified successfully.`
        });
        setVerifyDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-property-verification'] });
    };

    return (
        <>
            <div className="space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Properties</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-green-400 uppercase font-semibold">Verified (&lt;60d)</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">{stats.verified}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-yellow-500/10 border-yellow-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-yellow-400 uppercase font-semibold">Pending Review</p>
                            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-red-400 uppercase font-semibold">Overdue</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">{stats.overdue}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search by property name or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="due">Due Soon</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Properties Table */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A]">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <ClipboardCheck className="w-5 h-5 text-purple-400" />
                                    Verification Queue
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    Properties requiring verification (90-day cycle)
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/admin/properties')}
                                className="border-[#2A2A2A] text-gray-400 hover:text-white"
                            >
                                Manage Properties <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No properties found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                            <TableHead className="text-gray-400">Property</TableHead>
                                            <TableHead className="text-gray-400">Last Verified</TableHead>
                                            <TableHead className="text-gray-400">Next Due</TableHead>
                                            <TableHead className="text-gray-400">Status</TableHead>
                                            <TableHead className="text-gray-400 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProperties.map((property) => {
                                            const statusConfig = VERIFICATION_STATUS[property.status as keyof typeof VERIFICATION_STATUS];
                                            return (
                                                <TableRow
                                                    key={property.id}
                                                    className="border-[#2A2A2A] hover:bg-[#1A1A1A]"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                                                                <Building2 className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium text-sm">{property.name || 'Unnamed'}</p>
                                                                <p className="text-gray-500 text-xs flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {property.location || 'Unknown'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-300 text-sm">
                                                                {property.daysSinceVerified}d ago
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-gray-400 text-sm">
                                                            {format(property.nextDue, 'MMM dd, yyyy')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleVerify(property)}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                                        >
                                                            <ClipboardCheck className="w-3 h-3 mr-1" />
                                                            Verify
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Checklist Reference */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Verification Checklist Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {VERIFICATION_CHECKLIST.map(item => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.id} className="flex items-start gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A]">
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <Icon className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{item.label}</p>
                                            <p className="text-gray-500 text-xs">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Verification Dialog */}
            <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-purple-400" />
                            Verify Property
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Complete the checklist to verify {selectedProperty?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Progress */}
                        <div className="p-4 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">Completion</span>
                                <span className="text-white font-bold">{completionPercentage}%</span>
                            </div>
                            <Progress value={completionPercentage} className="h-2" />
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3">
                            {VERIFICATION_CHECKLIST.map(item => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${checklist[item.id]
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-[#0A0A0A] border-[#2A2A2A]'
                                            }`}
                                    >
                                        <Checkbox
                                            id={item.id}
                                            checked={checklist[item.id] || false}
                                            onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <label htmlFor={item.id} className="text-white font-medium text-sm cursor-pointer flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-purple-400" />
                                                {item.label}
                                            </label>
                                            <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Verification Notes (Optional)</label>
                            <Textarea
                                placeholder="Add any observations or issues found..."
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setVerifyDialogOpen(false)}
                            className="border-[#2A2A2A] text-gray-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitVerification}
                            disabled={completionPercentage < 100}
                            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Submit Verification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
