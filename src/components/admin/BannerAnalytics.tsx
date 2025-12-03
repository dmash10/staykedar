import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BarChart3,
    TrendingUp,
    MousePointerClick,
    Eye,
    Download,
    Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface BannerAnalyticsProps {
    bannerId?: string | null;
}

interface AnalyticsData {
    banner_id: string;
    banner_title: string;
    total_impressions: number;
    total_clicks: number;
    ctr: number;
    unique_sessions: number;
}

export default function BannerAnalytics({ bannerId }: BannerAnalyticsProps) {
    const [dateRange, setDateRange] = useState('7'); // days

    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(dateRange));

    // Fetch analytics data
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['banner-analytics', bannerId, dateRange],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_banner_analytics', {
                p_banner_id: bannerId || null,
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString(),
            });

            if (error) throw error;
            return data as AnalyticsData[];
        },
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    });

    // Calculate totals across all banners
    const totals = analytics?.reduce(
        (acc, item) => ({
            impressions: acc.impressions + (item.total_impressions || 0),
            clicks: acc.clicks + (item.total_clicks || 0),
            sessions: acc.sessions + (item.unique_sessions || 0),
        }),
        { impressions: 0, clicks: 0, sessions: 0 }
    ) || { impressions: 0, clicks: 0, sessions: 0 };

    const averageCTR = totals.impressions > 0
        ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
        : '0.00';

    /**
     * Export analytics to CSV
     */
    const exportToCSV = () => {
        if (!analytics || analytics.length === 0) return;

        const headers = ['Banner Title', 'Impressions', 'Clicks', 'CTR (%)', 'Unique Sessions'];
        const rows = analytics.map(item => [
            item.banner_title,
            item.total_impressions,
            item.total_clicks,
            item.ctr,
            item.unique_sessions,
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
            '', // Empty line
            'Totals',
            totals.impressions,
            totals.clicks,
            averageCTR,
            totals.sessions,
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `banner-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">
                        {bannerId ? 'Banner Performance' : 'All Banners Analytics'}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-36 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                            <SelectItem value="1">Last 24 hours</SelectItem>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={exportToCSV}
                        disabled={!analytics || analytics.length === 0}
                        className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <span className="text-xs text-gray-400">Impressions</span>
                        </div>
                        <p className="text-xl font-bold text-white">{totals.impressions.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-green-500/10 rounded-lg">
                                <MousePointerClick className="w-3.5 h-3.5 text-green-400" />
                            </div>
                            <span className="text-xs text-gray-400">Clicks</span>
                        </div>
                        <p className="text-xl font-bold text-white">{totals.clicks.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                            <span className="text-xs text-gray-400">CTR</span>
                        </div>
                        <p className="text-xl font-bold text-white">{averageCTR}%</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <span className="text-xs text-gray-400">Sessions</span>
                        </div>
                        <p className="text-xl font-bold text-white">{totals.sessions.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            {!bannerId && analytics && analytics.length > 0 && (
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="py-3 px-4 border-b border-[#2A2A2A]">
                        <CardTitle className="text-white text-sm">Performance by Banner</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A]">
                                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Banner</th>
                                        <th className="text-right py-2 px-4 text-gray-400 font-medium">Impressions</th>
                                        <th className="text-right py-2 px-4 text-gray-400 font-medium">Clicks</th>
                                        <th className="text-right py-2 px-4 text-gray-400 font-medium">CTR</th>
                                        <th className="text-right py-2 px-4 text-gray-400 font-medium">Sessions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((item, index) => (
                                        <tr
                                            key={item.banner_id}
                                            className={`border-b border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors ${index % 2 === 0 ? 'bg-[#0A0A0A]' : ''}`}
                                        >
                                            <td className="py-2 px-4 text-white font-medium max-w-[200px] truncate" title={item.banner_title}>{item.banner_title}</td>
                                            <td className="py-2 px-4 text-right text-gray-300">
                                                {item.total_impressions.toLocaleString()}
                                            </td>
                                            <td className="py-2 px-4 text-right text-gray-300">
                                                {item.total_clicks.toLocaleString()}
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                <span className={`font-medium ${item.ctr >= 2 ? 'text-green-400' :
                                                    item.ctr >= 1 ? 'text-yellow-400' :
                                                        'text-gray-400'
                                                    }`}>
                                                    {item.ctr}%
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 text-right text-gray-300">
                                                {item.unique_sessions.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {analytics && analytics.length === 0 && (
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-12 text-center">
                        <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                            No analytics data available for the selected period.
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Data will appear once banners receive impressions and clicks.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
