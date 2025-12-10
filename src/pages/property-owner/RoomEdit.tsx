import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { Room, Property } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';

// Define room types
const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'family', 'villa'];

const RoomEdit: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room_type: 'standard',
    price: 0,
    capacity: 1,
    amenities: [] as string[],
  });

  // Load room data
  useEffect(() => {
    if (!user || !roomId) {
      navigate('/auth?redirect=/dashboard/properties');
      return;
    }

    const loadRoom = async () => {
      try {
        setLoading(true);
        setError(null);

        const roomData = await stayService.getRoom(roomId);

        if (!roomData) {
          throw new Error('Room not found');
        }

        setRoom(roomData);
        setFormData({
          name: roomData.name,
          description: roomData.description || '',
          room_type: roomData.room_type,
          price: roomData.price,
          capacity: roomData.capacity,
          amenities: roomData.amenities as string[] || [],
        });

      } catch (err) {
        console.error('Error loading room:', err);
        setError(err instanceof Error ? err.message : 'Failed to load room details');
        toast({
          title: "Error",
          description: "Failed to load room details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [user, roomId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room) return;

    try {
      setSaving(true);

      await stayService.updateRoom(room.id, {
        ...formData,
        property_id: room.property_id,
      });

      toast({
        title: "Changes Saved",
        description: "Room details have been updated successfully.",
      });

      navigate(`/dashboard/properties`);

    } catch (err) {
      console.error('Error updating room:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update room. Please try again.',
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
                <h1 className="text-3xl font-bold">Edit Room</h1>
                <p className="text-gray-600">
                  {property ? `${property.name} - ` : ''}
                  Update room details
                </p>
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
          {!loading && !error && room && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Room Name
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
                    <label htmlFor="room_type" className="block text-sm font-medium text-gray-700">
                      Room Type
                    </label>
                    <select
                      id="room_type"
                      required
                      value={formData.room_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, room_type: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {ROOM_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price per Night (₹)
                    </label>
                    <input
                      type="number"
                      id="price"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                      Capacity (Guests)
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Describe the room's features, size, view, and other details guests should know.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Amenities
                    </label>
                    <div className="space-y-2">
                      {[
                        'Free WiFi',
                        'TV',
                        'Air Conditioning',
                        'Private Bathroom',
                        'Mini Bar',
                        'Safe',
                        'Desk',
                        'Balcony',
                        'Sea View',
                        'Garden View',
                        'Bath Tub',
                        'Coffee Maker',
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

                  <div className="md:col-span-2 flex justify-end space-x-3">
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

export default RoomEdit;