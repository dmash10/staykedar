import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CarDriver, CarDriverFormData } from '@/types/carRentals';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, Truck, Map, BarChart3, CloudLightning
} from 'lucide-react';

// Sub-components
import { FleetGrid } from '@/components/admin/transport/FleetGrid';
import { RouteMatrix } from '@/components/admin/transport/RouteMatrix';
import { DispatchKanban } from '@/components/admin/transport/DispatchKanban';
import { TaxiAnalytics } from '@/components/admin/transport/TaxiAnalytics';
import { HeliOperations } from '@/components/admin/transport/HeliOperations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Heli Mock Data (Preserved)
const HELI_AGENTS = [
  { id: 1, name: 'Pawan Hans', contact: '+91 9876543210', location: 'Phata', status: 'Active' },
  { id: 2, name: 'Himalayan Heli', contact: '+91 9876543211', location: 'Sersi', status: 'Active' },
  { id: 3, name: 'Arrow Aircraft', contact: '+91 9876543212', location: 'Guptkashi', status: 'Inactive' },
];

const CarDriversPage = () => {
  const [drivers, setDrivers] = useState<CarDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Simple state for add/edit dialogs (implement CRUD fully if needed, for now focusing on Dispatch UI)
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('car_drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: "Error",
        description: "Failed to load driver fleet.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (driver: CarDriver) => {
    // Implement delete logic here
    toast({ title: "Deleted", description: `Driver ${driver.driver_name} removed.` });
    setDrivers(drivers.filter(d => d.id !== driver.id));
  };

  const handleEditDriver = (driver: CarDriver) => {
    setDialogOpen(true);
    // Set edit state...
  };

  return (
    <>
      <Helmet>
        <title>Dispatch Center | Admin</title>
      </Helmet>

      <Tabs defaultValue="dispatch" className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <TabsList className="bg-[#111111] border border-[#2A2A2A] h-auto p-1 grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="dispatch" className="data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white py-2">
              <Activity className="w-4 h-4 mr-2" /> Dispatch
            </TabsTrigger>
            <TabsTrigger value="fleet" className="data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white py-2">
              <Truck className="w-4 h-4 mr-2" /> Fleet Grid
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white py-2">
              <Map className="w-4 h-4 mr-2" /> Rate & Surge
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white py-2">
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="heli" className="data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white py-2">
              <CloudLightning className="w-4 h-4 mr-2" /> Heli Ops
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button className="bg-white text-black hover:bg-gray-200" onClick={() => setDialogOpen(true)}>
              + Add Driver
            </Button>
          </div>
        </div>

        {/* 1. DISPATCH BOARD */}
        <TabsContent value="dispatch" className="min-h-[600px]">
          <DispatchKanban />
        </TabsContent>

        {/* 2. FLEET GRID */}
        <TabsContent value="fleet">
          <FleetGrid
            drivers={drivers}
            loading={loading}
            onEdit={handleEditDriver}
            onDelete={handleDeleteDriver}
          />
        </TabsContent>

        {/* 3. ROUTE PRICING */}
        <TabsContent value="pricing">
          <RouteMatrix />
        </TabsContent>

        {/* 4. ANALYTICS */}
        <TabsContent value="analytics">
          <TaxiAnalytics />
        </TabsContent>

        {/* 5. HELI-OPS (Enhanced) */}
        <TabsContent value="heli">
          <HeliOperations />
        </TabsContent>
      </Tabs>

      {/* Simple Add Driver Dialog Placeholder */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Enter driver details to onboard them to the fleet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Driver Name</Label>
              <Input className="bg-[#111] border-[#333]" placeholder="e.g. Ramesh Singh" />
            </div>
            <div className="space-y-2">
              <Label>Car Model</Label>
              <Input className="bg-[#111] border-[#333]" placeholder="e.g. Innova Crysta" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#333] hover:bg-[#222]">Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Save Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CarDriversPage;
