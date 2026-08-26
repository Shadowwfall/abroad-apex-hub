export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.17";
  };
  public: {
    Tables: {
      application_stage_history: {
        Row: {
          application_id: string;
          changed_at: string | null;
          changed_by: string | null;
          from_stage: string | null;
          id: string;
          to_stage: string;
        };
        Insert: {
          application_id: string;
          changed_at?: string | null;
          changed_by?: string | null;
          from_stage?: string | null;
          id?: string;
          to_stage: string;
        };
        Update: {
          application_id?: string;
          changed_at?: string | null;
          changed_by?: string | null;
          from_stage?: string | null;
          id?: string;
          to_stage?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_stage_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_stage_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          created_at: string | null;
          decision: string | null;
          decision_at: string | null;
          destination_id: string | null;
          id: string;
          stage: string;
          student_id: string;
          submitted_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          decision?: string | null;
          decision_at?: string | null;
          destination_id?: string | null;
          id?: string;
          stage?: string;
          student_id: string;
          submitted_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          decision?: string | null;
          decision_at?: string | null;
          destination_id?: string | null;
          id?: string;
          stage?: string;
          student_id?: string;
          submitted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "applications_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "student_destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          branch_id: string | null;
          created_at: string | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          meta: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          branch_id?: string | null;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          meta?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          branch_id?: string | null;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          meta?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_log_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      branches: {
        Row: {
          address: string | null;
          city: string;
          created_at: string | null;
          id: string;
          name: string;
          phone: string | null;
          status: string;
        };
        Insert: {
          address?: string | null;
          city: string;
          created_at?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          status?: string;
        };
        Update: {
          address?: string | null;
          city?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      checklist_templates: {
        Row: {
          country: string;
          created_at: string | null;
          id: string;
          kind: string;
          label: string;
          note: string | null;
          optional: boolean | null;
          sort_order: number | null;
          visa_name: string | null;
        };
        Insert: {
          country: string;
          created_at?: string | null;
          id?: string;
          kind: string;
          label: string;
          note?: string | null;
          optional?: boolean | null;
          sort_order?: number | null;
          visa_name?: string | null;
        };
        Update: {
          country?: string;
          created_at?: string | null;
          id?: string;
          kind?: string;
          label?: string;
          note?: string | null;
          optional?: boolean | null;
          sort_order?: number | null;
          visa_name?: string | null;
        };
        Relationships: [];
      };
      deadlines: {
        Row: {
          completed: boolean;
          created_at: string | null;
          destination_id: string | null;
          due_at: string;
          id: string;
          student_id: string | null;
          title: string;
        };
        Insert: {
          completed?: boolean;
          created_at?: string | null;
          destination_id?: string | null;
          due_at: string;
          id?: string;
          student_id?: string | null;
          title: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string | null;
          destination_id?: string | null;
          due_at?: string;
          id?: string;
          student_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deadlines_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "student_destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deadlines_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          checklist_item_id: string | null;
          destination_id: string | null;
          id: string;
          mime: string | null;
          name: string;
          remark: string | null;
          reviewer_id: string | null;
          size_bytes: number | null;
          status: string;
          storage_key: string;
          student_id: string;
          uploaded_at: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          checklist_item_id?: string | null;
          destination_id?: string | null;
          id?: string;
          mime?: string | null;
          name: string;
          remark?: string | null;
          reviewer_id?: string | null;
          size_bytes?: number | null;
          status?: string;
          storage_key: string;
          student_id: string;
          uploaded_at?: string | null;
          uploaded_by?: string | null;
        };
        Update: {
          checklist_item_id?: string | null;
          destination_id?: string | null;
          id?: string;
          mime?: string | null;
          name?: string;
          remark?: string | null;
          reviewer_id?: string | null;
          size_bytes?: number | null;
          status?: string;
          storage_key?: string;
          student_id?: string;
          uploaded_at?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_checklist_item_id_fkey";
            columns: ["checklist_item_id"];
            isOneToOne: false;
            referencedRelation: "student_checklist_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "student_destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      fee_templates: {
        Row: {
          active: boolean;
          amount: number;
          created_at: string | null;
          currency: string;
          id: string;
          name: string;
        };
        Insert: {
          active?: boolean;
          amount: number;
          created_at?: string | null;
          currency?: string;
          id?: string;
          name: string;
        };
        Update: {
          active?: boolean;
          amount?: number;
          created_at?: string | null;
          currency?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      forms: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          owner_id: string | null;
          progress: number;
          status: string;
          student_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          owner_id?: string | null;
          progress?: number;
          status?: string;
          student_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          owner_id?: string | null;
          progress?: number;
          status?: string;
          student_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "forms_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "forms_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_notes: {
        Row: {
          author_id: string;
          body: string;
          created_at: string | null;
          id: string;
          lead_id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string | null;
          id?: string;
          lead_id: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string | null;
          id?: string;
          lead_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_notes_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          assigned_to: string | null;
          branch_id: string | null;
          code: string;
          converted_student_id: string | null;
          country: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          priority: string | null;
          program: string | null;
          source: string | null;
          status: string;
        };
        Insert: {
          assigned_to?: string | null;
          branch_id?: string | null;
          code?: string;
          converted_student_id?: string | null;
          country?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          priority?: string | null;
          program?: string | null;
          source?: string | null;
          status?: string;
        };
        Update: {
          assigned_to?: string | null;
          branch_id?: string | null;
          code?: string;
          converted_student_id?: string | null;
          country?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          priority?: string | null;
          program?: string | null;
          source?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_converted_student_id_fkey";
            columns: ["converted_student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_prefs: {
        Row: {
          deadline_reminder: boolean;
          new_lead_email: boolean;
          payment_digest: boolean;
          updated_at: string | null;
          user_id: string;
          visa_alerts: boolean;
        };
        Insert: {
          deadline_reminder?: boolean;
          new_lead_email?: boolean;
          payment_digest?: boolean;
          updated_at?: string | null;
          user_id: string;
          visa_alerts?: boolean;
        };
        Update: {
          deadline_reminder?: boolean;
          new_lead_email?: boolean;
          payment_digest?: boolean;
          updated_at?: string | null;
          user_id?: string;
          visa_alerts?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notification_prefs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          payload: Json | null;
          read_at: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          payload?: Json | null;
          read_at?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          payload?: Json | null;
          read_at?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      org_settings: {
        Row: {
          base_currency: string | null;
          head_office: string | null;
          id: string;
          name: string;
          support_email: string | null;
          updated_at: string | null;
        };
        Insert: {
          base_currency?: string | null;
          head_office?: string | null;
          id?: string;
          name?: string;
          support_email?: string | null;
          updated_at?: string | null;
        };
        Update: {
          base_currency?: string | null;
          head_office?: string | null;
          id?: string;
          name?: string;
          support_email?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      payment_refunds: {
        Row: {
          amount: number;
          created_at: string | null;
          created_by: string | null;
          id: string;
          payment_id: string;
          reason: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          payment_id: string;
          reason?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          payment_id?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_refunds_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_refunds_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string | null;
          created_by: string | null;
          currency: string;
          exchange_rate: number | null;
          id: string;
          mode: string | null;
          paid: number;
          paid_on: string | null;
          receipt_no: string;
          reference: string | null;
          status: string;
          student_id: string;
          type: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string;
          exchange_rate?: number | null;
          id?: string;
          mode?: string | null;
          paid?: number;
          paid_on?: string | null;
          receipt_no?: string;
          reference?: string | null;
          status?: string;
          student_id: string;
          type: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string;
          exchange_rate?: number | null;
          id?: string;
          mode?: string | null;
          paid?: number;
          paid_on?: string | null;
          receipt_no?: string;
          reference?: string | null;
          status?: string;
          student_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_branches: {
        Row: {
          branch_id: string;
          created_at: string | null;
          user_id: string;
        };
        Insert: {
          branch_id: string;
          created_at?: string | null;
          user_id: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_branches_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      student_checklist_items: {
        Row: {
          destination_id: string;
          document_id: string | null;
          id: string;
          kind: string;
          label: string;
          note: string | null;
          optional: boolean | null;
          source: string | null;
          status: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          destination_id: string;
          document_id?: string | null;
          id?: string;
          kind: string;
          label: string;
          note?: string | null;
          optional?: boolean | null;
          source?: string | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          destination_id?: string;
          document_id?: string | null;
          id?: string;
          kind?: string;
          label?: string;
          note?: string | null;
          optional?: boolean | null;
          source?: string | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_checklist_items_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "student_destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_checklist_items_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      student_destinations: {
        Row: {
          application_status: string | null;
          country: string;
          course: string | null;
          created_at: string | null;
          id: string;
          intake: string | null;
          student_id: string;
          university: string | null;
          visa_status: string | null;
        };
        Insert: {
          application_status?: string | null;
          country: string;
          course?: string | null;
          created_at?: string | null;
          id?: string;
          intake?: string | null;
          student_id: string;
          university?: string | null;
          visa_status?: string | null;
        };
        Update: {
          application_status?: string | null;
          country?: string;
          course?: string | null;
          created_at?: string | null;
          id?: string;
          intake?: string | null;
          student_id?: string;
          university?: string | null;
          visa_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_destinations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          address: string | null;
          branch_id: string;
          code: string;
          counsellor_id: string | null;
          created_at: string | null;
          deleted_at: string | null;
          dob: string | null;
          email: string | null;
          english_test: string | null;
          gender: string | null;
          id: string;
          name: string;
          passport_expiry: string | null;
          passport_no: string | null;
          phone: string | null;
          preferred_intake: string | null;
          qualification: string | null;
          score: string | null;
          status: string;
          work_experience: string | null;
        };
        Insert: {
          address?: string | null;
          branch_id: string;
          code?: string;
          counsellor_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          dob?: string | null;
          email?: string | null;
          english_test?: string | null;
          gender?: string | null;
          id?: string;
          name: string;
          passport_expiry?: string | null;
          passport_no?: string | null;
          phone?: string | null;
          preferred_intake?: string | null;
          qualification?: string | null;
          score?: string | null;
          status?: string;
          work_experience?: string | null;
        };
        Update: {
          address?: string | null;
          branch_id?: string;
          code?: string;
          counsellor_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          dob?: string | null;
          email?: string | null;
          english_test?: string | null;
          gender?: string | null;
          id?: string;
          name?: string;
          passport_expiry?: string | null;
          passport_no?: string | null;
          phone?: string | null;
          preferred_intake?: string | null;
          qualification?: string | null;
          score?: string | null;
          status?: string;
          work_experience?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "students_counsellor_id_fkey";
            columns: ["counsellor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          assignee_id: string | null;
          created_at: string | null;
          done: boolean;
          done_at: string | null;
          due_at: string | null;
          id: string;
          label: string;
          student_id: string | null;
          tag: string | null;
        };
        Insert: {
          assignee_id?: string | null;
          created_at?: string | null;
          done?: boolean;
          done_at?: string | null;
          due_at?: string | null;
          id?: string;
          label: string;
          student_id?: string | null;
          tag?: string | null;
        };
        Update: {
          assignee_id?: string | null;
          created_at?: string | null;
          done?: boolean;
          done_at?: string | null;
          due_at?: string | null;
          id?: string;
          label?: string;
          student_id?: string | null;
          tag?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          active: boolean;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          phone: string | null;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          email: string;
          id: string;
          name: string;
          phone?: string | null;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_branch_access: {
        Args: { check_branch_id: string; check_user_id: string };
        Returns: boolean;
      };
      is_super_admin: { Args: { check_user_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
