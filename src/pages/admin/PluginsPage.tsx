import AdminLayout from '@/components/admin/AdminLayout';
import PluginManager from '@/components/admin/PluginManager';

export default function PluginsPage() {
  return (
    <AdminLayout title="Plugins">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Plugins</h1>
          <p className="text-slate-400">Manage and configure your website plugins</p>
        </div>
        
        <PluginManager />
      </div>
    </AdminLayout>
  );
} 