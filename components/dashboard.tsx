"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolCard } from "@/components/tool-card"
import { ToolDialog } from "@/components/tool-dialog"
import { EmbedDialog } from "@/components/embed-dialog"
import { UserProfile } from "@/components/auth/user-profile"
import { supabase, isSupabaseConfigured, mockTools } from "@/lib/supabase"
import { type Tool, CATEGORIES } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function Dashboard() {
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false)
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTools()
  }, [])

  useEffect(() => {
    filterTools()
  }, [tools, searchQuery, categoryFilter, statusFilter])

  const fetchTools = async () => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.log("Using mock data - Supabase not configured")
        setTools(mockTools)
        setLoading(false)
        return
      }

      // First, try to fetch tools without relationships
      const { data: toolsData, error: toolsError } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false })

      if (toolsError) {
        console.error("Supabase error:", toolsError)
        // Fall back to mock data if there's an error
        setTools(mockTools)
        toast({
          title: "Using Demo Data",
          description: "Connected to demo data. Configure Supabase to use real database.",
          variant: "default",
        })
        return
      }

      // Try to fetch user ratings separately (optional)
      let ratingsData: any[] = []
      try {
        const { data, error } = await supabase.from("user_tools").select("tool_id, rating")

        if (!error && data) {
          ratingsData = data
        }
      } catch (ratingsError) {
        console.log("User ratings not available:", ratingsError)
        // Continue without ratings - this is optional
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
      // Fall back to mock data on any error
      setTools(mockTools)
      toast({
        title: "Using Demo Data",
        description: "Connected to demo data. Configure Supabase to use real database.",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTools = () => {
    let filtered = tools

    if (searchQuery) {
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((tool) => tool.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((tool) => tool.status === statusFilter)
    }

    setFilteredTools(filtered)
  }

  const handleToolSaved = () => {
    // Refresh the tools list
    fetchTools()
    setIsToolDialogOpen(false)
    setSelectedTool(null)
  }

  const handleEditTool = (tool: Tool) => {
    setSelectedTool(tool)
    setIsToolDialogOpen(true)
  }

  const handleDeleteTool = async (toolId: string) => {
    try {
      if (!isSupabaseConfigured) {
        toast({
          title: "Demo Mode",
          description: "Tool deletion is disabled in demo mode. Configure Supabase to enable full functionality.",
          variant: "default",
        })
        return
      }

      const { error } = await supabase.from("tools").delete().eq("id", toolId)

      if (error) {
        console.error("Delete error:", error)
        throw new Error(`Delete failed: ${error.message}`)
      }

      toast({
        title: "Success",
        description: "Tool deleted successfully.",
      })
      fetchTools()
    } catch (error) {
      console.error("Error deleting tool:", error)

      let errorMessage = "Failed to delete tool. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "trial":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poppy-red mx-auto mb-4"></div>
              <p className="text-stone-gray">Loading tools...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-gray grain-texture">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-stone-gray mb-2">AI Software Library</h1>
              <p className="text-stone-gray/80">Centralized repository for AI tools used by Silent Partners</p>
            </div>
            <div className="flex items-center gap-2">
              <UserProfile />
              <Button
                onClick={() => setIsEmbedDialogOpen(true)}
                variant="outline"
                className="border-slate-blue text-slate-blue hover:bg-slate-blue hover:text-white"
              >
                <Grid className="w-4 h-4 mr-2" />
                Embed Tools
              </Button>
              <Button
                onClick={() => setIsToolDialogOpen(true)}
                className="bg-poppy-red hover:bg-poppy-red/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tool
              </Button>
            </div>
          </div>

          {/* Configuration Status Banner */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> Using sample data. Configure Supabase environment variables to connect to
                  your database.
                </p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-gray">Total Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-poppy-red">{tools.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-gray">Active Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {tools.filter((t) => t.status === "active").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-gray">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-blue">
                  {new Set(tools.map((t) => t.category).filter(Boolean)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-gray">Monthly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-moss-green">
                  ${tools.reduce((sum, t) => sum + (t.cost_per_month || 0), 0).toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-gray w-4 h-4" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tools Grid/List */}
        {filteredTools.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-stone-gray">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No tools found</h3>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                viewMode={viewMode}
                onEdit={handleEditTool}
                onDelete={handleDeleteTool}
                getStatusColor={getStatusColor}
                getPricingColor={getPricingColor}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <ToolDialog
          open={isToolDialogOpen}
          onOpenChange={setIsToolDialogOpen}
          tool={selectedTool}
          onSaved={handleToolSaved}
        />

        <EmbedDialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen} />
      </div>
    </div>
  )
}
