import { supabase, safeQuery } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { format } from "date-fns";

// Types
export type Property = Tables<"properties">;
export type PropertyInsert = TablesInsert<"properties">;
export type Room = Tables<"rooms">;
export type RoomInsert = TablesInsert<"rooms">;
export type Booking = Tables<"bookings">;
export type BookingInsert = TablesInsert<"bookings">;
export type StatusLog = Tables<"status_logs">;
export type RoomAvailability = Tables<"room_availability">;

// Available room statuses
export const ROOM_STATUSES = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning',
};

// Available booking statuses
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
};

// Status update types
export const UPDATE_TYPES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SYSTEM: 'system',
};

// Helper types for search
export type SearchRoomsParams = {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  capacity?: number;
  limit?: number;
  offset?: number;
};

export type AvailableRoom = {
  room_id: string;
  property_id: string;
  room_name: string;
  property_name: string;
  price: number;
  room_capacity: number;
  room_type: string;
};

// Add these types and interfaces at the top of the file
interface RoomSearchResult {
  room_id: string;
  property_id: string;
  room_name: string;
  property_name: string;
  price: number;
  room_capacity: number;
  room_type: string;
}

interface CachedProperty {
  id: string;
  name: string;
  address: string;
  // Add other properties as needed
}

interface CachedRoom {
  id: string;
  name: string;
  property_id: string;
  price: number;
  capacity: number;
  room_type: string;
  status: string;
  // Add other properties as needed
}

interface CachedBooking {
  id: string;
  room_id: string;
  customer_id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  // Add other properties as needed
}

// Cache implementation
interface CacheType {
  properties: CachedProperty[];
  rooms: Record<string, CachedRoom[]>;
  bookings: Record<string, CachedBooking[]>;
  searchResults: Record<string, RoomSearchResult[]>;
  lastUpdated: Record<string, number>;
}

const cache: CacheType = {
  properties: [],
  rooms: {},
  bookings: {},
  searchResults: {},
  lastUpdated: {}
};

// Cache utility functions
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const getSearchCacheKey = (
  checkIn: Date,
  checkOut: Date,
  location: string,
  capacity?: number
): string => {
  return `${checkIn.toISOString()}_${checkOut.toISOString()}_${location || ''}_${capacity || ''}`;
};

const isCacheValid = (cacheKey: string): boolean => {
  const lastUpdated = cache.lastUpdated[cacheKey];
  return !!lastUpdated && (Date.now() - lastUpdated < CACHE_TTL);
};

const updateSearchCache = (
  checkIn: Date,
  checkOut: Date,
  location: string,
  capacity: number | undefined,
  results: RoomSearchResult[]
): void => {
  const cacheKey = getSearchCacheKey(checkIn, checkOut, location, capacity);
  cache.searchResults[cacheKey] = results;
  cache.lastUpdated[cacheKey] = Date.now();
};

// Function to sync pending changes when online
export const syncPendingChanges = async (): Promise<void> => {
  // This would be implemented for IndexedDB offline support
  // For now, just log that we're syncing
  console.log('Syncing pending changes...');
};

// Property functions
export const getProperties = async (): Promise<Property[]> => {
  // Return from cache if valid
  if (isCacheValid('properties')) {
    return cache.properties as any;
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('name');

    if (error) throw error;

    // Update cache
    cache.properties = data as any;
    cache.lastUpdated['properties'] = Date.now();

    return data;
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};

export const getProperty = async (propertyId: string): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting property with ID ${propertyId}:`, error);
    throw error;
  }
};

export const createProperty = async (property: PropertyInsert): Promise<Property> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (error) throw error;

    // Invalidate properties cache
    cache.lastUpdated['properties'] = 0;

    return data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

export const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate properties cache
    cache.lastUpdated['properties'] = 0;

    return data;
  } catch (error) {
    console.error(`Error updating property with ID ${propertyId}:`, error);
    throw error;
  }
};

export const deleteProperty = async (propertyId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;

    // Invalidate properties cache
    cache.lastUpdated['properties'] = 0;

    // Also invalidate rooms for this property
    delete cache.rooms[propertyId];
  } catch (error) {
    console.error(`Error deleting property with ID ${propertyId}:`, error);
    throw error;
  }
};

// Room functions
export const getRooms = async (propertyId: string): Promise<Room[]> => {
  const cacheKey = `rooms_${propertyId}`;

  // Return from cache if valid
  if (isCacheValid(cacheKey) && cache.rooms[propertyId]) {
    return cache.rooms[propertyId] as any;
  }

  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .order('name');

    if (error) throw error;

    // Update cache
    cache.rooms[propertyId] = data as any;
    cache.lastUpdated[cacheKey] = Date.now();

    return data;
  } catch (error) {
    console.error(`Error getting rooms for property ID ${propertyId}:`, error);
    throw error;
  }
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting room with ID ${roomId}:`, error);
    throw error;
  }
};

export const createRoom = async (room: RoomInsert): Promise<Room> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();

    if (error) throw error;

    // Invalidate rooms cache for this property
    const cacheKey = `rooms_${room.property_id}`;
    cache.lastUpdated[cacheKey] = 0;

    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const updateRoom = async (roomId: string, updates: Partial<Room>): Promise<Room> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;

    // Get the property ID from the returned data
    const propertyId = data.property_id;

    // Invalidate rooms cache for this property
    const cacheKey = `rooms_${propertyId}`;
    cache.lastUpdated[cacheKey] = 0;

    return data;
  } catch (error) {
    console.error(`Error updating room with ID ${roomId}:`, error);
    throw error;
  }
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  try {
    // First get the room to know its property ID
    const room = await getRoom(roomId);
    if (!room) throw new Error(`Room with ID ${roomId} not found`);

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;

    // Invalidate rooms cache for this property
    const cacheKey = `rooms_${room.property_id}`;
    cache.lastUpdated[cacheKey] = 0;
  } catch (error) {
    console.error(`Error deleting room with ID ${roomId}:`, error);
    throw error;
  }
};

// Room status functions
export const updateRoomStatus = async (
  roomId: string,
  newStatus: string,
  userId: string,
  updateType: string = UPDATE_TYPES.OWNER,
  notes?: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('update_room_status', {
      p_room_id: roomId,
      p_new_status: newStatus,
      p_user_id: userId,
      p_update_type: updateType,
      p_notes: notes
    });

    if (error) throw error;

    // Invalidate room cache
    const room = await getRoom(roomId);
    if (room) {
      const cacheKey = `rooms_${room.property_id}`;
      cache.lastUpdated[cacheKey] = 0;
    }
  } catch (error) {
    console.error(`Error updating status for room ID ${roomId}:`, error);
    throw error;
  }
};

export const getRoomStatusLogs = async (roomId: string): Promise<StatusLog[]> => {
  try {
    const { data, error } = await supabase
      .from('status_logs')
      .select('*')
      .eq('room_id', roomId)
      .order('update_time', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting status logs for room ID ${roomId}:`, error);
    throw error;
  }
};

// Search and availability functions
export const searchRooms = async (
  checkIn: Date,
  checkOut: Date,
  location: string,
  capacity?: number
): Promise<RoomSearchResult[]> => {
  console.log('Searching rooms with params:', { checkIn, checkOut, location, capacity });

  try {
    const { data, error } = await supabase.rpc("find_available_rooms", {
      check_in: checkIn.toISOString().split('T')[0],
      check_out: checkOut.toISOString().split('T')[0],
      location_text: location || null,
      capacity: capacity || null,
    });

    if (error) {
      console.error("RPC Error in searchRooms:", error);
      console.log("Falling back to direct query...");
      return fallbackRoomSearch(checkIn, checkOut, location, capacity);
    }

    console.log("Found rooms via RPC:", data?.length || 0);
    // Update cache with search results
    updateSearchCache(checkIn, checkOut, location, capacity, data as RoomSearchResult[]);
    return data as RoomSearchResult[];
  } catch (error) {
    console.error("Exception in searchRooms:", error);
    console.log("Falling back to direct query due to exception...");
    return fallbackRoomSearch(checkIn, checkOut, location, capacity);
  }
};

// Fallback function that performs a direct query if the RPC call fails
const fallbackRoomSearch = async (
  checkIn: Date,
  checkOut: Date,
  location: string,
  capacity?: number
): Promise<RoomSearchResult[]> => {
  try {
    console.log("Executing fallback room search");

    // First get all rooms that match the basic criteria
    let query = supabase
      .from('rooms')
      .select(`
        id,
        name,
        price,
        capacity,
        room_type,
        status,
        property_id,
        properties(id, name, address)
      `)
      .eq('status', 'available');

    if (capacity) {
      query = query.gte('capacity', capacity);
    }

    const { data: rooms, error: roomsError } = await query;

    if (roomsError) {
      console.error("Fallback search error:", roomsError);
      return [];
    }

    if (!rooms || rooms.length === 0) {
      console.log("No rooms found in fallback search");
      return [];
    }

    // Filter rooms by location if provided
    let filteredRooms = rooms;
    if (location && location.trim() !== '') {
      filteredRooms = rooms.filter(room => {
        const propertyAddress = (room.properties as any)?.address || '';
        const propertyName = (room.properties as any)?.name || '';
        return (
          propertyAddress.toLowerCase().includes(location.toLowerCase()) ||
          propertyName.toLowerCase().includes(location.toLowerCase())
        );
      });
    }

    // Check for booking conflicts
    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    // Get all bookings that might conflict with the requested dates
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('room_id, check_in_date, check_out_date, status')
      .not('status', 'eq', 'cancelled')
      .or(`check_in_date.lte.${checkOutStr},check_out_date.gte.${checkInStr}`);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return [];
    }

    const availableRoomIds = new Set(filteredRooms.map(room => room.id));

    if (bookings && bookings.length > 0) {
      bookings.forEach(booking => {
        const bookingCheckIn = new Date(booking.check_in_date);
        const bookingCheckOut = new Date(booking.check_out_date);

        const hasConflict = (
          (bookingCheckIn <= checkIn && bookingCheckOut > checkIn) ||
          (bookingCheckIn < checkOut && bookingCheckOut >= checkOut) ||
          (bookingCheckIn >= checkIn && bookingCheckOut <= checkOut)
        );

        if (hasConflict) {
          availableRoomIds.delete(booking.room_id);
        }
      });
    }

    // Final filtering by availability
    const availableRooms = filteredRooms.filter(room => availableRoomIds.has(room.id));

    console.log(`After checking bookings, ${availableRooms.length} rooms are truly available`);

    // Transform the data to match the expected structure from the RPC function
    const formattedRooms: RoomSearchResult[] = availableRooms.map(room => ({
      room_id: room.id,
      property_id: room.property_id,
      room_name: room.name,
      property_name: (room.properties as any)?.name || 'Unknown Property',
      price: room.price,
      room_capacity: room.capacity,
      room_type: room.room_type
    }));

    // Cache the results
    updateSearchCache(checkIn, checkOut, location, capacity, formattedRooms);

    return formattedRooms;
  } catch (error) {
    console.error("Exception in fallback room search:", error);
    return [];
  }
};

export const checkRoomAvailability = async (
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_room_availability', {
      room_id: roomId,
      check_in: checkIn,
      check_out: checkOut
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error checking availability for room ID ${roomId}:`, error);
    throw error;
  }
};

// Booking functions
export const createBooking = async (booking: {
  roomId: string;
  customerId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  specialRequests?: string;
}): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('create_booking', {
      p_room_id: booking.roomId,
      p_customer_id: booking.customerId,
      p_check_in_date: booking.checkInDate,
      p_check_out_date: booking.checkOutDate,
      p_total_price: booking.totalPrice,
      p_special_requests: booking.specialRequests
    });

    if (error) throw error;

    // Invalidate bookings cache for this customer
    const cacheKey = `bookings_${booking.customerId}`;
    cache.lastUpdated[cacheKey] = 0;

    // Also invalidate search results as availability has changed
    Object.keys(cache.searchResults).forEach(key => {
      cache.lastUpdated[key] = 0;
    });

    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBookingsForCustomer = async (customerId: string): Promise<Booking[]> => {
  const cacheKey = `bookings_${customerId}`;

  // Return from cache if valid
  if (isCacheValid(cacheKey) && cache.bookings[customerId]) {
    return cache.bookings[customerId] as any;
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Update cache
    cache.bookings[customerId] = data as any;
    cache.lastUpdated[cacheKey] = Date.now();

    return data;
  } catch (error) {
    console.error(`Error getting bookings for customer ID ${customerId}:`, error);
    throw error;
  }
};

export const getBookingsForRoom = async (roomId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('room_id', roomId)
      .order('check_in_date');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting bookings for room ID ${roomId}:`, error);
    throw error;
  }
};

export const getBookingsForProperty = async (propertyId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms!inner(
          property_id
        )
      `)
      .eq('rooms.property_id', propertyId)
      .order('check_in_date');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting bookings for property ID ${propertyId}:`, error);
    throw error;
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) throw error;

    // Invalidate all booking caches
    Object.keys(cache.bookings).forEach(customerId => {
      const cacheKey = `bookings_${customerId}`;
      cache.lastUpdated[cacheKey] = 0;
    });
  } catch (error) {
    console.error(`Error updating status for booking ID ${bookingId}:`, error);
    throw error;
  }
};

// Utility to clear all caches - useful when logging out or for force refresh
const resetCache = (): void => {
  cache.properties = [];
  cache.rooms = {};
  cache.bookings = {};
  cache.searchResults = {};
  cache.lastUpdated = {};
};

// Property-centric search
export interface PropertySearchResult extends Property {
  lowestPrice: number;
  roomCount: number;
}

export const searchProperties = async (
  checkIn: Date,
  checkOut: Date,
  location: string,
  guests: number,
  filters?: {
    amenities?: string[];
    propertyTypes?: string[];
    minRating?: number;
  }
): Promise<PropertySearchResult[]> => {
  console.log('Searching properties with params:', { checkIn, checkOut, location, guests, filters });

  // 1. Search for available rooms matching criteria
  let query = supabase
    .from('rooms')
    .select(`
      id,
      price,
      capacity,
      property_id,
      properties!inner (
        id,
        name,
        description,
        address,
        images,
        amenities,
        property_type,
        rating
      )
    `)
    .eq('status', ROOM_STATUSES.AVAILABLE)
    .gte('capacity', guests);

  // Apply location filter on the joined property
  if (location) {
    query = query.ilike('properties.address', `%${location}%`);
  }

  // Apply property type filter
  if (filters?.propertyTypes && filters.propertyTypes.length > 0) {
    query = query.in('properties.property_type', filters.propertyTypes);
  }

  // Apply rating filter
  if (filters?.minRating) {
    query = query.gte('properties.rating', filters.minRating);
  }

  const { data: rooms, error } = await query;

  if (error) {
    console.error('Error searching properties:', error);
    throw error;
  }

  if (!rooms || rooms.length === 0) {
    return [];
  }

  // 2. Check availability for specific dates
  const roomIds = rooms.map(r => r.id);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('room_id')
    .in('room_id', roomIds)
    .in('status', [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.CHECKED_IN, BOOKING_STATUSES.PENDING])
    .or(`check_in_date.lte.${format(checkOut, 'yyyy-MM-dd')},check_out_date.gte.${format(checkIn, 'yyyy-MM-dd')}`);

  const bookedRoomIds = new Set(bookings?.map(b => b.room_id) || []);

  const availableRooms = rooms.filter(r => !bookedRoomIds.has(r.id));

  // 3. Group by property
  const propertyMap = new Map<string, PropertySearchResult>();

  availableRooms.forEach(room => {
    // Filter by amenities if needed (client-side for JSONB)
    if (filters?.amenities && filters.amenities.length > 0) {
      const propertyAmenities = (room.properties?.amenities as string[]) || [];
      const hasAllAmenities = filters.amenities.every(a => propertyAmenities.includes(a));
      if (!hasAllAmenities) return;
    }

    const property = room.properties;
    if (!property) return;

    if (!propertyMap.has(property.id)) {
      propertyMap.set(property.id, {
        ...property,
        lowestPrice: room.price,
        roomCount: 1
      });
    } else {
      const entry = propertyMap.get(property.id)!;
      entry.lowestPrice = Math.min(entry.lowestPrice, room.price);
      entry.roomCount += 1;
    }
  });

  return Array.from(propertyMap.values());
};

// Get room types with availability count for a property
export interface RoomTypeAvailability {
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: any;
  images: string[];
  availableCount: number;
  roomIds: string[]; // IDs of available rooms of this type
}

export const getPropertyRoomTypes = async (
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<RoomTypeAvailability[]> => {
  // 1. Get all rooms for property
  const allRooms = await getRooms(propertyId);

  // 2. Filter for availability
  const { data: bookings } = await supabase
    .from('bookings')
    .select('room_id, check_in_date, check_out_date, status')
    .not('status', 'eq', 'cancelled')
    .eq('rooms.property_id', propertyId)
    .or(`check_in_date.lte.${checkOut.toISOString().split('T')[0]},check_out_date.gte.${checkIn.toISOString().split('T')[0]}`);

  // Need to join with rooms to filter by propertyId in the query above, but we can also just filter bookings by roomIds of the property
  // Since we already fetched allRooms, let's filter bookings by those room IDs
  // Actually, the query above tries to use 'rooms.property_id' which requires a join.
  // Let's fix this query to be simpler:

  const roomIds = allRooms.map(r => r.id);

  const { data: conflictingBookings } = await supabase
    .from('bookings')
    .select('room_id')
    .in('room_id', roomIds)
    .not('status', 'eq', 'cancelled')
    .or(`check_in_date.lte.${checkOut.toISOString().split('T')[0]},check_out_date.gte.${checkIn.toISOString().split('T')[0]}`);

  const conflictingRoomIds = new Set(conflictingBookings?.map(b => b.room_id) || []);

  const availableRooms = allRooms.filter(room =>
    room.status === 'available' && !conflictingRoomIds.has(room.id)
  );

  // 3. Group by "Room Type" (Name + Type + Price + Capacity)
  const roomTypesMap = new Map<string, RoomTypeAvailability>();

  availableRooms.forEach(room => {
    const key = `${room.name}-${room.room_type}-${room.price}-${room.capacity}`;

    if (!roomTypesMap.has(key)) {
      roomTypesMap.set(key, {
        name: room.name,
        type: room.room_type,
        price: room.price,
        capacity: room.capacity,
        amenities: room.amenities,
        images: room.images || [],
        availableCount: 0,
        roomIds: []
      });
    }

    const entry = roomTypesMap.get(key)!;
    entry.availableCount++;
    entry.roomIds.push(room.id);
  });

  return Array.from(roomTypesMap.values());
};

// Default export
const stayService = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getRoomStatusLogs,
  searchRooms,
  searchProperties,
  getPropertyRoomTypes,
  checkRoomAvailability,
  createBooking,
  getBookingsForCustomer,
  getBookingsForRoom,
  getBookingsForProperty,
  updateBookingStatus,
  resetCache,
  syncPendingChanges,
  ROOM_STATUSES,
  BOOKING_STATUSES,
  UPDATE_TYPES,
};

export default stayService;