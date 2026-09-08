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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          extra_units: number
          factory_id: string | null
          id: string
          status: string
          work_date: string
          worker_id: string
        }
        Insert: {
          extra_units?: number
          factory_id?: string | null
          id?: string
          status: string
          work_date: string
          worker_id: string
        }
        Update: {
          extra_units?: number
          factory_id?: string | null
          id?: string
          status?: string
          work_date?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      cheques: {
        Row: {
          due_date: string
          factory_id: string | null
          id: string
          payment_id: string
          status: string
        }
        Insert: {
          due_date: string
          factory_id?: string | null
          id?: string
          payment_id: string
          status?: string
        }
        Update: {
          due_date?: string
          factory_id?: string | null
          id?: string
          payment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cheques_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          credit_days: number
          factory_id: string | null
          id: string
          name: string
          phone: string | null
          price_tier: string | null
          type: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          credit_days?: number
          factory_id?: string | null
          id?: string
          name: string
          phone?: string | null
          price_tier?: string | null
          type: string
        }
        Update: {
          address?: string | null
          created_at?: string
          credit_days?: number
          factory_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          price_tier?: string | null
          type?: string
        }
        Relationships: []
      }
      invoice_sequences: {
        Row: {
          last_value: number
          year: number
        }
        Insert: {
          last_value?: number
          year: number
        }
        Update: {
          last_value?: number
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          balance_due: number
          created_at: string
          due_date: string | null
          factory_id: string | null
          id: string
          invoice_number: string
          order_id: string
          total: number
        }
        Insert: {
          balance_due: number
          created_at?: string
          due_date?: string | null
          factory_id?: string | null
          id?: string
          invoice_number: string
          order_id: string
          total: number
        }
        Update: {
          balance_due?: number
          created_at?: string
          due_date?: string | null
          factory_id?: string | null
          id?: string
          invoice_number?: string
          order_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      material_movements: {
        Row: {
          created_at: string
          direction: string
          factory_id: string | null
          id: string
          is_return: boolean
          material_id: string
          order_id: string | null
          qty: number
          supplier_id: string | null
        }
        Insert: {
          created_at?: string
          direction: string
          factory_id?: string | null
          id?: string
          is_return?: boolean
          material_id: string
          order_id?: string | null
          qty: number
          supplier_id?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          factory_id?: string | null
          id?: string
          is_return?: boolean
          material_id?: string
          order_id?: string | null
          qty?: number
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          factory_id: string | null
          id: string
          min_threshold: number
          stock_qty: number
          type: string
          unit: string
        }
        Insert: {
          factory_id?: string | null
          id?: string
          min_threshold?: number
          stock_qty?: number
          type: string
          unit: string
        }
        Update: {
          factory_id?: string | null
          id?: string
          min_threshold?: number
          stock_qty?: number
          type?: string
          unit?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client_id: string
          created_at: string
          factory_id: string | null
          id: string
          product_spec: Json
          quantity: number
          quotation_id: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          factory_id?: string | null
          id?: string
          product_spec?: Json
          quantity?: number
          quotation_id?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          factory_id?: string | null
          id?: string
          product_spec?: Json
          quantity?: number
          quotation_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          factory_id: string | null
          id: string
          invoice_id: string
          method: string
          paid_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          factory_id?: string | null
          id?: string
          invoice_id: string
          method: string
          paid_at: string
        }
        Update: {
          amount?: number
          created_at?: string
          factory_id?: string | null
          id?: string
          invoice_id?: string
          method?: string
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_id: string | null
          converted_order_id: string | null
          created_at: string
          details: string | null
          factory_id: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          pdf_url: string | null
          status: string
        }
        Insert: {
          client_id?: string | null
          converted_order_id?: string | null
          created_at?: string
          details?: string | null
          factory_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          pdf_url?: string | null
          status?: string
        }
        Update: {
          client_id?: string | null
          converted_order_id?: string | null
          created_at?: string
          details?: string | null
          factory_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          pdf_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_transactions: {
        Row: {
          amount: number
          created_at: string
          factory_id: string | null
          id: string
          supplier_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          factory_id?: string | null
          id?: string
          supplier_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          factory_id?: string | null
          id?: string
          supplier_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          balance: number
          factory_id: string | null
          id: string
          name: string
        }
        Insert: {
          balance?: number
          factory_id?: string | null
          id?: string
          name: string
        }
        Update: {
          balance?: number
          factory_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      worker_transactions: {
        Row: {
          amount: number
          created_at: string
          factory_id: string | null
          id: string
          type: string
          worker_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          factory_id?: string | null
          id?: string
          type: string
          worker_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          factory_id?: string | null
          id?: string
          type?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_transactions_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          daily_wage: number
          factory_id: string | null
          id: string
          name: string
        }
        Insert: {
          daily_wage: number
          factory_id?: string | null
          id?: string
          name: string
        }
        Update: {
          daily_wage?: number
          factory_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_direct_invoice_atomic: {
        Args: {
          p_client_id: string
          p_client_name: string
          p_client_phone: string
          p_client_type: string
          p_paid_amount: number
          p_product_spec?: Json
          p_quantity: number
          p_total: number
        }
        Returns: string
      }
      create_invoice_atomic: {
        Args: { p_credit_days: number; p_order_id: string; p_total: number }
        Returns: string
      }
      record_material_movement: {
        Args: {
          p_direction: string
          p_is_return?: boolean
          p_material_id: string
          p_order_id?: string
          p_qty: number
          p_supplier_id?: string
        }
        Returns: string
      }
      record_payment_atomic: {
        Args: {
          p_amount: number
          p_cheque_due_date?: string
          p_invoice_id: string
          p_method: string
        }
        Returns: string
      }
      record_supplier_transaction: {
        Args: { p_amount: number; p_supplier_id: string; p_type: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
