export interface Tool {
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
  user_rating?: number | null
  average_rating?: number
  user_notes?: string | null
  // OpenGraph metadata fields
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  og_site_name?: string | null
  og_last_fetched?: string | null
  favicon_url?: string | null
}

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "contributor" | "viewer"
  created_at: string
  updated_at: string
}

export interface UserTool {
  id: string
  user_id: string
  tool_id: string
  personal_notes: string | null
  rating: number | null
  created_at: string
  updated_at: string
}

export interface EmbedConfiguration {
  id: string
  name: string
  visible_columns: string[]
  filters: Record<string, any>
  sort_order: { field: string; direction: "asc" | "desc" }
  created_by: string | null
  created_at: string
  updated_at: string
}

export const CATEGORIES = [
  "AI Writing",
  "Development",
  "Analytics",
  "Design",
  "Productivity",
  "Customer Support",
  "Marketing",
  "Data Processing",
  "Other",
] as const

export const PRICING_MODELS = ["free", "freemium", "paid", "enterprise"] as const

export const TOOL_STATUS = ["active", "inactive", "trial"] as const
