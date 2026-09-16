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
      delivery_notes: {
        Row: { id: string; note_number: number; delivery_date: string; customer_name: string; recipient_name: string; recipient_phone: string; delivery_address: string; driver_name: string; vehicle_number: string; notes: string; items: Json; created_at: string; created_by: string }
        Insert: { id?: string; delivery_date: string; customer_name: string; recipient_name: string; recipient_phone?: string; delivery_address?: string; driver_name?: string; vehicle_number?: string; notes?: string; items: Json }
        Update: never
        Relationships: []
      }
      integration_status: {Row:{name:string;last_success:string|null;last_error:string|null;details:Json};Insert:{name:string;last_success?:string|null;last_error?:string|null;details?:Json};Update:{name?:string;last_success?:string|null;last_error?:string|null;details?:Json};Relationships:[]};
      sync_events: {Row:{id:string;table_name:string;created_at:string};Insert:{id?:string;table_name:string;created_at?:string};Update:{id?:string;table_name?:string;created_at?:string};Relationships:[]};
      user_access: { Row:{user_id:string;email:string;role:string;permissions:string[];active:boolean;created_at:string}; Insert:{user_id:string;email:string;role?:string;permissions?:string[];active?:boolean}; Update:{role?:string;permissions?:string[];active?:boolean}; Relationships:[] }
      access_audit: { Row:{id:string;user_id:string;changed_by:string|null;changed_at:string;old_value:Json|null;new_value:Json|null}; Insert:never;Update:never;Relationships:[] }

      attendance: {
        Row: {
          extra_type: string
          extra_units: number
          factory_id: string | null
          id: string
          status: string
          work_date: string
          worker_id: string
        }
        Insert: {
          extra_type?: string
          extra_units?: number
          factory_id?: string | null
          id?: string
          status: string
          work_date: string
          worker_id: string
        }
        Update: {
          extra_type?: string
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
      sales_returns: {
        Row: { voided_at: string | null; voided_reason: string | null; id: string; factory_id: string | null; invoice_id: string; amount: number; condition: string; note: string | null; created_at: string }
        Insert: { voided_at?: string | null; voided_reason?: string | null; id?: string; factory_id?: string | null; invoice_id: string; amount: number; condition: string; note?: string | null; created_at?: string }
        Update: { voided_at?: string | null; voided_reason?: string | null; id?: string; factory_id?: string | null; invoice_id?: string; amount?: number; condition?: string; note?: string | null; created_at?: string }
        Relationships: [{ foreignKeyName: "sales_returns_invoice_id_fkey"; columns: ["invoice_id"]; isOneToOne: false; referencedRelation: "invoices"; referencedColumns: ["id"] }]
      }
      invoices: {
        Row: {
          created_at: string
          due_date: string | null
          factory_id: string | null
          id: string
          invoice_number: string
          order_id: string
          total: number
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          factory_id?: string | null
          id?: string
          invoice_number: string
          order_id: string
          total: number
        }
        Update: {
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
            isOneToOne: true
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
      product_specs: {
        Row: { id: string; factory_id: string | null; name: string; active: boolean }
        Insert: { id?: string; factory_id?: string | null; name: string; active?: boolean }
        Update: { id?: string; factory_id?: string | null; name?: string; active?: boolean }
        Relationships: []
      }
      product_spec_materials: {
        Row: { spec_id: string; material_id: string; qty_per_unit: number }
        Insert: { spec_id: string; material_id: string; qty_per_unit: number }
        Update: { spec_id?: string; material_id?: string; qty_per_unit?: number }
        Relationships: [
          { foreignKeyName: "product_spec_materials_spec_id_fkey"; columns: ["spec_id"]; isOneToOne: false; referencedRelation: "product_specs"; referencedColumns: ["id"] },
          { foreignKeyName: "product_spec_materials_material_id_fkey"; columns: ["material_id"]; isOneToOne: false; referencedRelation: "materials"; referencedColumns: ["id"] }
        ]
      }
      orders: {
        Row: {
          product_spec_id: string | null
          material_requirements: Json
          material_overrides: Json
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
          product_spec_id?: string | null
          material_requirements?: Json
          material_overrides?: Json
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
          product_spec_id?: string | null
          material_requirements?: Json
          material_overrides?: Json
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
            foreignKeyName: "orders_product_spec_id_fkey"
            columns: ["product_spec_id"]
            isOneToOne: false
            referencedRelation: "product_specs"
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
          parsed_items: Json
          share_token: string
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
          parsed_items?: Json
          share_token?: string
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
          parsed_items?: Json
          share_token?: string
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
          opening_balance: number
          factory_id: string | null
          id: string
          name: string
        }
        Insert: {
          opening_balance?: number
          factory_id?: string | null
          id?: string
          name: string
        }
        Update: {
          opening_balance?: number
          factory_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      worker_payouts: {
        Row: { voided_at: string | null; voided_reason: string | null; id: string; factory_id: string | null; worker_id: string; week_start: string; week_end: string; days_present: number; daily_wage: number; attendance_bonus: number; transaction_bonus: number; advances: number; deductions: number; net_amount: number; paid_at: string }
        Insert: { voided_at?: string | null; voided_reason?: string | null; id?: string; worker_id: string; week_start: string; factory_id?: string | null; week_end?: string; days_present?: number; daily_wage?: number; attendance_bonus?: number; transaction_bonus?: number; advances?: number; deductions?: number; net_amount?: number; paid_at?: string }
        Update: { voided_at?: string | null; voided_reason?: string | null; worker_id?: string; week_start?: string }
        Relationships: [{ foreignKeyName: "worker_payouts_worker_id_fkey"; columns: ["worker_id"]; isOneToOne: false; referencedRelation: "workers"; referencedColumns: ["id"] }]
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
      supplier_balances:{Row:{id:string;factory_id:string|null;name:string;opening_balance:number;balance:number};Relationships:[]}
      supplier_directory:{Row:{id:string;name:string};Relationships:[]}
      worker_directory:{Row:{id:string;name:string};Relationships:[]}
      attendance_status:{Row:{id:string;worker_id:string;work_date:string;status:string;extra_units:number;extra_type:string;worker_name:string;week_paid:boolean};Relationships:[]}

      invoice_balances: {
        Row: { id: string; factory_id: string | null; order_id: string; invoice_number: string; total: number; created_at: string; due_date: string | null; client_id: string; quantity: number; client_name: string; client_type: string; paid_amount: number; returned_amount: number; balance_due: number }
        Relationships: []
      }
    }
    Functions: {
      get_weekly_payroll: { Args: { p_week_start: string; p_search?: string }; Returns: Json }
      pay_workers_week: { Args: { p_worker_ids: string[]; p_week_start: string }; Returns: number }
      calculate_worker_week: { Args: { p_worker_id: string; p_week_start: string }; Returns: { worker_id: string; worker_name: string; factory_id: string | null; daily_wage: number; days_present: number; attendance_bonus: number; transaction_bonus: number; advances: number; deductions: number; net_amount: number }[] }
      save_product_spec: { Args: { p_id: string | null; p_name: string; p_active: boolean; p_lines: Json }; Returns: string }
      get_client_statement: { Args: { p_client_id: string }; Returns: Json }
      record_sales_return: { Args: { p_invoice_id: string; p_amount: number; p_condition: string; p_note?: string }; Returns: string }

      create_direct_invoice_atomic: {
        Args: {
          p_client_id: string | null
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
