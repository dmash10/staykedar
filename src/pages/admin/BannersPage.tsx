import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarqueeBannerManager from './MarqueeBannerManager';
import PromoBannerManager from './PromoBannerManager';
import BannerAnalytics from '@/components/admin/BannerAnalytics';
import { Sparkles, Layout, BarChart3 } from 'lucide-react';

export default function BannersPage() {
    const [activeTab, setActiveTab] = useState('marquee');

    return (
        <AdminLayout title="Banners & Marketing">
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">Banner Management</h1>
                    <p className="text-gray-400">Manage your site's banners, announcements, and promotional content.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-[#111111] border border-[#2A2A2A] p-1">
                        <TabsTrigger value="marquee" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Marquee Banners
                        </TabsTrigger>
                        <TabsTrigger value="promo" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            <Layout className="w-4 h-4 mr-2" />
                            Promo Sections
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="marquee" className="space-y-4">
                        <MarqueeBannerManager />
                    </TabsContent>

                    <TabsContent value="promo" className="space-y-4">
                        <PromoBannerManager />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <BannerAnalytics />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
