import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a more robust mock client if environment variables are not available
const createMockClient = () => ({
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: function (column: string, value: any) {
        return this
      },
      order: function (column: string, options?: any) {
        return this
      },
      then: (callback: any) => callback({ data: [], error: null }),
    }),
    insert: (data: any) => ({
      then: (callback: any) => {
        console.log(`Mock insert into ${table}:`, data)
        callback({ data: null, error: null })
        return Promise.resolve({ data: null, error: null })
      },
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: (callback: any) => {
          console.log(`Mock update in ${table}:`, data)
          callback({ data: null, error: null })
          return Promise.resolve({ data: null, error: null })
        },
      }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: (callback: any) => {
          console.log(`Mock delete from ${table}`)
          callback({ data: null, error: null })
          return Promise.resolve({ data: null, error: null })
        },
      }),
    }),
  }),
})

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createMockClient()

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Mock data for when Supabase is not configured
export const mockTools = [
  {
    id: "1",
    name: "ChatGPT",
    url: "https://chat.openai.com",
    category: "AI Writing",
    description: "Advanced AI language model for text generation, editing, and conversation.",
    use_cases: "Content creation, code assistance, brainstorming, customer support",
    pricing_model: "freemium" as const,
    cost_per_month: 20.0,
    status: "active" as const,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    average_rating: 4.8,
  },
  {
    id: "2",
    name: "GitHub Copilot",
    url: "https://github.com/features/copilot",
    category: "Development",
    description: "AI-powered code completion and generation tool integrated with IDEs.",
    use_cases: "Code completion, function generation, debugging assistance",
    pricing_model: "paid" as const,
    cost_per_month: 10.0,
    status: "active" as const,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    average_rating: 4.5,
  },
  {
    id: "3",
    name: "Midjourney",
    url: "https://midjourney.com",
    category: "Design",
    description: "AI image generation tool for creating artwork and visual content.",
    use_cases: "Marketing materials, concept art, social media graphics",
    pricing_model: "paid" as const,
    cost_per_month: 30.0,
    status: "active" as const,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    average_rating: 4.2,
  },
  {
    id: "4",
    name: "Notion AI",
    url: "https://notion.so",
    category: "Productivity",
    description: "AI-powered writing assistant integrated into Notion workspace.",
    use_cases: "Document writing, summarization, brainstorming, task management",
    pricing_model: "freemium" as const,
    cost_per_month: 8.0,
    status: "active" as const,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    average_rating: 4.0,
  },
  {
    id: "5",
    name: "Grammarly",
    url: "https://grammarly.com",
    category: "AI Writing",
    description: "AI-powered writing assistant for grammar, style, and tone improvement.",
    use_cases: "Email writing, document editing, content review",
    pricing_model: "freemium" as const,
    cost_per_month: 12.0,
    status: "active" as const,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    average_rating: 4.3,
  },
]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "admin" | "contributor" | "viewer"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: "admin" | "contributor" | "viewer"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: "admin" | "contributor" | "viewer"
          created_at?: string
          updated_at?: string
        }
      }
      tools: {
        Row: {
          id: string
          name: string
          url: string
          category: string | null
          description: string | null
          use_cases: string | null
          pricing_model: "free" | "freemium" | "paid" | "enterprise" | null
          cost_per_month: number | null
          status: "active" | "inactive" | "trial"
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          category?: string | null
          description?: string | null
          use_cases?: string | null
          pricing_model?: "free" | "freemium" | "paid" | "enterprise" | null
          cost_per_month?: number | null
          status?: "active" | "inactive" | "trial"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          category?: string | null
          description?: string | null
          use_cases?: string | null
          pricing_model?: "free" | "freemium" | "paid" | "enterprise" | null
          cost_per_month?: number | null
          status?: "active" | "inactive" | "trial"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_tools: {
        Row: {
          id: string
          user_id: string
          tool_id: string
          personal_notes: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_id: string
          personal_notes?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_id?: string
          personal_notes?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      embed_configurations: {
        Row: {
          id: string
          name: string
          visible_columns: any
          filters: any
          sort_order: any
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          visible_columns?: any
          filters?: any
          sort_order?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          visible_columns?: any
          filters?: any
          sort_order?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
