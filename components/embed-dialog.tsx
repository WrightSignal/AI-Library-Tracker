"use client"

import { useState, useEffect } from "react"
import { Copy, Eye, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, isSupabaseConfigured, mockTools } from "@/lib/supabase"
import { type Tool, type EmbedConfiguration, CATEGORIES } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface EmbedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PUBLIC_COLUMNS = [
  { id: "name", label: "Tool Name", required: true },
  { id: "url", label: "URL", required: false },
  { id: "category", label: "Category", required: false },
  { id: "description", label: "Description", required: false },
  { id: "use_cases", label: "Use Cases", required: false },
  { id: "pricing_model", label: "Pricing Model", required: false },
  { id: "average_rating", label: "Rating", required: false },
]

export function EmbedDialog({ open, onOpenChange }: EmbedDialogProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [previewTools, setPreviewTools] = useState<Tool[]>([])
  const [configurations, setConfigurations] = useState<EmbedConfiguration[]>([])
  const [selectedConfig, setSelectedConfig] = useState<string>("")
  const [configName, setConfigName] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["name", "category", "description"])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchTools()
      fetchConfigurations()
    }
  }, [open])

  useEffect(() => {
    generatePreview()
  }, [tools, visibleColumns, categoryFilter, statusFilter, sortField, sortDirection])

  const fetchTools = async () => {
    try {
      if (!isSupabaseConfigured) {
        setTools(mockTools)
        return
      }

      // Fetch tools without relationships to avoid schema issues
      const { data: toolsData, error: toolsError } = await supabase.from("tools").select("*")

      if (toolsError) {
        console.error("Supabase error:", toolsError)
        setTools(mockTools)
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
        // Continue without ratings
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
    }
  }

  const fetchConfigurations = async () => {
    try {
      if (!isSupabaseConfigured) {
        setConfigurations([])
        return
      }

      const { data, error } = await supabase
        .from("embed_configurations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching configurations:", error)
        setConfigurations([])
        return
      }

      setConfigurations(data || [])
    } catch (error) {
      console.error("Error fetching configurations:", error)
      setConfigurations([])
    }
  }

  const generatePreview = () => {
    let filtered = tools

    // Apply filters
    if (categoryFilter !== "all") {
      filtered = filtered.filter((tool) => tool.category === categoryFilter)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((tool) => tool.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof Tool]
      let bValue = b[sortField as keyof Tool]

      if (typeof aValue === "string") aValue = aValue.toLowerCase()
      if (typeof bValue === "string") bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    setPreviewTools(filtered)
  }

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    if (checked) {
      setVisibleColumns((prev) => [...prev, columnId])
    } else {
      setVisibleColumns((prev) => prev.filter((id) => id !== columnId))
    }
  }

  const saveConfiguration = async () => {
    if (!configName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a configuration name.",
        variant: "destructive",
      })
      return
    }

    if (!isSupabaseConfigured) {
      toast({
        title: "Demo Mode",
        description: "Configuration saving is disabled in demo mode. Configure Supabase to enable full functionality.",
        variant: "default",
      })
      return
    }

    setLoading(true)
    try {
      const configData = {
        name: configName,
        visible_columns: visibleColumns,
        filters: {
          category: categoryFilter !== "all" ? categoryFilter : null,
          status: statusFilter !== "all" ? statusFilter : null,
        },
        sort_order: {
          field: sortField,
          direction: sortDirection,
        },
      }

      const { error } = await supabase.from("embed_configurations").insert([configData])

      if (error) throw error

      toast({
        title: "Success",
        description: "Embed configuration saved successfully.",
      })

      fetchConfigurations()
      setConfigName("")
    } catch (error) {
      console.error("Error saving configuration:", error)
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadConfiguration = async (configId: string) => {
    const config = configurations.find((c) => c.id === configId)
    if (!config) return

    setVisibleColumns(config.visible_columns)
    setCategoryFilter(config.filters.category || "all")
    setStatusFilter(config.filters.status || "all")
    setSortField(config.sort_order.field)
    setSortDirection(config.sort_order.direction)
  }

  const generateEmbedCode = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const params = new URLSearchParams({
      columns: visibleColumns.join(","),
      category: categoryFilter !== "all" ? categoryFilter : "",
      status: statusFilter !== "all" ? statusFilter : "",
      sort: sortField,
      direction: sortDirection,
    })

    return `<iframe 
  src="${baseUrl}/embed/tools?${params.toString()}" 
  width="100%" 
  height="600" 
  frameborder="0"
  
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;">
</iframe>`
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
    })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-gray flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Embed Configuration
          </DialogTitle>
          <DialogDescription>Configure and generate embeddable tables for your website.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="configure" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-6">
            {/* Load Existing Configuration */}
            {configurations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Load Existing Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a saved configuration" />
                      </SelectTrigger>
                      <SelectContent>
                        {configurations.map((config) => (
                          <SelectItem key={config.id} value={config.id}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => selectedConfig && loadConfiguration(selectedConfig)}
                      disabled={!selectedConfig}
                      variant="outline"
                    >
                      Load
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Column Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Visible Columns</CardTitle>
                <CardDescription>Select which columns to display in the embedded table.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {PUBLIC_COLUMNS.map((column) => (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.id}
                        checked={visibleColumns.includes(column.id)}
                        onCheckedChange={(checked) => handleColumnToggle(column.id, checked as boolean)}
                        disabled={column.required}
                      />
                      <Label htmlFor={column.id} className="text-sm">
                        {column.label}
                        {column.required && <span className="text-poppy-red ml-1">*</span>}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Filters</CardTitle>
                <CardDescription>Pre-filter the tools that will be displayed.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-roboto-mono uppercase tracking-wide">Category Filter</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
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
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-roboto-mono uppercase tracking-wide">Status Filter</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                        <SelectItem value="trial">Trial Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sorting */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Default Sorting</CardTitle>
                <CardDescription>Set the default sort order for the embedded table.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-roboto-mono uppercase tracking-wide">Sort By</Label>
                    <Select value={sortField} onValueChange={setSortField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="pricing_model">Pricing Model</SelectItem>
                        <SelectItem value="created_at">Date Added</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-roboto-mono uppercase tracking-wide">Direction</Label>
                    <Select value={sortDirection} onValueChange={(value: "asc" | "desc") => setSortDirection(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Save Configuration</CardTitle>
                <CardDescription>Save this configuration for future use.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Configuration name..."
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={saveConfiguration}
                    disabled={loading || !configName.trim()}
                    className="bg-poppy-red hover:bg-poppy-red/90"
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Preview ({previewTools.length} tools)</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Public View
              </Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        {visibleColumns.map((columnId) => {
                          const column = PUBLIC_COLUMNS.find((c) => c.id === columnId)
                          return (
                            <th
                              key={columnId}
                              className="px-4 py-3 text-left text-sm font-roboto-mono uppercase tracking-wide"
                            >
                              {column?.label}
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {previewTools.slice(0, 10).map((tool, index) => (
                        <tr key={tool.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                          {visibleColumns.map((columnId) => (
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
                                <div className="max-w-xs truncate text-stone-gray/80">{tool.description}</div>
                              )}
                              {columnId === "use_cases" && (
                                <div className="max-w-xs truncate text-stone-gray/80">{tool.use_cases}</div>
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
                {previewTools.length > 10 && (
                  <div className="px-4 py-3 text-sm text-stone-gray border-t">
                    ... and {previewTools.length - 10} more tools
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Embed Code
                </CardTitle>
                <CardDescription>
                  Copy this code and paste it into your website where you want the table to appear.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{generateEmbedCode()}</code>
                    </pre>
                    <Button
                      onClick={copyEmbedCode}
                      size="sm"
                      className="absolute top-2 right-2 bg-transparent"
                      variant="outline"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="text-xs text-stone-gray space-y-1">
                    <p>• The embedded table will automatically update when you add or modify tools.</p>
                    <p>• Only public information is displayed (no costs or internal notes).</p>
                    <p>• The table is responsive and will adapt to different screen sizes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
