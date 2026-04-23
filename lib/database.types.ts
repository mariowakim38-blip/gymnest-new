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
      announcements: {
        Row: {
          id: string
          title: string
          message: string
          type: 'promotion' | 'event' | 'info'
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: 'promotion' | 'event' | 'info'
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: 'promotion' | 'event' | 'info'
          date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          id: string
          url: string
          caption: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          caption: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          caption?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          id: string
          name: string
          specialization: string
          experience: string
          bio: string
          image_url: string
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          specialization: string
          experience: string
          bio: string
          image_url: string
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          specialization?: string
          experience?: string
          bio?: string
          image_url?: string
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          username: string
          phone_number: string
          role: 'parent' | 'coach' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          username: string
          phone_number: string
          role?: 'parent' | 'coach' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          username?: string
          phone_number?: string
          role?: 'parent' | 'coach' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          profile_id: string
          name: string
          age: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          age: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          age?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          profile_id: string
          class_id: string
          child_id: string
          booking_date: string
          status: 'confirmed' | 'cancelled' | 'completed'
          attended: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          class_id: string
          child_id: string
          booking_date: string
          status?: 'confirmed' | 'cancelled' | 'completed'
          attended?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          class_id?: string
          child_id?: string
          booking_date?: string
          status?: 'confirmed' | 'cancelled' | 'completed'
          attended?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "children"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          profile_id: string
          coach_id: string
          child_id: string
          session_date: string
          duration: number
          status: 'confirmed' | 'cancelled' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          coach_id: string
          child_id: string
          session_date: string
          duration: number
          status?: 'confirmed' | 'cancelled' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          coach_id?: string
          child_id?: string
          session_date?: string
          duration?: number
          status?: 'confirmed' | 'cancelled' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "children"
            referencedColumns: ["id"]
          }
        ]
      }
      classes: {
        Row: {
          id: string
          name: string
          age_group: string
          level: 'Beginner' | 'Intermediate' | 'Advanced'
          day: string
          time: string
          duration: string
          coach_id: string
          capacity: number
          enrolled: number
          description: string
          day_of_week: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age_group: string
          level: 'Beginner' | 'Intermediate' | 'Advanced'
          day: string
          time: string
          duration: string
          coach_id: string
          capacity?: number
          enrolled?: number
          description: string
          day_of_week: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age_group?: string
          level?: 'Beginner' | 'Intermediate' | 'Advanced'
          day?: string
          time?: string
          duration?: string
          coach_id?: string
          capacity?: number
          enrolled?: number
          description?: string
          day_of_week?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          type: 'Competition' | 'Workshop' | 'Showcase' | 'Camp'
          description: string
          location: string
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          type: 'Competition' | 'Workshop' | 'Showcase' | 'Camp'
          description: string
          location: string
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string
          type?: 'Competition' | 'Workshop' | 'Showcase' | 'Camp'
          description?: string
          location?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'parent' | 'coach' | 'admin'
      booking_status: 'confirmed' | 'cancelled' | 'completed'
    }
  }
}
