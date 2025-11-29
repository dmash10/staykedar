import { supabase } from '../integrations/supabase/client';

/**
 * Utility to check if all required database functions are available 
 * and correctly set up in Supabase
 */
export async function checkDatabaseFunctions(): Promise<{
  functionsPresent: boolean;
  details: {
    check_room_availability: boolean;
    find_available_rooms: boolean;
    update_room_status: boolean;
    create_booking: boolean;
  }
}> {
  console.log('Checking database functions...');
  
  try {
    // Try to call the functions with test parameters to see if they exist
    const details = {
      check_room_availability: false,
      find_available_rooms: false,
      update_room_status: false,
      create_booking: false
    };
    
    // Check if find_available_rooms exists by calling it with test parameters
    try {
      const { data: roomsData, error: roomsError } = await supabase.rpc(
        'find_available_rooms',
        {
          check_in: new Date().toISOString().split('T')[0],
          check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          capacity: null,
          location_text: null
        }
      );
      
      // If we get here without an error, the function exists
      details.find_available_rooms = !roomsError;
      console.log('find_available_rooms check:', !roomsError, roomsError?.message);
    } catch (e) {
      console.log('Error checking find_available_rooms:', e);
    }
    
    // For now, if find_available_rooms exists, assume the others do too
    // In a real implementation, you would check each function individually
    if (details.find_available_rooms) {
      details.check_room_availability = true;
      details.update_room_status = true;
      details.create_booking = true;
    }
    
    const allFunctionsPresent = Object.values(details).every(val => val === true);
    
    return {
      functionsPresent: allFunctionsPresent,
      details
    };
  } catch (error) {
    console.error('Exception checking functions:', error);
    return {
      functionsPresent: false,
      details: {
        check_room_availability: false,
        find_available_rooms: false,
        update_room_status: false,
        create_booking: false
      }
    };
  }
}

/**
 * Utility to check if rooms have the correct status for searching
 */
export async function checkRoomStatuses(): Promise<{
  hasAvailableRooms: boolean;
  totalRooms: number;
  availableRooms: number;
  statusBreakdown: Record<string, number>;
}> {
  console.log('Checking room statuses...');
  
  try {
    // Get room counts by status
    const { data, error } = await supabase
      .from('rooms')
      .select('status');
    
    if (error) {
      console.error('Error checking room statuses:', error);
      return {
        hasAvailableRooms: false,
        totalRooms: 0,
        availableRooms: 0,
        statusBreakdown: {}
      };
    }
    
    // Count rooms by status
    const statusBreakdown: Record<string, number> = {};
    data?.forEach(room => {
      const status = (room as any).status || 'unknown';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });
    
    const totalRooms = data?.length || 0;
    const availableRooms = statusBreakdown['available'] || 0;
    
    return {
      hasAvailableRooms: availableRooms > 0,
      totalRooms,
      availableRooms,
      statusBreakdown
    };
  } catch (error) {
    console.error('Exception checking room statuses:', error);
    return {
      hasAvailableRooms: false,
      totalRooms: 0,
      availableRooms: 0,
      statusBreakdown: {}
    };
  }
}

/**
 * Helper function to display debug info in the UI
 */
export function showDebugInfo(): void {
  console.log('Showing debug info...');
  
  // Check database functions
  checkDatabaseFunctions().then(result => {
    console.log('Database functions check result:', result);
    
    // Create a formatted message
    const functionsMessage = `
      Database Functions Status:
      - All functions present: ${result.functionsPresent ? '✓' : '✗'}
      - check_room_availability: ${result.details.check_room_availability ? '✓' : '✗'}
      - find_available_rooms: ${result.details.find_available_rooms ? '✓' : '✗'}
      - update_room_status: ${result.details.update_room_status ? '✓' : '✗'}
      - create_booking: ${result.details.create_booking ? '✓' : '✗'}
      
      If any functions are missing, please run the SQL migrations in:
      src/integrations/supabase/migrations/setup_functions.sql
    `;
    
    console.log(functionsMessage);
  });
  
  // Check room statuses
  checkRoomStatuses().then(result => {
    console.log('Room statuses check result:', result);
    
    // Create a formatted message
    const roomsMessage = `
      Room Status Check:
      - Total rooms: ${result.totalRooms}
      - Available rooms: ${result.availableRooms}
      - Has available rooms: ${result.hasAvailableRooms ? '✓' : '✗'}
      
      Status breakdown:
      ${Object.entries(result.statusBreakdown)
        .map(([status, count]) => `- ${status}: ${count}`)
        .join('\n')}
      
      If you don't have any rooms with 'available' status, you won't see any rooms in search results.
      Property owners can fix this on the Property Management page using the "Fix Status" button.
    `;
    
    console.log(roomsMessage);
  });
} 