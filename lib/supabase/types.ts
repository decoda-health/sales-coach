export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      calls: {
        Row: {
          call_id: string;
          title: string;
          rep_id: string;
          rep_name: string;
          start_time_iso: string;
          duration_sec: number;
          fathom_url: string;
          synced_at_iso: string;
          created_at: string;
        };
        Insert: {
          call_id: string;
          title: string;
          rep_id: string;
          rep_name: string;
          start_time_iso: string;
          duration_sec: number;
          fathom_url: string;
          synced_at_iso?: string;
          created_at?: string;
        };
        Update: {
          call_id?: string;
          title?: string;
          rep_id?: string;
          rep_name?: string;
          start_time_iso?: string;
          duration_sec?: number;
          fathom_url?: string;
          synced_at_iso?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      coaching: {
        Row: {
          call_id: string;
          rep_id: string;
          coached_at_iso: string;
          scores: Json;
          strengths: Json;
          improvements: Json;
          objections: Json;
          evidence: Json;
          coach_summary_md: string;
          version: string;
          created_at: string;
        };
        Insert: {
          call_id: string;
          rep_id: string;
          coached_at_iso?: string;
          scores?: Json;
          strengths?: Json;
          improvements?: Json;
          objections?: Json;
          evidence?: Json;
          coach_summary_md?: string;
          version?: string;
          created_at?: string;
        };
        Update: {
          call_id?: string;
          rep_id?: string;
          coached_at_iso?: string;
          scores?: Json;
          strengths?: Json;
          improvements?: Json;
          objections?: Json;
          evidence?: Json;
          coach_summary_md?: string;
          version?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coaching_call_id_fkey";
            columns: ["call_id"];
            referencedRelation: "calls";
            referencedColumns: ["call_id"];
          }
        ];
      };
      rep_ledger: {
        Row: {
          rep_id: string;
          skill_id: string;
          rolling_score_10: number;
          prev_rolling_score_10: number;
          trend_delta: number;
          last_updated_iso: string;
          open_focus_area: boolean;
        };
        Insert: {
          rep_id: string;
          skill_id: string;
          rolling_score_10?: number;
          prev_rolling_score_10?: number;
          trend_delta?: number;
          last_updated_iso?: string;
          open_focus_area?: boolean;
        };
        Update: {
          rep_id?: string;
          skill_id?: string;
          rolling_score_10?: number;
          prev_rolling_score_10?: number;
          trend_delta?: number;
          last_updated_iso?: string;
          open_focus_area?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

// Helper types for accessing row types
export type CallRow = Database["public"]["Tables"]["calls"]["Row"];
export type CoachingRow = Database["public"]["Tables"]["coaching"]["Row"];
export type RepLedgerRow = Database["public"]["Tables"]["rep_ledger"]["Row"];
