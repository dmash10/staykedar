import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
} from "@/components/ui/table";
import {
    Building2,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Phone,
    MapPin,
    Calendar,
    Star,
    ShieldCheck,
    ShieldAlert,
    Clock,
    Loader2,
    RefreshCw,
    ArrowUpRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays } from 'date-fns';

// Trust Score Thresholds
const TRUST_THRESHOLDS = {
    excellent: { min: 90, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Excellent' },
    good: { min: 80, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Good' },
    fair: { min: 60, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Fair' },
    poor: { min: 0, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Poor' },
};

const getTrustConfig = (score: number) => {
    if (score >= TRUST_THRESHOLDS.excellent.min) return TRUST_THRESHOLDS.excellent;
    if (score >= TRUST_THRESHOLDS.good.min) return TRUST_THRESHOLDS.good;
    if (score >= TRUST_THRESHOLDS.fair.min) return TRUST_THRESHOLDS.fair;
    return TRUST_THRESHOLDS.poor;
};

export default function HostReliabilityPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [trustFilter, setTrustFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('score');

    // Fetch properties with booking stats
    const { data: hosts, isLoading } = useQuery({
        queryKey: ['admin-host-reliability'],
        queryFn: async () => {
            // Fetch properties
            const { data: properties, error: propError } = await supabase
                .from('properties')
                .select('id, name, location, phone, created_at');

            if (propError) throw propError;

            // Fetch all bookings
            const { data: bookings, error: bookError } = await supabase
                .from('bookings')
                .select('id, property_id, status, created_at');

            if (bookError) throw bookError;

            // Calculate reliability scores for each property
            return (properties || []).map(property => {
                const propertyBookings = (bookings || []).filter(b => b.property_id === property.id);
                const totalBookings = propertyBookings.length;
                const confirmedBookings = propertyBookings.filter(b =>
                    b.status === 'confirmed' || b.status === 'completed'
                ).length;
                const cancelledByHost = propertyBookings.filter(b =>
                    b.status === 'host_cancelled' || b.status === 'rejected'
                ).length;
                const issuesReported = propertyBookings.filter(b =>
                    b.status === 'issue' || b.status === 'disputed'
                ).length;

                // Calculate trust score
                let trustScore = 100;
                if (totalBookings > 0) {
                    // Deduct for host cancellations (major penalty)
                    trustScore -= (cancelledByHost / totalBookings) * 50;
                    // Deduct for issues (moderate penalty)
                    trustScore -= (issuesReported / totalBookings) * 30;
                    // Bonus for successful completions
                    const successRate = confirmedBookings / totalBookings;
                    trustScore = Math.max(0, Math.min(100, trustScore * successRate + 20));
                }

                // Calculate days since last verification (simulated)
                const lastVerified = property.created_at ? parseISO(property.created_at) : new Date();
                const daysSinceVerified = differenceInDays(new Date(), lastVerified);
                const verificationStatus = daysSinceVerified <= 30 ? 'recent' : daysSinceVerified <= 90 ? 'due' : 'overdue';

                return {
                    ...property,
                    totalBookings,
                    confirmedBookings,
                    cancelledByHost,
                    issuesReported,
                    trustScore: Math.round(trustScore),
                    successRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 100,
                    lastVerified: property.created_at,
                    daysSinceVerified,
                    verificationStatus,
                };
            });
        },
        staleTime: 60000,
    });

    // Filter and sort hosts
    const filteredHosts = hosts?.filter(host => {
        const matchesSearch = searchQuery === '' ||
            host.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            host.location?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTrust = true;
        if (trustFilter === 'excellent') matchesTrust = host.trustScore >= 90;
        else if (trustFilter === 'good') matchesTrust = host.trustScore >= 80 && host.trustScore < 90;
        else if (trustFilter === 'fair') matchesTrust = host.trustScore >= 60 && host.trustScore < 80;
        else if (trustFilter === 'poor') matchesTrust = host.trustScore < 60;
        else if (trustFilter === 'flagged') matchesTrust = host.trustScore < 80;

        return matchesSearch && matchesTrust;
    }).sort((a, b) => {
        if (sortBy === 'score') return b.trustScore - a.trustScore;
        if (sortBy === 'bookings') return b.totalBookings - a.totalBookings;
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
    }) || [];

    // Stats
    const stats = {
        total: hosts?.length || 0,
        excellent: hosts?.filter(h => h.trustScore >= 90).length || 0,
        good: hosts?.filter(h => h.trustScore >= 80 && h.trustScore < 90).length || 0,
        flagged: hosts?.filter(h => h.trustScore < 80).length || 0,
        avgScore: hosts && hosts.length > 0
            ? Math.round(hosts.reduce((sum, h) => sum + h.trustScore, 0) / hosts.length)
            : 0,
    };

    return (
        <>
            <div className="space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Properties</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-green-400 uppercase font-semibold">Excellent (90%+)</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">{stats.excellent}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-blue-400 uppercase font-semibold">Good (80-89%)</p>
                            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.good}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-red-400 uppercase font-semibold">Flagged (&lt;80%)</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">{stats.flagged}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-4">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Avg. Trust Score</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.avgScore}%</p>
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
                            <Select value={trustFilter} onValueChange={setTrustFilter}>
                                <SelectTrigger className="w-full md:w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Trust Level" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                                    <SelectItem value="good">Good (80-89%)</SelectItem>
                                    <SelectItem value="fair">Fair (60-79%)</SelectItem>
                                    <SelectItem value="poor">Poor (&lt;60%)</SelectItem>
                                    <SelectItem value="flagged">Flagged Only</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-[150px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                    <SelectItem value="score">Trust Score</SelectItem>
                                    <SelectItem value="bookings">Bookings</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Hosts Table */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A]">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    Property Trust Scores
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    Monitor host reliability and booking success rates
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
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : filteredHosts.length === 0 ? (
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
                                            <TableHead className="text-gray-400">Trust Score</TableHead>
                                            <TableHead className="text-gray-400">Success Rate</TableHead>
                                            <TableHead className="text-gray-400">Bookings</TableHead>
                                            <TableHead className="text-gray-400">Issues</TableHead>
                                            <TableHead className="text-gray-400">Verification</TableHead>
                                            <TableHead className="text-gray-400 text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHosts.map((host) => {
                                            const config = getTrustConfig(host.trustScore);
                                            return (
                                                <TableRow
                                                    key={host.id}
                                                    className="border-[#2A2A2A] hover:bg-[#1A1A1A]"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                                                                <Building2 className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium text-sm">{host.name || 'Unnamed Property'}</p>
                                                                <p className="text-gray-500 text-xs flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {host.location || 'Unknown'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 w-24">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className={`text-sm font-bold ${config.color}`}>
                                                                        {host.trustScore}%
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={host.trustScore}
                                                                    className="h-2 bg-[#2A2A2A]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-white font-medium">{host.successRate}%</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <p className="text-white">{host.confirmedBookings} / {host.totalBookings}</p>
                                                            <p className="text-gray-500 text-xs">confirmed</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {host.cancelledByHost > 0 || host.issuesReported > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                {host.cancelledByHost > 0 && (
                                                                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                                                                        {host.cancelledByHost} cancelled
                                                                    </Badge>
                                                                )}
                                                                {host.issuesReported > 0 && (
                                                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                                                                        {host.issuesReported} issues
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500 text-sm">None</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className={`w-4 h-4 ${host.verificationStatus === 'recent' ? 'text-green-400' :
                                                                    host.verificationStatus === 'due' ? 'text-yellow-400' :
                                                                        'text-red-400'
                                                                }`} />
                                                            <span className="text-gray-400 text-sm">
                                                                {host.daysSinceVerified}d ago
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {host.trustScore >= 80 ? (
                                                            <Badge className={`${config.bg} ${config.color} ${config.border}`}>
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                {config.label}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
                                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                                Flagged
                                                            </Badge>
                                                        )}
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

                {/* Trust Score Legend */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Trust Score Calculation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-5 h-5 text-green-400" />
                                    <p className="text-green-400 font-semibold">Excellent (90%+)</p>
                                </div>
                                <p className="text-gray-400 text-sm">Highly reliable, prioritized in listings</p>
                            </div>
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    <p className="text-blue-400 font-semibold">Good (80-89%)</p>
                                </div>
                                <p className="text-gray-400 text-sm">Reliable, normal visibility</p>
                            </div>
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                    <p className="text-yellow-400 font-semibold">Fair (60-79%)</p>
                                </div>
                                <p className="text-gray-400 text-sm">Needs attention, reduced priority</p>
                            </div>
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert className="w-5 h-5 text-red-400" />
                                    <p className="text-red-400 font-semibold">Poor (&lt;60%)</p>
                                </div>
                                <p className="text-gray-400 text-sm">Auto-flagged, may be delisted</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </>
    );
}
