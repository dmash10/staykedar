import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Car, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye,
  Star, Phone, MapPin, CheckCircle, XCircle, Users, Badge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CarDriver, CarDriverFormData, SERVICE_AREAS, LANGUAGES } from '@/types/carRentals';
import AdminLayout from '@/components/admin/AdminLayout';

const CarDriversPage = () => {
  const [drivers, setDrivers] = useState<CarDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<CarDriver | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CarDriver | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CarDriverFormData>({
    name: '',
    slug: '',
    phone: '',
    whatsapp: '',
    email: '',
    photo: '',
    cover_image: '',
    bio: '',
    experience_years: 0,
    languages: ['Hindi', 'English'],
    service_areas: ['Kedarnath'],
    is_verified: false,
    is_featured: false,
    is_active: true,
    price_per_km: undefined,
    base_city: 'Rishikesh',
  });

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
        title: 'Error',
        description: 'Failed to fetch drivers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      phone: '',
      whatsapp: '',
      email: '',
      photo: '',
      cover_image: '',
      bio: '',
      experience_years: 0,
      languages: ['Hindi', 'English'],
      service_areas: ['Kedarnath'],
      is_verified: false,
      is_featured: false,
      is_active: true,
      price_per_km: undefined,
      base_city: 'Rishikesh',
    });
    setEditingDriver(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.phone) {
        toast({
          title: 'Validation Error',
          description: 'Name and phone are required',
          variant: 'destructive',
        });
        return;
      }

      const driverData = {
        ...formData,
        whatsapp: formData.whatsapp || formData.phone,
      };

      if (editingDriver) {
        const { error } = await supabase
          .from('car_drivers')
          .update(driverData)
          .eq('id', editingDriver.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Driver updated successfully' });
      } else {
        const { error } = await supabase
          .from('car_drivers')
          .insert([driverData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Driver added successfully' });
      }

      setShowAddDialog(false);
      resetForm();
      fetchDrivers();
    } catch (error: any) {
      console.error('Error saving driver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save driver',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (driver: CarDriver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      slug: driver.slug,
      phone: driver.phone,
      whatsapp: driver.whatsapp || '',
      email: driver.email || '',
      photo: driver.photo || '',
      cover_image: driver.cover_image || '',
      bio: driver.bio || '',
      experience_years: driver.experience_years,
      languages: driver.languages,
      service_areas: driver.service_areas,
      is_verified: driver.is_verified,
      is_featured: driver.is_featured,
      is_active: driver.is_active,
      price_per_km: driver.price_per_km,
      base_city: driver.base_city,
    });
    setShowAddDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from('car_drivers')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Driver deleted successfully' });
      setDeleteConfirm(null);
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete driver',
        variant: 'destructive',
      });
    }
  };

  const toggleStatus = async (driver: CarDriver, field: 'is_active' | 'is_verified' | 'is_featured') => {
    try {
      const { error } = await supabase
        .from('car_drivers')
        .update({ [field]: !driver[field] })
        .eq('id', driver.id);

      if (error) throw error;
      fetchDrivers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery) ||
      driver.base_city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && driver.is_active) ||
      (filterStatus === 'inactive' && !driver.is_active) ||
      (filterStatus === 'verified' && driver.is_verified) ||
      (filterStatus === 'featured' && driver.is_featured);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout title="Car Drivers">
      <Helmet>
        <title>Car Drivers | Admin - StayKedarnath</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Car Drivers</h1>
            <p className="text-gray-500">Manage taxi drivers and their profiles</p>
          </div>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{drivers.length}</p>
                  <p className="text-sm text-gray-500">Total Drivers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{drivers.filter(d => d.is_active).length}</p>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Badge className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{drivers.filter(d => d.is_verified).length}</p>
                  <p className="text-sm text-gray-500">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{drivers.filter(d => d.is_featured).length}</p>
                  <p className="text-sm text-gray-500">Featured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Drivers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No drivers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {driver.photo ? (
                              <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Users className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {driver.base_city}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {driver.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{driver.experience_years} years</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{driver.rating}</span>
                          <span className="text-gray-400 text-sm">({driver.total_reviews})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {driver.is_verified && (
                            <UIBadge variant="secondary" className="bg-green-100 text-green-700">Verified</UIBadge>
                          )}
                          {driver.is_featured && (
                            <UIBadge variant="secondary" className="bg-yellow-100 text-yellow-700">Featured</UIBadge>
                          )}
                          {!driver.is_active && (
                            <UIBadge variant="secondary" className="bg-red-100 text-red-700">Inactive</UIBadge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/car-rentals/driver/${driver.slug}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(driver)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(driver, 'is_active')}>
                              {driver.is_active ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                              {driver.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(driver, 'is_verified')}>
                              <Badge className="w-4 h-4 mr-2" />
                              {driver.is_verified ? 'Remove Verified' : 'Mark Verified'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(driver, 'is_featured')}>
                              <Star className="w-4 h-4 mr-2" />
                              {driver.is_featured ? 'Remove Featured' : 'Mark Featured'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteConfirm(driver)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
            <DialogDescription>
              {editingDriver ? 'Update driver information' : 'Add a new taxi driver to the platform'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Driver name"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Same as phone if empty"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="driver@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Base City</Label>
                <Input
                  value={formData.base_city}
                  onChange={(e) => setFormData({ ...formData, base_city: e.target.value })}
                  placeholder="Rishikesh"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price per KM (₹)</Label>
                <Input
                  type="number"
                  value={formData.price_per_km || ''}
                  onChange={(e) => setFormData({ ...formData, price_per_km: parseFloat(e.target.value) || undefined })}
                  placeholder="Base rate"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief description about the driver..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <label key={lang} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={formData.languages.includes(lang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, languages: [...formData.languages, lang] });
                        } else {
                          setFormData({ ...formData, languages: formData.languages.filter(l => l !== lang) });
                        }
                      }}
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service Areas</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_AREAS.map((area) => (
                  <label key={area} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={formData.service_areas.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, service_areas: [...formData.service_areas, area] });
                        } else {
                          setFormData({ ...formData, service_areas: formData.service_areas.filter(a => a !== area) });
                        }
                      }}
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: !!checked })}
                />
                Verified
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
                />
                Featured
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingDriver ? 'Update Driver' : 'Add Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CarDriversPage;

