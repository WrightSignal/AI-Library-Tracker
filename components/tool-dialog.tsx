"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { type Tool, CATEGORIES, PRICING_MODELS, TOOL_STATUS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ToolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tool?: Tool | null
  onSaved: () => void
}

export function ToolDialog({ open, onOpenChange, tool, onSaved }: ToolDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "",
    description: "",
    use_cases: "",
    pricing_model: "",
    cost_per_month: "",
    status: "active" as const,
  })
  const [loading, setLoading] = useState(false)
  const [ogData, setOgData] = useState<{
    title?: string
    description?: string
    image?: string
    siteName?: string
    favicon_url?: string
  } | null>(null)
  const [fetchingOg, setFetchingOg] = useState(false)
  const [ogError, setOgError] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to fetch OpenGraph data
  const fetchOpenGraphData = useCallback(async (url: string) => {
    if (!url || url.trim() === '') {
      setOgData(null)
      setOgError(null)
      return
    }

    try {
      // Validate URL format
      new URL(url)
    } catch {
      setOgError('Invalid URL format')
      return
    }

    setFetchingOg(true)
    setOgError(null)

    try {
      console.log('Fetching OpenGraph data for:', url)
      const response = await fetch('/api/opengraph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setOgData({
          title: result.data.title,
          description: result.data.description,
          image: result.data.image,
          siteName: result.data.siteName,
          favicon_url: result.data.favicon_url,
        })
        
        // Auto-fill form fields if they're empty
        if (!formData.name && result.data.title) {
          handleInputChange('name', result.data.title)
        }
        if (!formData.description && result.data.description) {
          handleInputChange('description', result.data.description)
        }
      } else {
        setOgError(result.error || 'Failed to fetch OpenGraph data')
        setOgData(null)
      }
    } catch (error) {
      console.error('Error fetching OpenGraph data:', error)
      setOgError('Failed to fetch website information')
      setOgData(null)
    } finally {
      setFetchingOg(false)
    }
  }, [formData.name, formData.description])

  // Debounced URL change handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.url && formData.url.trim() !== '') {
        fetchOpenGraphData(formData.url)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [formData.url, fetchOpenGraphData])

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        url: tool.url,
        category: tool.category || "",
        description: tool.description || "",
        use_cases: tool.use_cases || "",
        pricing_model: tool.pricing_model || "",
        cost_per_month: tool.cost_per_month?.toString() || "",
        status: tool.status,
      })
    } else {
      setFormData({
        name: "",
        url: "",
        category: "",
        description: "",
        use_cases: "",
        pricing_model: "",
        cost_per_month: "",
        status: "active",
      })
    }
  }, [tool, open])

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Tool name is required.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.url.trim()) {
      toast({
        title: "Validation Error",
        description: "Tool URL is required.",
        variant: "destructive",
      })
      return false
    }

    // Basic URL validation
    try {
      new URL(formData.url)
    } catch {
      toast({
        title: "Validation Error",
        description: "Please enter a valid URL.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        // Simulate saving in demo mode
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Demo Mode",
          description: `Tool "${formData.name}" would be ${tool ? "updated" : "added"} in a real database. Configure Supabase to enable actual saving.`,
          variant: "default",
        })

        onSaved()
        return
      }

      const toolData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        category: formData.category || null,
        description: formData.description.trim() || null,
        use_cases: formData.use_cases.trim() || null,
        pricing_model: formData.pricing_model || null,
        cost_per_month: formData.cost_per_month ? Number.parseFloat(formData.cost_per_month) : null,
        status: formData.status,
        updated_at: new Date().toISOString(),
        // Include OpenGraph metadata if available
        og_title: ogData?.title || null,
        og_description: ogData?.description || null,
        og_image: ogData?.image || null,
        og_site_name: ogData?.siteName || null,
        og_last_fetched: ogData ? new Date().toISOString() : null,
        favicon_url: ogData?.favicon_url || null,
      }

      console.log("Saving tool data:", toolData)

      if (tool) {
        // Update existing tool
        console.log("Updating tool with ID:", tool.id)
        const { data, error } = await supabase.from("tools").update(toolData).eq("id", tool.id).select()

        console.log("Update result:", { data, error })

        if (error) {
          console.error("Supabase update error:", error)
          throw new Error(`Update failed: ${error.message || "Unknown error"}`)
        }

        toast({
          title: "Success",
          description: "Tool updated successfully.",
        })
      } else {
        // Create new tool
        console.log("Creating new tool")
        const { data, error } = await supabase
          .from("tools")
          .insert([
            {
              ...toolData,
              created_by: null, // Will be set when auth is implemented
            },
          ])
          .select()

        console.log("Insert result:", { data, error })

        if (error) {
          console.error("Supabase insert error:", error)
          throw new Error(`Insert failed: ${error.message || "Unknown error"}`)
        }

        toast({
          title: "Success",
          description: "Tool added successfully.",
        })
      }

      onSaved()
    } catch (error) {
      console.error("Error saving tool:", error)

      // Extract meaningful error message
      let errorMessage = "Failed to save tool. Please try again."

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error)
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-gray">{tool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
          <DialogDescription>
            {tool ? "Update the tool information below." : "Add a new AI tool to the library."}
            {!isSupabaseConfigured && (
              <span className="block mt-2 text-yellow-600 text-sm">
                Demo Mode: Changes will not be saved to a real database.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-roboto-mono uppercase tracking-wide">
                Tool Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., ChatGPT"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="url" className="text-sm font-roboto-mono uppercase tracking-wide">
                  URL *
                </Label>
                {formData.url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchOpenGraphData(formData.url)}
                    disabled={fetchingOg}
                    className="text-xs h-6"
                  >
                    {fetchingOg ? "Fetching..." : "Refresh"}
                  </Button>
                )}
              </div>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://..."
                required
              />
              {fetchingOg && (
                <p className="text-xs text-blue-600">Fetching website information...</p>
              )}
              {ogError && (
                <p className="text-xs text-red-600">{ogError}</p>
              )}
            </div>
          </div>

          {/* OpenGraph Preview */}
          {ogData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-stone-gray mb-2">Website Preview</h4>
              <div className="flex gap-3">
                {ogData.image && (
                  <img
                    src={ogData.image}
                    alt={ogData.title || 'Website preview'}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  {ogData.title && (
                    <h5 className="font-medium text-sm text-stone-gray truncate">{ogData.title}</h5>
                  )}
                  {ogData.siteName && (
                    <p className="text-xs text-blue-600 uppercase tracking-wide">{ogData.siteName}</p>
                  )}
                  {ogData.description && (
                    <p className="text-xs text-stone-gray/80 line-clamp-2 mt-1">{ogData.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-roboto-mono uppercase tracking-wide">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-roboto-mono uppercase tracking-wide">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOOL_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-roboto-mono uppercase tracking-wide">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the tool..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="use_cases" className="text-sm font-roboto-mono uppercase tracking-wide">
              Use Cases
            </Label>
            <Textarea
              id="use_cases"
              value={formData.use_cases}
              onChange={(e) => handleInputChange("use_cases", e.target.value)}
              placeholder="How is this tool used? What problems does it solve?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricing_model" className="text-sm font-roboto-mono uppercase tracking-wide">
                Pricing Model
              </Label>
              <Select
                value={formData.pricing_model}
                onValueChange={(value) => handleInputChange("pricing_model", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_MODELS.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model.charAt(0).toUpperCase() + model.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_per_month" className="text-sm font-roboto-mono uppercase tracking-wide">
                Monthly Cost ($)
              </Label>
              <Input
                id="cost_per_month"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_month}
                onChange={(e) => handleInputChange("cost_per_month", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-poppy-red hover:bg-poppy-red/90">
              {loading ? "Saving..." : tool ? "Update Tool" : "Add Tool"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
