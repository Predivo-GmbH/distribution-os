/* ============================================================
   Supabase Database Types — Distribution OS
   ============================================================ */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type DbProductStage = 'pre_launch' | 'early' | 'active' | 'scaling'
export type DbEngine = 'pull' | 'push' | 'bridge' | 'search' | 'equity' | 'persistence'
export type DbArtifactStatus = 'pending' | 'approved' | 'scheduled' | 'published' | 'regenerating' | 'dismissed'
export type DbWorkerType =
  | 'seo-content-writer' | 'keyword-research' | 'search-console-optimizer' | 'backlink-outreach'
  | 'linkedin-director' | 'email-sequence-writer' | 'lead-magnet-generator' | 'waitlist-copy-writer' | 'content-performance-analyst'
  | 'connector-research' | 'personalized-outreach' | 'demo-script-generator' | 'follow-up-sequence' | 'connector-performance'
  | 'keyword-strategy' | 'ad-copy-generator' | 'landing-page-copy' | 'roas-analyst'
  | 'partner-research' | 'pitch-package' | 'improvement-prioritizer'
  | 'weekly-diagnostician' | 'messaging-clarity' | 'stage-transition-advisor'

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
      inbox_artifacts: {
        Row: {
          id: string
          user_id: string
          product_id: string
          engine: DbEngine
          worker_type: DbWorkerType
          task_title: string
          status: DbArtifactStatus
          content: string
          edited_content: string | null
          direction_note: string | null
          generated_at: string
          approved_at: string | null
          scheduled_for: string | null
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          engine: DbEngine
          worker_type: DbWorkerType
          task_title: string
          status?: DbArtifactStatus
          content: string
          edited_content?: string | null
          direction_note?: string | null
          generated_at?: string
          approved_at?: string | null
          scheduled_for?: string | null
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          engine?: DbEngine
          worker_type?: DbWorkerType
          task_title?: string
          status?: DbArtifactStatus
          content?: string
          edited_content?: string | null
          direction_note?: string | null
          approved_at?: string | null
          scheduled_for?: string | null
          published_at?: string | null
        }
        Relationships: []
      }
      knowledge_bases: {
        Row: {
          id: string
          user_id: string
          product_id: string
          voice_examples: string[]
          icp_who: string
          icp_pain: string
          icp_tried_before: string
          icp_desired_outcome: string
          icp_hangouts_online: string
          positioning_one_liner: string
          positioning_benefits: string[]
          positioning_competitor: string
          positioning_switch_reason: string
          tone_formality: string
          tone_technicality: string
          tone_boldness: string
          tone_length_preference: string
          approved_artifacts: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          voice_examples?: string[]
          icp_who?: string
          icp_pain?: string
          icp_tried_before?: string
          icp_desired_outcome?: string
          icp_hangouts_online?: string
          positioning_one_liner?: string
          positioning_benefits?: string[]
          positioning_competitor?: string
          positioning_switch_reason?: string
          tone_formality?: string
          tone_technicality?: string
          tone_boldness?: string
          tone_length_preference?: string
          approved_artifacts?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          voice_examples?: string[]
          icp_who?: string
          icp_pain?: string
          icp_tried_before?: string
          icp_desired_outcome?: string
          icp_hangouts_online?: string
          positioning_one_liner?: string
          positioning_benefits?: string[]
          positioning_competitor?: string
          positioning_switch_reason?: string
          tone_formality?: string
          tone_technicality?: string
          tone_boldness?: string
          tone_length_preference?: string
          approved_artifacts?: Json
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
      artifact_status: DbArtifactStatus
      worker_type: DbWorkerType
    }
    CompositeTypes: Record<string, never>
  }
}
