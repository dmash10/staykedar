import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, Bed, Calendar, Users, Edit, Trash2, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import stayService, { Property, Room } from '@/api/stayService';
import { useToast } from '@/hooks/use-toast';

// Define room types constant
const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'family', 'villa'];

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
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState<string | null>(null);

  // Form states
  const [newProperty, setNewProperty] = useState({
    name: '',
    description: '',
    address: '',
    amenities: [] as string[],
  });

  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    room_type: ROOM_TYPES[0],
    price: 0,
    capacity: 1,
    amenities: [] as string[],
  });

  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

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

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const property = await stayService.createProperty({
        ...newProperty,
        owner_id: user.id,
      });

      setProperties(prev => [...prev, property]);
      setShowAddProperty(false);
      setNewProperty({
        name: '',
        description: '',
        address: '',
        amenities: [],
      });

      toast({
        title: "Property Added",
        description: "Your property has been added successfully.",
      });

    } catch (err) {
      console.error('Error adding property:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to add property. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleAddRoom = async (propertyId: string, e: React.FormEvent) => {
    e.preventDefault();

    try {
      const room = await stayService.createRoom({
        ...newRoom,
        property_id: propertyId,
        status: stayService.ROOM_STATUSES.AVAILABLE,
        last_status_update: new Date().toISOString()
      });

      setProperties(prev =>
        prev.map(property =>
          property.id === propertyId
            ? { ...property, rooms: [...(property.rooms || []), room] }
            : property
        )
      );

      setShowAddRoom(null);
      setNewRoom({
        name: '',
        description: '',
        room_type: ROOM_TYPES[0],
        price: 0,
        capacity: 1,
        amenities: [],
      });

      toast({
        title: "Room Added",
        description: "The room has been added successfully and is now available for booking.",
      });

    } catch (err) {
      console.error('Error adding room:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to add room. Please try again.',
        variant: "destructive",
      });
    }
  };

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

  const handleDeleteRoom = async (propertyId: string, roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      await stayService.deleteRoom(roomId);

      setProperties(prev =>
        prev.map(property =>
          property.id === propertyId
            ? { ...property, rooms: property.rooms?.filter(r => r.id !== roomId) }
            : property
        )
      );

      toast({
        title: "Room Deleted",
        description: "The room has been deleted successfully.",
      });

    } catch (err) {
      console.error('Error deleting room:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete room. Please try again.',
        variant: "destructive",
      });
    }
  };

  const fixRoomStatus = async (roomId: string, propertyId: string) => {
    if (!user) return;

    try {
      setUpdatingStatus(prev => ({ ...prev, [roomId]: true }));

      await stayService.updateRoomStatus(
        roomId,
        stayService.ROOM_STATUSES.AVAILABLE,
        user.id,
        'owner',
        'Manual status update to make room available'
      );

      setProperties(prev =>
        prev.map(property =>
          property.id === propertyId
            ? {
              ...property,
              rooms: property.rooms?.map(room =>
                room.id === roomId
                  ? { ...room, status: stayService.ROOM_STATUSES.AVAILABLE }
                  : room
              )
            }
            : property
        )
      );

      toast({
        title: "Room Status Updated",
        description: "Room status has been updated to available and will now appear in search results.",
      });

    } catch (err) {
      console.error('Error updating room status:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update room status. Please try again.',
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [roomId]: false }));
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50 py-8">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Properties</h1>
              <p className="text-gray-600">Manage your properties and rooms</p>
            </div>
            <button
              onClick={() => setShowAddProperty(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Property
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && properties.length === 0 && !showAddProperty && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No properties yet</h3>
              <p className="text-gray-500 mb-4">
                Start by adding your first property to manage rooms and bookings.
              </p>
              <button
                onClick={() => setShowAddProperty(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Property
              </button>
            </div>
          )}

          {showAddProperty && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Add New Property</h2>
              <form onSubmit={handleAddProperty}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">
                      Property Name
                    </label>
                    <input
                      type="text"
                      id="propertyName"
                      required
                      value={newProperty.name}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="propertyDescription" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="propertyDescription"
                      required
                      value={newProperty.description}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="propertyAddress"
                      required
                      value={newProperty.address}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddProperty(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Property
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="space-y-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                        <p className="text-gray-500 mt-1">{property.address}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate(`/dashboard/properties/${property.id}/edit`)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-1.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Bed className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-500">
                            {property.rooms?.length || 0} Rooms
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-500">
                            {property.totalBookings || 0} Bookings
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <button
                          onClick={() => navigate(`/dashboard/properties/${property.id}/calendar`)}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <span className="text-sm font-medium">View Calendar</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium">Rooms</h4>
                      <button
                        onClick={() => setShowAddRoom(property.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Room
                      </button>
                    </div>

                    {showAddRoom === property.id && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Add New Room</h5>
                        <form onSubmit={(e) => handleAddRoom(property.id, e)}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                                Room Name
                              </label>
                              <input
                                type="text"
                                id="roomName"
                                required
                                value={newRoom.name}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
                                Room Type
                              </label>
                              <select
                                id="roomType"
                                required
                                value={newRoom.room_type}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, room_type: e.target.value }))}
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
                              <label htmlFor="roomPrice" className="block text-sm font-medium text-gray-700">
                                Price per Night (₹)
                              </label>
                              <input
                                type="number"
                                id="roomPrice"
                                required
                                min="0"
                                value={newRoom.price}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label htmlFor="roomCapacity" className="block text-sm font-medium text-gray-700">
                                Capacity
                              </label>
                              <input
                                type="number"
                                id="roomCapacity"
                                required
                                min="1"
                                value={newRoom.capacity}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <textarea
                                id="roomDescription"
                                required
                                value={newRoom.description}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowAddRoom(null)}
                              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Add Room
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {property.rooms && property.rooms.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {property.rooms.map((room) => (
                          <div key={room.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{room.name}</h5>
                                <p className="text-sm text-gray-500">
                                  {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => navigate(`/dashboard/rooms/${room.id}/edit`)}
                                  className="p-1 text-gray-400 hover:text-gray-500"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRoom(property.id, room.id)}
                                  className="p-1 text-red-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Users className="h-4 w-4 mr-1" />
                              <span>Up to {room.capacity} guests</span>
                            </div>

                            {room.status !== stayService.ROOM_STATUSES.AVAILABLE && (
                              <div className="mt-2">
                                <div className="text-xs text-amber-700 bg-amber-50 p-1 rounded mb-1">
                                  Status: {room.status} - Not visible in search
                                </div>
                                <button
                                  onClick={() => fixRoomStatus(room.id, property.id)}
                                  disabled={updatingStatus[room.id]}
                                  className="inline-flex items-center text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                                >
                                  {updatingStatus[room.id] ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                  )}
                                  Make Available
                                </button>
                              </div>
                            )}

                            <div className="mt-2">
                              <span className="text-lg font-bold text-blue-600">
                                ₹{room.price}
                              </span>
                              <span className="text-sm text-gray-500"> / night</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No rooms added yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default PropertyManagement;