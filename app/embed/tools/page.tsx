"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { supabase, isSupabaseConfigured, mockTools } from "@/lib/supabase"
import type { Tool } from "@/lib/types"

export default function EmbedToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const columns = searchParams.get("columns")?.split(",") || ["name", "category", "description"]
  const categoryFilter = searchParams.get("category") || ""
  const statusFilter = searchParams.get("status") || ""
  const sortField = searchParams.get("sort") || "name"
  const sortDirection = searchParams.get("direction") || "asc"

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    try {
      if (!isSupabaseConfigured) {
        // Use mock data and apply client-side filtering
        let filtered = mockTools

        if (categoryFilter) {
          filtered = filtered.filter((tool) => tool.category === categoryFilter)
        }
        if (statusFilter) {
          filtered = filtered.filter((tool) => tool.status === statusFilter)
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue = a[sortField as keyof typeof a]
          let bValue = b[sortField as keyof typeof a]

          if (typeof aValue === "string") aValue = aValue.toLowerCase()
          if (typeof bValue === "string") bValue = bValue.toLowerCase()

          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
          return 0
        })

        setTools(filtered)
        return
      }

      // Build query without relationships
      let query = supabase.from("tools").select("*")

      // Apply filters
      if (categoryFilter) {
        query = query.eq("category", categoryFilter)
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter)
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === "asc" })

      const { data: toolsData, error: toolsError } = await query

      if (toolsError) {
        console.error("Supabase error:", toolsError)
        setTools(mockTools)
        return
      }

      // Try to fetch ratings separately (optional)
      let ratingsData: any[] = []
      try {
        const { data, error } = await supabase.from("user_tools").select("tool_id, rating")

        if (!error && data) {
          ratingsData = data
        }
      } catch (ratingsError) {
        console.log("User ratings not available:", ratingsError)
      }

      // Combine tools with ratings
      const toolsWithRatings = toolsData.map((tool) => {
        const toolRatings = ratingsData.filter((r) => r.tool_id === tool.id)
        const average_rating =
          toolRatings.length > 0 ? toolRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / toolRatings.length : null

        return {
          ...tool,
          average_rating,
        }
      })

      setTools(toolsWithRatings)
    } catch (error) {
      console.error("Error fetching tools:", error)
      setTools(mockTools)
    } finally {
      setLoading(false)
    }
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "free":
        return "bg-green-100 text-green-800"
      case "freemium":
        return "bg-blue-100 text-blue-800"
      case "paid":
        return "bg-orange-100 text-orange-800"
      case "enterprise":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className={`w-3 h-3 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
            ★
          </div>
        ))}
        <span className="text-xs text-stone-gray ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const getColumnLabel = (columnId: string) => {
    const labels: Record<string, string> = {
      name: "Tool Name",
      url: "URL",
      category: "Category",
      description: "Description",
      use_cases: "Use Cases",
      pricing_model: "Pricing Model",
      average_rating: "Rating",
    }
    return labels[columnId] || columnId
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-poppy-red mx-auto mb-4"></div>
        <p className="text-stone-gray">Loading tools...</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-stone-gray mb-2">Silent Partners AI Tools</h2>
        <p className="text-sm text-stone-gray/80">AI software tools used by our team</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warm-gray">
                <tr>
                  {columns.map((columnId) => (
                    <th
                      key={columnId}
                      className="px-4 py-3 text-left text-sm font-roboto-mono uppercase tracking-wide text-stone-gray"
                    >
                      {getColumnLabel(columnId)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, index) => (
                  <tr key={tool.id} className={index % 2 === 0 ? "bg-white" : "bg-warm-gray/30"}>
                    {columns.map((columnId) => (
                      <td key={columnId} className="px-4 py-3 text-sm">
                        {columnId === "name" && <div className="font-medium text-stone-gray">{tool.name}</div>}
                        {columnId === "url" && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-blue hover:underline"
                          >
                            Visit
                          </a>
                        )}
                        {columnId === "category" && tool.category && (
                          <Badge variant="outline" className="text-xs">
                            {tool.category}
                          </Badge>
                        )}
                        {columnId === "description" && (
                          <div className="max-w-xs text-stone-gray/80">{tool.description}</div>
                        )}
                        {columnId === "use_cases" && (
                          <div className="max-w-xs text-stone-gray/80">{tool.use_cases}</div>
                        )}
                        {columnId === "pricing_model" && tool.pricing_model && (
                          <Badge className={getPricingColor(tool.pricing_model)}>{tool.pricing_model}</Badge>
                        )}
                        {columnId === "average_rating" && renderStars(tool.average_rating)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tools.length === 0 && (
            <div className="px-4 py-8 text-center text-stone-gray">No tools found matching the current filters.</div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-xs text-stone-gray/60 text-center">Powered by Silent Partners AI Software Library</div>
    </div>
  )
}
