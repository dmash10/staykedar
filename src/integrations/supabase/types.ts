export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_details: {
        Row: {
          created_at: string
          email: string | null
          firebase_uid: string
          id: string
          name: string | null
          phone_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          firebase_uid: string
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          firebase_uid?: string
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string
          content: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          address: string | null
          location: unknown | null
          amenities: Json | null
          images: string[] | null
          property_type: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          address?: string | null
          location?: unknown | null
          amenities?: Json | null
          images?: string[] | null
          property_type?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          address?: string | null
          location?: unknown | null
          amenities?: Json | null
          images?: string[] | null
          property_type?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "customer_details"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          id: string
          property_id: string
          name: string
          description: string | null
          price: number
          capacity: number
          room_type: string
          status: string
          last_status_update: string
          images: string[] | null
          amenities: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          description?: string | null
          price: number
          capacity?: number
          room_type: string
          status?: string
          last_status_update?: string
          images?: string[] | null
          amenities?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          name?: string
          description?: string | null
          price?: number
          capacity?: number
          room_type?: string
          status?: string
          last_status_update?: string
          amenities?: Json | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          customer_id: string
          check_in_date: string
          check_out_date: string
          total_price: number
          status: string
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          customer_id: string
          check_in_date: string
          check_out_date: string
          total_price: number
          status?: string
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          customer_id?: string
          check_in_date?: string
          check_out_date?: string
          total_price?: number
          status?: string
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customer_details"
            referencedColumns: ["id"]
          }
        ]
      }
      status_logs: {
        Row: {
          id: string
          room_id: string
          user_id: string
          previous_status: string
          new_status: string
          update_time: string
          update_type: string
          notes: string | null
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          previous_status: string
          new_status: string
          update_time?: string
          update_type?: string
          notes?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          previous_status?: string
          new_status?: string
          update_time?: string
          update_type?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_logs_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "customer_details"
            referencedColumns: ["id"]
          }
        ]
      }
      room_availability: {
        Row: {
          id: string
          room_id: string
          date: string
          is_available: boolean
          price_override: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          date: string
          is_available?: boolean
          price_override?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          date?: string
          is_available?: boolean
          price_override?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_availability_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      site_content: {
        Row: {
          id: string
          section: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          email: string
          firebase_uid: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          firebase_uid: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          firebase_uid?: string
          name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          price: number | null
          duration: string | null
          images: string[] | null
          category: string | null
          location: string | null
          features: Json | null
          itinerary: Json | null
          inclusions: Json | null
          exclusions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          price?: number | null
          duration?: string | null
          images?: string[] | null
          category?: string | null
          location?: string | null
          features?: Json | null
          itinerary?: Json | null
          inclusions?: Json | null
          exclusions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          price?: number | null
          duration?: string | null
          images?: string[] | null
          category?: string | null
          location?: string | null
          features?: Json | null
          itinerary?: Json | null
          inclusions?: Json | null
          exclusions?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_profile: {
        Args: {
          firebase_uid: string
        }
        Returns: Json
      }
      update_customer_details: {
        Args: {
          firebase_uid: string
          user_name: string
          user_email: string
          user_phone: string
        }
        Returns: undefined
      }
      update_user_profile: {
        Args: {
          firebase_uid: string
          user_name: string
          user_phone: string
        }
        Returns: undefined
      }
      check_room_availability: {
        Args: {
          room_id: string
          check_in: string
          check_out: string
        }
        Returns: boolean
      }
      find_available_rooms: {
        Args: {
          check_in: string
          check_out: string
          capacity?: number
          location_text?: string
        }
        Returns: {
          room_id: string
          property_id: string
          room_name: string
          property_name: string
          price: number
          room_capacity: number
          room_type: string
        }[]
      }
      update_room_status: {
        Args: {
          p_room_id: string
          p_new_status: string
          p_user_id: string
          p_update_type?: string
          p_notes?: string
        }
        Returns: undefined
      }
      create_booking: {
        Args: {
          p_room_id: string
          p_customer_id: string
          p_check_in_date: string
          p_check_out_date: string
          p_total_price: number
          p_special_requests?: string
        }
        Returns: string
      }
    }
    Enums: {
      news_category: "alert" | "update" | "announcement"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
