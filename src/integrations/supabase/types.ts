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
      assets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          ownership_percentage: number | null
          type: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          ownership_percentage?: number | null
          type: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          ownership_percentage?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      business_info: {
        Row: {
          annual_revenue: number | null
          business_name: string
          business_type: string
          city: string | null
          country: string | null
          created_at: string | null
          employee_count: number | null
          id: string
          include_in_statements: boolean | null
          state: string | null
          street_address: string | null
          suite: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
          year_established: number | null
          zip_code: string | null
        }
        Insert: {
          annual_revenue?: number | null
          business_name: string
          business_type: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          employee_count?: number | null
          id?: string
          include_in_statements?: boolean | null
          state?: string | null
          street_address?: string | null
          suite?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
          year_established?: number | null
          zip_code?: string | null
        }
        Update: {
          annual_revenue?: number | null
          business_name?: string
          business_type?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          employee_count?: number | null
          id?: string
          include_in_statements?: boolean | null
          state?: string | null
          street_address?: string | null
          suite?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
          year_established?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          frequency: string
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          frequency: string
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          frequency?: string
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      income: {
        Row: {
          amount: number
          created_at: string | null
          frequency: string
          id: string
          source: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          frequency: string
          id?: string
          source: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          frequency?: string
          id?: string
          source?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      liabilities: {
        Row: {
          amount: number
          associated_asset_id: string | null
          created_at: string | null
          id: string
          interest_rate: number | null
          name: string
          ownership_percentage: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          associated_asset_id?: string | null
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          name: string
          ownership_percentage?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          associated_asset_id?: string | null
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          name?: string
          ownership_percentage?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liabilities_associated_asset_id_fkey"
            columns: ["associated_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_info: {
        Row: {
          address: string | null
          annual_income: number | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          occupation: string | null
          phone: string | null
          profile_image: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          annual_income?: number | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          occupation?: string | null
          phone?: string | null
          profile_image?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          annual_income?: number | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          occupation?: string | null
          phone?: string | null
          profile_image?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string | null
          plan: string
          role: string
          status: string
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          name?: string | null
          plan?: string
          role?: string
          status?: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string | null
          plan?: string
          role?: string
          status?: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
