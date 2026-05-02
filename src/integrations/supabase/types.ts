export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          completed: boolean
          created_at: string
          deadline: string | null
          id: string
          priority: string
          subject: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          deadline?: string | null
          id?: string
          priority?: string
          subject?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          deadline?: string | null
          id?: string
          priority?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          display_name: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["credit_tx_kind"]
          reason: string | null
          reference_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["credit_tx_kind"]
          reason?: string | null
          reference_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["credit_tx_kind"]
          reason?: string | null
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lost_found: {
        Row: {
          contact: string
          created_at: string
          description: string
          id: string
          location: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          contact?: string
          created_at?: string
          description?: string
          id?: string
          location?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          contact?: string
          created_at?: string
          description?: string
          id?: string
          location?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          subject: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          subject?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          cost_at_purchase: number
          created_at: string
          id: string
          notes: string | null
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_at_purchase: number
          created_at?: string
          id?: string
          notes?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_at_purchase?: number
          created_at?: string
          id?: string
          notes?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          category: string
          cost: number
          created_at: string
          created_by: string | null
          description: string
          id: string
          image_url: string | null
          stock: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          cost: number
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          stock?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          cost?: number
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          stock?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_exchange: {
        Row: {
          contact: string
          created_at: string
          display_name: string
          id: string
          skill_offer: string
          skill_wanted: string
          user_id: string
        }
        Insert: {
          contact?: string
          created_at?: string
          display_name?: string
          id?: string
          skill_offer: string
          skill_wanted: string
          user_id: string
        }
        Update: {
          contact?: string
          created_at?: string
          display_name?: string
          id?: string
          skill_offer?: string
          skill_wanted?: string
          user_id?: string
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_daily_grant: string | null
          lifetime_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_daily_grant?: string | null
          lifetime_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_daily_grant?: string | null
          lifetime_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_credits: {
        Args: {
          _amount: number
          _kind: Database["public"]["Enums"]["credit_tx_kind"]
          _reason?: string
          _reference_id?: string
          _user_id: string
        }
        Returns: {
          balance: number
          created_at: string
          id: string
          last_daily_grant: string | null
          lifetime_earned: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_daily_credits: {
        Args: never
        Returns: {
          balance: number
          created_at: string
          id: string
          last_daily_grant: string | null
          lifetime_earned: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_reward: {
        Args: { _reward_id: string }
        Returns: {
          cost_at_purchase: number
          created_at: string
          id: string
          notes: string | null
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "redemptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      credit_tx_kind:
        | "signup_bonus"
        | "daily_login"
        | "task_completed"
        | "admin_grant"
        | "purchase"
        | "redemption"
        | "adjustment"
      redemption_status: "pending" | "fulfilled" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      credit_tx_kind: [
        "signup_bonus",
        "daily_login",
        "task_completed",
        "admin_grant",
        "purchase",
        "redemption",
        "adjustment",
      ],
      redemption_status: ["pending", "fulfilled", "cancelled"],
    },
  },
} as const
