"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  MoreHorizontal,
  Send,
  Loader2,
  User,
  Calendar,
  Tag,
  FileText,
  Phone,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumnHeader, DataTableRowActions } from "@/components/ui/data-table"
import {
  DetailPanel,
  DetailPanelLayout,
  DetailSection,
  DetailField,
  DetailGrid,
  DetailTimeline,
} from "@/components/ui/detail-panel"
import { createClient } from "@/utils/supabase/client"
import type { Ticket, TicketStatus, TicketPriority, TicketCategory, Contact } from "@/types/database"

type TicketWithContact = Ticket & { contacts?: Contact | null }

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="h-3 w-3" /> },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
  waiting: { label: "Waiting", color: "bg-purple-100 text-purple-700", icon: <Clock className="h-3 w-3" /> },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700", icon: <CheckCircle className="h-3 w-3" /> },
}

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
}

const categoryConfig: Record<TicketCategory, { label: string }> = {
  general: { label: "General" },
  billing: { label: "Billing" },
  technical: { label: "Technical" },
  sales: { label: "Sales" },
  complaint: { label: "Complaint" },
  inquiry: { label: "Inquiry" },
}

export default function TicketsPage() {
  const [tickets, setTickets] = React.useState<TicketWithContact[]>([])
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [loading, setLoading] = React.useState(true)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingTicket, setEditingTicket] = React.useState<TicketWithContact | null>(null)
  const [selectedTicket, setSelectedTicket] = React.useState<TicketWithContact | null>(null)
  const [filter, setFilter] = React.useState<"all" | TicketStatus>("all")
  const [saving, setSaving] = React.useState(false)
  const [newMessage, setNewMessage] = React.useState("")
  const [messages, setMessages] = React.useState<any[]>([])

  const [formData, setFormData] = React.useState({
    contact_id: "",
    subject: "",
    description: "",
    status: "open" as TicketStatus,
    priority: "medium" as TicketPriority,
    category: "general" as TicketCategory,
    assigned_to: "",
  })

  const supabase = createClient()

  const fetchTickets = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("tickets")
      .select("*, contacts(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setTickets(data)
    }
    setLoading(false)
  }

  const fetchContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("name")

    if (data) setContacts(data)
  }

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })

    if (data) setMessages(data)
  }

  React.useEffect(() => {
    fetchTickets()
    fetchContacts()
  }, [])

  React.useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id)
    }
  }, [selectedTicket])

  const generateTicketNumber = () => {
    const prefix = "TKT"
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${prefix}-${timestamp}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ticketData = {
      ...formData,
      user_id: user.id,
      contact_id: formData.contact_id || null,
      ticket_number: editingTicket?.ticket_number || generateTicketNumber(),
    }

    let error
    if (editingTicket) {
      const { error: updateError } = await supabase
        .from("tickets")
        .update(ticketData)
        .eq("id", editingTicket.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("tickets")
        .insert(ticketData)
      error = insertError
    }

    if (!error) {
      fetchTickets()
      handleCloseModal()
    }
    setSaving(false)
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      user_id: user.id,
      message: newMessage,
    })

    if (!error) {
      setNewMessage("")
      fetchMessages(selectedTicket.id)
    }
  }

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    const updateData: any = { status }
    if (status === "resolved" || status === "closed") {
      updateData.resolved_at = new Date().toISOString()
    }

    await supabase.from("tickets").update(updateData).eq("id", ticketId)
    fetchTickets()
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status, resolved_at: updateData.resolved_at })
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from("tickets").delete().eq("id", id)
    fetchTickets()
    if (selectedTicket?.id === id) setSelectedTicket(null)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTicket(null)
    setFormData({
      contact_id: "",
      subject: "",
      description: "",
      status: "open",
      priority: "medium",
      category: "general",
      assigned_to: "",
    })
  }

  const openEditModal = (ticket: TicketWithContact) => {
    setEditingTicket(ticket)
    setFormData({
      contact_id: ticket.contact_id || "",
      subject: ticket.subject,
      description: ticket.description || "",
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      assigned_to: ticket.assigned_to || "",
    })
    setModalOpen(true)
  }

  const filteredTickets = filter === "all"
    ? tickets
    : tickets.filter(t => t.status === filter)

  const columns: ColumnDef<TicketWithContact>[] = [
    {
      accessorKey: "ticket_number",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ticket #" />,
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("ticket_number")}</div>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{row.getValue("subject")}</p>
          {row.original.contacts && (
            <p className="text-xs text-muted-foreground">{row.original.contacts.name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as TicketStatus
        const config = statusConfig[status]
        return (
          <Badge variant="secondary" className={`gap-1 ${config.color}`}>
            {config.icon}
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
      cell: ({ row }) => {
        const priority = row.getValue("priority") as TicketPriority
        const config = priorityConfig[priority]
        return (
          <Badge variant="secondary" className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => {
        const category = row.getValue("category") as TicketCategory
        return <span className="text-sm">{categoryConfig[category].label}</span>
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedTicket(row.original)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditModal(row.original)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "in_progress")}>
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "resolved")}>
                Mark Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "closed")}>
                Close Ticket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DataTableRowActions>
      ),
    },
  ]

  const stats = {
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved" || t.status === "closed").length,
  }

  return (
    <DetailPanelLayout panelOpen={!!selectedTicket} panelWidth="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Customer Service</h1>
            <p className="text-sm text-muted-foreground">
              Manage support tickets and customer inquiries
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.open}</p>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({stats.open})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="waiting">Waiting</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTickets}
            searchKey="subject"
            searchPlaceholder="Search tickets..."
            onRowClick={setSelectedTicket}
          />
        )}
      </div>

      {/* Detail Panel */}
      <DetailPanel
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.ticket_number}
        subtitle={selectedTicket?.subject}
        width="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Status Actions */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedTicket.status}
                onValueChange={(v) => handleStatusChange(selectedTicket.id, v as TicketStatus)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className={priorityConfig[selectedTicket.priority].color}>
                {priorityConfig[selectedTicket.priority].label} Priority
              </Badge>
            </div>

            {/* Details Section */}
            <DetailSection title="Details">
              <DetailGrid>
                <DetailField label="Category" value={categoryConfig[selectedTicket.category].label} />
                <DetailField label="Assigned To" value={selectedTicket.assigned_to} />
                <DetailField
                  label="Created"
                  value={new Date(selectedTicket.created_at).toLocaleString()}
                />
                <DetailField
                  label="Updated"
                  value={new Date(selectedTicket.updated_at).toLocaleString()}
                />
                {selectedTicket.resolved_at && (
                  <DetailField
                    label="Resolved"
                    value={new Date(selectedTicket.resolved_at).toLocaleString()}
                  />
                )}
              </DetailGrid>
            </DetailSection>

            {/* Contact Section */}
            {selectedTicket.contacts && (
              <DetailSection title="Contact">
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedTicket.contacts.name}</span>
                  </div>
                  {selectedTicket.contacts.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedTicket.contacts.email}</span>
                    </div>
                  )}
                  {selectedTicket.contacts.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedTicket.contacts.phone}</span>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Description */}
            <DetailSection title="Description">
              <p className="text-sm whitespace-pre-wrap">
                {selectedTicket.description || "No description provided."}
              </p>
            </DetailSection>

            {/* Messages/Comments */}
            <DetailSection title="Conversation">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-lg border bg-muted/30 p-3"
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DetailSection>
          </div>
        )}
      </DetailPanel>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTicket ? "Edit Ticket" : "Create New Ticket"}
            </DialogTitle>
            <DialogDescription>
              {editingTicket
                ? "Update the ticket details below."
                : "Fill in the details to create a new support ticket."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Select
                value={formData.contact_id}
                onValueChange={(v) => setFormData({ ...formData, contact_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as TicketPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as TicketCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingTicket && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as TicketStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                placeholder="Agent name or email"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingTicket ? (
                  "Update Ticket"
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DetailPanelLayout>
  )
}
