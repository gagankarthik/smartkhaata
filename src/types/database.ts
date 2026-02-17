export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string
          whatsapp: string | null
          company: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone: string
          whatsapp?: string | null
          company?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string
          whatsapp?: string | null
          company?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          title: string
          value: number
          status: 'new' | 'quoted' | 'negotiating' | 'won' | 'lost'
          description: string | null
          expected_close_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          title: string
          value?: number
          status?: 'new' | 'quoted' | 'negotiating' | 'won' | 'lost'
          description?: string | null
          expected_close_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          title?: string
          value?: number
          status?: 'new' | 'quoted' | 'negotiating' | 'won' | 'lost'
          description?: string | null
          expected_close_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          deal_id: string | null
          invoice_number: string
          amount: number
          tax: number
          total: number
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          paid_date: string | null
          items: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          deal_id?: string | null
          invoice_number: string
          amount?: number
          tax?: number
          total?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          paid_date?: string | null
          items?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          deal_id?: string | null
          invoice_number?: string
          amount?: number
          tax?: number
          total?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string
          paid_date?: string | null
          items?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          deal_id: string | null
          title: string
          description: string | null
          due_date: string
          is_completed: boolean
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          deal_id?: string | null
          title: string
          description?: string | null
          due_date: string
          is_completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          deal_id?: string | null
          title?: string
          description?: string | null
          due_date?: string
          is_completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          deal_id: string | null
          type: 'note' | 'call' | 'email' | 'meeting' | 'whatsapp' | 'other'
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          deal_id?: string | null
          type?: 'note' | 'call' | 'email' | 'meeting' | 'whatsapp' | 'other'
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          deal_id?: string | null
          type?: 'note' | 'call' | 'email' | 'meeting' | 'whatsapp' | 'other'
          title?: string
          description?: string | null
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          ticket_number: string
          subject: string
          description: string | null
          status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          category: 'general' | 'billing' | 'technical' | 'sales' | 'complaint' | 'inquiry'
          assigned_to: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          ticket_number: string
          subject: string
          description?: string | null
          status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'general' | 'billing' | 'technical' | 'sales' | 'complaint' | 'inquiry'
          assigned_to?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          ticket_number?: string
          subject?: string
          description?: string | null
          status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'general' | 'billing' | 'technical' | 'sales' | 'complaint' | 'inquiry'
          assigned_to?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          message: string
          is_internal: boolean
          attachments: Json
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          message: string
          is_internal?: boolean
          attachments?: Json
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          message?: string
          is_internal?: boolean
          attachments?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type Reminder = Database['public']['Tables']['reminders']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketMessage = Database['public']['Tables']['ticket_messages']['Row']

export type DealStatus = Deal['status']
export type InvoiceStatus = Invoice['status']
export type ReminderPriority = Reminder['priority']
export type ActivityType = Activity['type']
export type TicketStatus = Ticket['status']
export type TicketPriority = Ticket['priority']
export type TicketCategory = Ticket['category']
