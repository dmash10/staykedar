import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { Property } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';

const PropertyEdit: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    amenities: [] as string[],
  });

  // Load property data
  useEffect(() => {
    if (!user || !propertyId) {
      navigate('/auth?redirect=/dashboard/properties');
      return;
    }

    const loadProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        const propertyData = await stayService.getProperty(propertyId);

        // Verify ownership
        if (propertyData.owner_id !== user.id) {
          throw new Error('You do not have permission to edit this property');
        }

        setProperty(propertyData);
        setFormData({
          name: propertyData.name,
          description: propertyData.description || '',
          address: propertyData.address || '',
          amenities: propertyData.amenities as string[] || [],
        });

      } catch (err) {
        console.error('Error loading property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property details');
        toast({
          title: "Error",
          description: "Failed to load property details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [user, propertyId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!property) return;

    try {
      setSaving(true);

      await stayService.updateProperty(property.id, {
        ...formData,
        owner_id: property.owner_id,
      });

      toast({
        title: "Changes Saved",
        description: "Property details have been updated successfully.",
      });

      navigate('/dashboard/properties');

    } catch (err) {
      console.error('Error updating property:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update property. Please try again.',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/properties');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50 py-8">
        <Container>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={handleCancel}
                className="mr-4 p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Edit Property</h1>
                <p className="text-gray-600">Update your property details</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Edit Form */}
          {!loading && !error && property && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Property Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={5}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Describe your property, its location, and what makes it special.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="space-y-2">
                      {[
                        'Free WiFi',
                        'Parking',
                        'Air Conditioning',
                        'Restaurant',
                        'Room Service',
                        'Swimming Pool',
                        'Fitness Center',
                        'Spa',
                        'Bar/Lounge',
                        'Business Center',
                        'Laundry Service',
                        '24/7 Front Desk',
                      ].map((amenity) => (
                        <label key={amenity} className="inline-flex items-center mr-6 mb-2">
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  amenities: [...prev.amenities, amenity]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  amenities: prev.amenities.filter(a => a !== amenity)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default PropertyEdit;