import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Package, Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PackageType {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  image_url?: string;
}

export default function PackagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [formData, setFormData] = useState<Partial<PackageType>>({
    name: '',
    price: 0,
    description: '',
    features: ['']
  });

  // Fetch packages
  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      return data as PackageType[];
    }
  });

  // Create/Update mutation
  const upsertMutation = useMutation({
    mutationFn: async (data: Partial<PackageType>) => {
      const { error } = await supabase
        .from('packages')
        .upsert({
          id: editingPackage?.id, // If id exists, it's an update
          name: data.name!,
          price: Number(data.price),
          description: data.description,
          features: data.features,
          image_url: data.image_url
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: `Package ${editingPackage ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({
        title: "Deleted",
        description: "Package deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      price: 0,
      description: '',
      features: ['']
    });
  };

  const handleEdit = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      description: pkg.description || '',
      features: pkg.features || ['']
    });
    setIsDialogOpen(true);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter empty features
    const cleanFeatures = formData.features?.filter(f => f.trim() !== '') || [];
    upsertMutation.mutate({ ...formData, features: cleanFeatures });
  };

  return (
    <AdminLayout title="Package Management">
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#2A2A2A]">
          <CardTitle className="text-white text-lg font-medium flex items-center">
            <Package className="h-5 w-5 mr-2 text-green-500" />
            Available Packages
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPackage ? 'Edit Package' : 'Create New Package'}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details for the tour package.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Package Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#111111] border-[#2A2A2A]"
                      placeholder="e.g. Premium Stay"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="bg-[#111111] border-[#2A2A2A]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[#111111] border-[#2A2A2A]"
                    placeholder="Brief description of the package..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {formData.features?.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="bg-[#111111] border-[#2A2A2A] h-8"
                          placeholder="Feature detail..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    className="w-full border-dashed border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                  >
                    <Plus className="h-3 w-3 mr-2" /> Add Feature
                  </Button>
                </div>

                <DialogFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={upsertMutation.isPending}>
                    {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingPackage ? 'Update Package' : 'Create Package'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#1A1A1A]">
              <TableRow className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Price</TableHead>
                <TableHead className="text-slate-400">Description</TableHead>
                <TableHead className="text-slate-400">Features</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                    Loading packages...
                  </TableCell>
                </TableRow>
              ) : packages?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                    No packages found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                packages?.map((pkg) => (
                  <TableRow key={pkg.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]/50">
                    <TableCell className="font-medium text-white">{pkg.name}</TableCell>
                    <TableCell className="text-green-400 font-bold">₹{pkg.price.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-400 max-w-xs truncate">{pkg.description}</TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex flex-wrap gap-1">
                        {pkg.features?.slice(0, 2).map((f, i) => (
                          <Badge key={i} variant="secondary" className="bg-[#1A1A1A] text-slate-300 text-xs">
                            {f}
                          </Badge>
                        ))}
                        {pkg.features && pkg.features.length > 2 && (
                          <Badge variant="secondary" className="bg-[#1A1A1A] text-slate-300 text-xs">
                            +{pkg.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(pkg)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                This action cannot be undone. This will permanently delete the "{pkg.name}" package.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-[#2A2A2A] text-white hover:bg-[#2A2A2A]">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(pkg.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}