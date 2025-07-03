"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const { toast } = useToast()

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
              <Label htmlFor="url" className="text-sm font-roboto-mono uppercase tracking-wide">
                URL *
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
          </div>

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
