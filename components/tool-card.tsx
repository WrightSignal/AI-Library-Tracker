"use client"

import { useState } from "react"
import { ExternalLink, Edit, Trash2, Star, DollarSign, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Tool } from "@/lib/types"

interface ToolCardProps {
  tool: Tool
  viewMode: "grid" | "list"
  onEdit: (tool: Tool) => void
  onDelete: (toolId: string) => void
  getStatusColor: (status: string) => string
  getPricingColor: (pricing: string) => string
}

export function ToolCard({ tool, viewMode, onEdit, onDelete, getStatusColor, getPricingColor }: ToolCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(tool.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-stone-gray ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Favicon */}
              {tool.favicon_url && (
                <img
                  src={tool.favicon_url}
                  alt="favicon"
                  className="w-6 h-6 rounded mr-2 border border-gray-200 bg-white"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
              {/* OpenGraph Image Thumbnail */}
              {tool.og_image && (
                <div className="flex-shrink-0">
                  <img
                    src={tool.og_image}
                    alt={tool.og_title || tool.name}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-stone-gray truncate">
                    {tool.og_title || tool.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {tool.og_site_name && (
                      <Badge variant="outline" className="text-xs text-blue-600">
                        {tool.og_site_name}
                      </Badge>
                    )}
                    <Badge className={getStatusColor(tool.status)}>{tool.status}</Badge>
                    {tool.category && (
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    )}
                    {tool.pricing_model && (
                      <Badge className={getPricingColor(tool.pricing_model)}>{tool.pricing_model}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-stone-gray">
                  {(tool.og_description || tool.description) && (
                    <p className="truncate flex-1">
                      {tool.og_description || tool.description}
                    </p>
                  )}
                  {tool.average_rating && renderStars(tool.average_rating)}
                  {tool.cost_per_month && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>${tool.cost_per_month}/mo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={() => window.open(tool.url, "_blank")}>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(tool)}>
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Tool</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{tool.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      {/* OpenGraph Image Header */}
      {tool.og_image && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={tool.og_image}
            alt={tool.og_title || tool.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on load error
              e.currentTarget.style.display = 'none'
            }}
          />
          {/* Overlay for action buttons */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="sm" onClick={() => window.open(tool.url, "_blank")}>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onEdit(tool)}>
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Tool</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{tool.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <CardHeader className={tool.og_image ? "pb-3" : "pb-3"}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Favicon */}
            {tool.favicon_url && (
              <img
                src={tool.favicon_url}
                alt="favicon"
                className="w-6 h-6 rounded border border-gray-200 bg-white"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            {/* Use OpenGraph title if available, fallback to tool name */}
            <CardTitle className="text-lg text-stone-gray truncate mb-1">
              {tool.og_title || tool.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs">
              {tool.og_site_name && (
                <span className="uppercase tracking-wide font-roboto-mono text-blue-600">
                  {tool.og_site_name}
                </span>
              )}
              {tool.category && (
                <CardDescription className="text-xs uppercase tracking-wide font-roboto-mono">
                  {tool.category}
                </CardDescription>
              )}
            </div>
          </div>
          {!tool.og_image && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => window.open(tool.url, "_blank")}>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(tool)}>
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Tool</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{tool.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Use OpenGraph description if available, fallback to tool description */}
          {(tool.og_description || tool.description) && (
            <p className="text-sm text-stone-gray line-clamp-2">
              {tool.og_description || tool.description}
            </p>
          )}

          {tool.use_cases && (
            <div>
              <p className="text-xs uppercase tracking-wide font-roboto-mono text-stone-gray mb-1">Use Cases</p>
              <p className="text-sm text-stone-gray/80 line-clamp-2">{tool.use_cases}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(tool.status)}>{tool.status}</Badge>
              {tool.pricing_model && (
                <Badge className={getPricingColor(tool.pricing_model)}>{tool.pricing_model}</Badge>
              )}
            </div>
            {tool.average_rating && renderStars(tool.average_rating)}
          </div>

          {tool.cost_per_month && (
            <div className="flex items-center gap-1 text-sm text-moss-green font-medium">
              <DollarSign className="w-4 h-4" />
              <span>${tool.cost_per_month}/month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
