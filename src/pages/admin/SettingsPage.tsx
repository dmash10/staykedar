import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AdminLayout title="Settings">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-200 text-lg font-medium flex items-center">
            <Settings className="h-5 w-5 mr-2 text-orange-500" />
            Site Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-slate-400">
            <p className="text-lg mb-2">Settings functionality is coming soon</p>
            <p className="text-sm">This feature is currently under development</p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 