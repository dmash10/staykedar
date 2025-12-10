import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function ErrorLogsPage() {
    return (
        <>
            <div className="space-y-6">
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            System Error Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No error logs found (or log system not connected)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
