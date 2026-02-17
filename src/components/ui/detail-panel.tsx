"use client"

import * as React from "react"
import { X, ChevronRight, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface DetailPanelProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  width?: "sm" | "md" | "lg" | "xl"
  showMaximize?: boolean
}

const widthClasses = {
  sm: "w-[400px]",
  md: "w-[500px]",
  lg: "w-[600px]",
  xl: "w-[700px]",
}

export function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
  showMaximize = true,
}: DetailPanelProps) {
  const [isMaximized, setIsMaximized] = React.useState(false)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full bg-background border-l shadow-xl z-40 flex flex-col transition-all duration-300 ease-in-out",
        isMaximized ? "w-[80%]" : widthClasses[width]
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold truncate">{title}</h2>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {showMaximize && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  )
}

// Detail panel section component
interface DetailSectionProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

export function DetailSection({
  title,
  children,
  actions,
  collapsible = false,
  defaultOpen = true,
}: DetailSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="mb-4">
      <div
        className={cn(
          "flex items-center justify-between py-2",
          collapsible && "cursor-pointer"
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          {title}
        </h3>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  )
}

// Detail panel field component
interface DetailFieldProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={cn("py-2", className)}>
      <dt className="text-xs text-muted-foreground mb-1">{label}</dt>
      <dd className="text-sm">{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )
}

// Detail panel grid for fields
interface DetailGridProps {
  children: React.ReactNode
  columns?: 1 | 2
}

export function DetailGrid({ children, columns = 2 }: DetailGridProps) {
  return (
    <dl
      className={cn(
        "grid gap-x-4",
        columns === 2 ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {children}
    </dl>
  )
}

// Activity timeline for detail panel
interface TimelineItem {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  icon?: React.ReactNode
}

interface DetailTimelineProps {
  items: TimelineItem[]
}

export function DetailTimeline({ items }: DetailTimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {item.icon || (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-px flex-1 bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {item.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Layout wrapper that shrinks content when panel is open
interface DetailPanelLayoutProps {
  children: React.ReactNode
  panelOpen: boolean
  panelWidth?: "sm" | "md" | "lg" | "xl"
}

const layoutWidths = {
  sm: "pr-[400px]",
  md: "pr-[500px]",
  lg: "pr-[600px]",
  xl: "pr-[700px]",
}

export function DetailPanelLayout({
  children,
  panelOpen,
  panelWidth = "md",
}: DetailPanelLayoutProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        panelOpen && layoutWidths[panelWidth]
      )}
    >
      {children}
    </div>
  )
}
