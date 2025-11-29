import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building, Bed, User, MapPin, Calendar, Edit, Trash, Eye, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  owner_id: string;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
  room_count: number;
}

interface Room {
  id: string;
  property_id: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  room_type: string;
  status: string;
  created_at: string;
  property_name?: string;
  property_address?: string;
  property_owner?: string;
  booking_count: number;
}

const StaysManager = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [confirmDeleteProperty, setConfirmDeleteProperty] = useState<string | null>(null);
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<string | null>(null);
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === "properties") {
      fetchProperties();
    } else {
      fetchRooms();
    }
  }, [activeTab]);

  useEffect(() => {
    filterData();
  }, [searchTerm, properties, rooms, roomStatusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Fetch properties with owner details and room count
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:customer_details(name, email),
          rooms(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const formattedProperties = data.map(property => ({
        id: property.id,
        name: property.name,
        address: property.address,
        description: property.description,
        owner_id: property.owner_id,
        created_at: property.created_at,
        owner_name: property.owner?.name || 'Unknown',
        owner_email: property.owner?.email || 'Unknown',
        room_count: property.rooms.length || 0
      }));
      
      setProperties(formattedProperties);
      setFilteredProperties(formattedProperties);
      
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // Fetch rooms with property details and booking count
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          property:properties(name, address, owner_id),
          property_owner:properties(owner:customer_details(name)),
          bookings(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const formattedRooms = data.map(room => ({
        id: room.id,
        property_id: room.property_id,
        name: room.name,
        description: room.description,
        price_per_night: room.price,
        capacity: room.capacity,
        room_type: room.room_type,
        status: room.status,
        created_at: room.created_at,
        property_name: room.property?.name || 'Unknown',
        property_address: room.property?.address || 'Unknown',
        property_owner: room.property_owner?.owner?.name || 'Unknown',
        booking_count: room.bookings.length || 0
      }));
      
      setRooms(formattedRooms);
      setFilteredRooms(formattedRooms);
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (activeTab === "properties") {
      const filtered = properties.filter(property => {
        const matchesSearch = searchTerm === "" || 
          (property.name && property.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (property.address && property.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (property.owner_name && property.owner_name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
      });
      
      setFilteredProperties(filtered);
    } else {
      const filtered = rooms.filter(room => {
        const matchesSearch = searchTerm === "" || 
          (room.name && room.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (room.property_name && room.property_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (room.property_owner && room.property_owner.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = roomStatusFilter === "all" || room.status === roomStatusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      setFilteredRooms(filtered);
    }
  };

  const handleViewPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  const handleViewRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      
      // Delete property (cascade will delete rooms and bookings)
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setFilteredProperties(prev => prev.filter(p => p.id !== propertyId));
      
      toast({
        title: "Property Deleted",
        description: "The property and all associated rooms have been deleted",
      });
      
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmDeleteProperty(null);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      setLoading(true);
      
      // Delete room (cascade will delete bookings)
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setRooms(prev => prev.filter(r => r.id !== roomId));
      setFilteredRooms(prev => prev.filter(r => r.id !== roomId));
      
      toast({
        title: "Room Deleted",
        description: "The room and all associated bookings have been deleted",
      });
      
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmDeleteRoom(null);
    }
  };

  const renderPropertyList = () => {
    if (loading && properties.length === 0) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!loading && filteredProperties.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <p className="text-muted-foreground">No properties found</p>
          </CardContent>
        </Card>
      );
    }

    return filteredProperties.map(property => (
      <Card key={property.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{property.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {property.address}
              </CardDescription>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {property.room_count} {property.room_count === 1 ? 'Room' : 'Rooms'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Owner: {property.owner_name}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                Added: {format(new Date(property.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t px-6 py-3">
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewPropertyDetails(property)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setConfirmDeleteProperty(property.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };

  const renderRoomList = () => {
    if (loading && rooms.length === 0) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!loading && filteredRooms.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <p className="text-muted-foreground">No rooms found</p>
          </CardContent>
        </Card>
      );
    }

    return filteredRooms.map(room => (
      <Card key={room.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {room.property_name}
              </CardDescription>
            </div>
            <Badge className={
              room.status === 'available' ? 'bg-green-100 text-green-800' :
              room.status === 'booked' ? 'bg-red-100 text-red-800' :
              room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }>
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Owner: {room.property_owner}</span>
            </div>
            <div className="flex items-center text-sm">
              <Badge variant="outline" className="font-normal">
                ${room.price_per_night}/night
              </Badge>
              <Badge variant="outline" className="ml-2 font-normal">
                {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
              </Badge>
              <Badge variant="outline" className="ml-2 font-normal">
                {room.room_type}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t px-6 py-3">
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewRoomDetails(room)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setConfirmDeleteRoom(room.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stays Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {activeTab === "rooms" && (
            <Select value={roomStatusFilter} onValueChange={setRoomStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs defaultValue="properties" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="properties">
            Properties
            <Badge variant="outline" className="ml-2">
              {properties.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rooms">
            Rooms
            <Badge variant="outline" className="ml-2">
              {rooms.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          {renderPropertyList()}
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4">
          {renderRoomList()}
        </TabsContent>
      </Tabs>

      {/* Property Details Dialog */}
      <Dialog open={showPropertyDetails} onOpenChange={setShowPropertyDetails}>
        <DialogContent className="max-w-3xl">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle>Property Details</DialogTitle>
                <DialogDescription>
                  Detailed information about this property
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium text-lg mb-2">{selectedProperty.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p>{selectedProperty.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Owner</p>
                      <p>{selectedProperty.owner_name} ({selectedProperty.owner_email})</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedProperty.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p>{format(new Date(selectedProperty.created_at), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rooms</p>
                      <p>{selectedProperty.room_count} {selectedProperty.room_count === 1 ? 'Room' : 'Rooms'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPropertyDetails(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowPropertyDetails(false);
                    setConfirmDeleteProperty(selectedProperty.id);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Property
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Room Details Dialog */}
      <Dialog open={showRoomDetails} onOpenChange={setShowRoomDetails}>
        <DialogContent className="max-w-3xl">
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle>Room Details</DialogTitle>
                <DialogDescription>
                  Detailed information about this room
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{selectedRoom.name}</h3>
                    <Badge className={
                      selectedRoom.status === 'available' ? 'bg-green-100 text-green-800' :
                      selectedRoom.status === 'booked' ? 'bg-red-100 text-red-800' :
                      selectedRoom.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedRoom.status.charAt(0).toUpperCase() + selectedRoom.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Property</p>
                      <p>{selectedRoom.property_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p>{selectedRoom.property_address}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedRoom.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Price</p>
                      <p>${selectedRoom.price_per_night}/night</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                      <p>{selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'Guest' : 'Guests'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p>{selectedRoom.room_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                      <p>{selectedRoom.booking_count} {selectedRoom.booking_count === 1 ? 'Booking' : 'Bookings'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Owner</p>
                    <p>{selectedRoom.property_owner}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRoomDetails(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowRoomDetails(false);
                    setConfirmDeleteRoom(selectedRoom.id);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Room
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Property Dialog */}
      <Dialog open={!!confirmDeleteProperty} onOpenChange={(open) => !open && setConfirmDeleteProperty(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This will also delete all rooms and bookings associated with this property. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteProperty(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDeleteProperty && handleDeleteProperty(confirmDeleteProperty)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Property
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Room Dialog */}
      <Dialog open={!!confirmDeleteRoom} onOpenChange={(open) => !open && setConfirmDeleteRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This will also delete all bookings associated with this room. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteRoom(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDeleteRoom && handleDeleteRoom(confirmDeleteRoom)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Room
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaysManager; 