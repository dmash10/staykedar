export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            support_tickets: {
                Row: {
                    id: string
                    ticket_number: string | null
                    user_id: string | null
                    guest_name: string | null
                    guest_email: string | null
                    guest_phone: string | null
                    subject: string
                    category: string
                    priority: string
                    status: string
                    created_at: string | null
                    updated_at: string | null
                }
            }
            ticket_messages: {
                Row: {
                    id: string
                    ticket_id: string
                    sender_id: string | null
                    sender_type: string | null
                    is_admin: boolean | null
                    message: string
                    created_at: string | null
                }
            }
            // ... other tables
        }
        Functions: {
            get_all_tickets: {
                Args: {
                    p_status?: string | null
                    p_category?: string | null
                }
                Returns: Database['public']['Tables']['support_tickets']['Row'][]
            }
            get_ticket_by_number: {
                Args: {
                    p_ticket_number: string
                }
                Returns: Database['public']['Tables']['support_tickets']['Row'][]
            }
            get_ticket_messages_by_number: {
                Args: {
                    p_ticket_number: string
                }
                Returns: Database['public']['Tables']['ticket_messages']['Row'][]
            }
            create_support_ticket: {
                Args: {
                    p_subject: string
                    p_category: string
                    p_message: string
                }
                Returns: Json
            }
            create_ticket_message: {
                Args: {
                    p_ticket_number: string
                    p_message: string
                }
                Returns: Database['public']['Tables']['ticket_messages']['Row'][]
            }
            create_admin_message: {
                Args: {
                    p_ticket_id: string
                    p_message: string
                }
                Returns: Database['public']['Tables']['ticket_messages']['Row'][]
            }
            update_ticket_status: {
                Args: {
                    p_ticket_number: string
                    p_new_status: string
                }
                Returns: Database['public']['Tables']['support_tickets']['Row'][]
            }
        }
    }
}
