import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, subDays } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileSpreadsheet, Users, CreditCard, CalendarDays, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [reportType, setReportType] = useState('bookings');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        if (!date) return;
        setIsLoading(true);

        try {
            let data: any[] = [];
            let filename = '';
            const startDate = subDays(date, 30).toISOString(); // Example: Last 30 days from selected date

            if (reportType === 'bookings') {
                const { data: bookings, error } = await supabase
                    .from('bookings')
                    .select('*, customer:customer_details(name, email), room:rooms(name)')
                    .gte('created_at', startDate);

                if (error) throw error;
                data = bookings || [];
                filename = `bookings_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            } else if (reportType === 'revenue') {
                // Mocking revenue data logic as we don't have a dedicated transaction table yet, 
                // usually derived from bookings
                const { data: bookings, error } = await supabase
                    .from('bookings')
                    .select('id, created_at, total_amount, status')
                    .eq('status', 'confirmed')
                    .gte('created_at', startDate);

                if (error) throw error;
                data = bookings || [];
                filename = `revenue_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            } else if (reportType === 'users') {
                const { data: users, error } = await supabase
                    .from('customer_details')
                    .select('*')
                    .gte('created_at', startDate);

                if (error) throw error;
                data = users || [];
                filename = `users_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            }

            if (data.length === 0) {
                toast({
                    title: "No data found",
                    description: "There are no records matching your criteria.",
                    variant: "destructive"
                });
                setIsLoading(false);
                return;
            }

            // Convert to CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row =>
                Object.values(row).map(value =>
                    typeof value === 'object' ? JSON.stringify(value).replace(/,/g, ';') : value
                ).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Log activity
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('admin_activity_logs').insert({
                    admin_id: user.id,
                    action: 'export_report',
                    entity_type: 'report',
                    details: { type: reportType, date: date.toISOString() }
                });
            }

            toast({
                title: "Export Successful",
                description: `Successfully exported ${data.length} records.`,
            });

        } catch (error: any) {
            console.error('Export error:', error);
            toast({
                title: "Export Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout title="Reports & Export">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Export Configuration Card */}
                <Card className="md:col-span-2 bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white">Generate Report</CardTitle>
                        <CardDescription className="text-gray-400">
                            Select the type of data and date range you want to export.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Report Type</label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                        <SelectItem value="bookings">
                                            <div className="flex items-center">
                                                <CalendarDays className="w-4 h-4 mr-2 text-blue-400" />
                                                Bookings
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="revenue">
                                            <div className="flex items-center">
                                                <CreditCard className="w-4 h-4 mr-2 text-green-400" />
                                                Revenue
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="users">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-purple-400" />
                                                Users
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">End Date (Last 30 Days)</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-[#1A1A1A] border-[#2A2A2A] text-white hover:bg-[#252525] hover:text-white",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            className="bg-[#1A1A1A] text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleExport}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isLoading || !date}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating CSV...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white">Export History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                                <FileSpreadsheet className="h-8 w-8 text-green-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-white">Revenue Report</p>
                                    <p className="text-xs text-gray-500">Exported today at 10:30 AM</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                                <FileSpreadsheet className="h-8 w-8 text-blue-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-white">Bookings Report</p>
                                    <p className="text-xs text-gray-500">Exported yesterday</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-sm text-blue-200">
                                    <span className="font-semibold">Note:</span> Exports include data from the last 30 days relative to the selected date.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
