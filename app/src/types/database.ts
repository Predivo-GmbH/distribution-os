/* ============================================================
   Supabase Database Types — Distribution OS
   ============================================================ */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type DbProductStage = 'pre_launch' | 'early' | 'active' | 'scaling'
export type DbEngine = 'pull' | 'push' | 'bridge' | 'search' | 'equity' | 'persistence'

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          stage: DbProductStage
          primary_engine: DbEngine
          secondary_engines: DbEngine[]
          revenue: number | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          stage?: DbProductStage
          primary_engine?: DbEngine
          secondary_engines?: DbEngine[]
          revenue?: number | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          stage?: DbProductStage
          primary_engine?: DbEngine
          secondary_engines?: DbEngine[]
          revenue?: number | null
          color?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          product_id: string
          engine: DbEngine
          title: string
          description: string
          score: number
          completed: boolean
          week_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          engine: DbEngine
          title: string
          description?: string
          score?: number
          completed?: boolean
          week_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          engine?: DbEngine
          title?: string
          description?: string
          score?: number
          completed?: boolean
          week_id?: string
        }
        Relationships: []
      }
      week_records: {
        Row: {
          id: string
          user_id: string
          week_id: string
          total_score: number
          max_score: number
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          week_id: string
          total_score?: number
          max_score?: number
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          week_id?: string
          total_score?: number
          max_score?: number
          completed_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          user_id: string
          dark_mode: boolean
          week_start_day: string
          subscription_tier: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          dark_mode?: boolean
          week_start_day?: string
          subscription_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          dark_mode?: boolean
          week_start_day?: string
          subscription_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      product_stage: DbProductStage
      engine: DbEngine
    }
    CompositeTypes: Record<string, never>
  }
}
