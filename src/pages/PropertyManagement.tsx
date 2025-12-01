import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, Bed, Calendar, TrendingUp, Loader2, Eye, Edit, Trash2, BarChart3, List } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { Property, Room } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PropertyWithRooms = Property & {
  rooms?: Room[];
  totalBookings?: number;
};

const PropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [properties, setProperties] = useState<PropertyWithRooms[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    totalBookings: 0,
    occupancyRate: 0,
  });

  // Load properties
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/dashboard/properties');
      return;
    }

    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const userProperties = await stayService.getProperties().then(
          properties => properties.filter(property => property.owner_id === user.id)
        );

        const propertiesWithDetails = await Promise.all(
          userProperties.map(async (property) => {
            try {
              const rooms = await stayService.getRooms(property.id);
              const bookings = await stayService.getBookingsForProperty(property.id);

              return {
                ...property,
                rooms,
                totalBookings: bookings.length
              };
            } catch (err) {
              console.error('Error fetching details for property:', property.id, err);
              return property;
            }
          })
        );

        setProperties(propertiesWithDetails);

        // Calculate stats
        const totalRooms = propertiesWithDetails.reduce((sum, p) => sum + (p.rooms?.length || 0), 0);
        const totalBookings = propertiesWithDetails.reduce((sum, p) => sum + (p.totalBookings || 0), 0);
        const occupancyRate = totalRooms > 0 ? Math.round((totalBookings / totalRooms) * 100) : 0;

        setStats({
          totalProperties: propertiesWithDetails.length,
          totalRooms,
          totalBookings,
          occupancyRate,
        });

      } catch (err) {
        console.error('Error loading properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your properties');
        toast({
          title: "Error",
          description: "Failed to load your properties. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [user, navigate, toast]);

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      await stayService.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));

      toast({
        title: "Property Deleted",
        description: "The property has been deleted successfully.",
      });
    } catch (err) {
      console.error('Error deleting property:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete property. Please try again.',
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-[#003580] text-white py-12">
          <Container>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Property Dashboard</h1>
                <p className="text-blue-100">Manage your listings and track performance</p>
              </div>
              <Button
                onClick={() => navigate('/dashboard/list-property')}
                className="bg-white text-[#0071c2] hover:bg-blue-50 font-semibold py-6 px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Property
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Properties</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalProperties}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Building className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Rooms</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalRooms}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Bed className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Bookings</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalBookings}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Calendar className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Occupancy</p>
                    <p className="text-4xl font-bold mt-2">{stats.occupancyRate}%</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <Container className="py-10">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0071c2]" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
                  {error}
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="h-10 w-10 text-[#0071c2]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">No properties listed yet</h2>
                  <p className="text-gray-600 mb-8">Start earning by listing your property on Staykedar.</p>
                  <Button
                    onClick={() => navigate('/dashboard/list-property')}
                    className="bg-[#0071c2] hover:bg-[#005a9c] text-white px-8 py-6 text-lg font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    List Your First Property
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group"
                    >
                      {/* Property Image */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={property.images?.[0] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"}
                          alt={property.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow-md">
                          {property.rooms?.length || 0} Rooms
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {property.description || property.address}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.rooms?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{property.totalBookings || 0} bookings</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/stays/${property.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/dashboard/properties/${property.id}/edit`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings">
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bookings Management</h3>
                <p className="text-gray-600">View and manage all your property bookings in one place.</p>
                <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics & Insights</h3>
                <p className="text-gray-600">Track your revenue, occupancy rates, and performance metrics.</p>
                <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default PropertyManagement;