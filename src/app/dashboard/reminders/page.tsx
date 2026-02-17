'use client'

import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus,
  Bell,
  Calendar,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  User,
  Upload,
  Download,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ReminderModal } from '@/components/reminders/reminder-modal'
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal'
import { DataTable, DataTableColumnHeader, DataTableRowActions } from '@/components/ui/data-table'
import { ExcelUpload, exportToExcel, downloadTemplate, ColumnMapping } from '@/components/ui/excel-upload'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Reminder, ReminderPriority, Contact } from '@/types/database'

const PRIORITY_CONFIG: Record<ReminderPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-50' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  high: { label: 'High', color: 'text-red-600', bgColor: 'bg-red-50' },
}

type ReminderWithContact = Reminder & { contacts: Pick<Contact, 'id' | 'name' | 'phone'> | null }

const EXCEL_COLUMN_MAPPINGS: ColumnMapping[] = [
  { excelColumn: 'Title', dbColumn: 'title', label: 'Title', required: true },
  { excelColumn: 'Description', dbColumn: 'description', label: 'Description' },
  { excelColumn: 'Due Date', dbColumn: 'due_date', label: 'Due Date', required: true },
  { excelColumn: 'Priority', dbColumn: 'priority', label: 'Priority' },
]

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderWithContact[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'overdue'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<ReminderWithContact | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [reminderToDelete, setReminderToDelete] = useState<ReminderWithContact | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchReminders()
    fetchContacts()
  }, [])

  async function fetchReminders() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('reminders')
      .select('*, contacts(id, name, phone)')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching reminders:', error)
    } else {
      setReminders(data || [])
    }
    setLoading(false)
  }

  async function fetchContacts() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    setContacts(data || [])
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return due < today
  }

  const isToday = (dueDate: string) => {
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() === today.getTime()
  }

  const filteredReminders = reminders.filter(reminder => {
    switch (filter) {
      case 'pending':
        return !reminder.is_completed
      case 'completed':
        return reminder.is_completed
      case 'today':
        return isToday(reminder.due_date) && !reminder.is_completed
      case 'overdue':
        return isOverdue(reminder.due_date) && !reminder.is_completed
      default:
        return true
    }
  })

  const handleToggleComplete = async (reminder: ReminderWithContact) => {
    const newStatus = !reminder.is_completed

    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: newStatus, updated_at: new Date().toISOString() })
      .eq('id', reminder.id)

    if (error) {
      console.error('Error updating reminder:', error)
    } else {
      setReminders(reminders.map(r =>
        r.id === reminder.id ? { ...r, is_completed: newStatus } : r
      ))
    }
  }

  const handleEdit = (reminder: ReminderWithContact) => {
    setSelectedReminder(reminder)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!reminderToDelete) return

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderToDelete.id)

    if (error) {
      console.error('Error deleting reminder:', error)
    } else {
      setReminders(reminders.filter(r => r.id !== reminderToDelete.id))
    }
    setDeleteModalOpen(false)
    setReminderToDelete(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedReminder(null)
  }

  const handleReminderSaved = () => {
    fetchReminders()
    handleModalClose()
  }

  const handleImport = async (data: Record<string, any>[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const remindersToInsert = data.map((row) => ({
      user_id: user.id,
      title: row.title,
      description: row.description || null,
      due_date: row.due_date,
      priority: (['low', 'medium', 'high'].includes(row.priority?.toLowerCase()) ? row.priority.toLowerCase() : 'medium') as ReminderPriority,
      is_completed: false,
    }))

    const { error } = await supabase.from('reminders').insert(remindersToInsert)
    if (error) throw new Error(error.message)
    await fetchReminders()
  }

  const handleExport = () => {
    exportToExcel(
      reminders.map(r => ({
        ...r,
        contact_name: r.contacts?.name || '',
      })),
      [
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'priority', label: 'Priority' },
        { key: 'is_completed', label: 'Completed' },
        { key: 'contact_name', label: 'Contact' },
      ],
      'reminders'
    )
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(
      [
        { label: 'Title', example: 'Follow up call' },
        { label: 'Description', example: 'Discuss proposal' },
        { label: 'Due Date', example: '2024-03-15' },
        { label: 'Priority', example: 'high' },
      ],
      'reminders'
    )
  }

  const overdueCount = reminders.filter(r => isOverdue(r.due_date) && !r.is_completed).length
  const todayCount = reminders.filter(r => isToday(r.due_date) && !r.is_completed).length
  const pendingCount = reminders.filter(r => !r.is_completed).length

  const getPriorityBadge = (priority: ReminderPriority) => {
    const config = PRIORITY_CONFIG[priority]
    return (
      <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<ReminderWithContact>[] = [
    {
      id: 'completed',
      header: '',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.original.is_completed}
            onCheckedChange={() => handleToggleComplete(row.original)}
          />
        </div>
      ),
      size: 40,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reminder" />
      ),
      cell: ({ row }) => {
        const reminder = row.original
        const overdue = isOverdue(reminder.due_date) && !reminder.is_completed
        return (
          <div className={reminder.is_completed ? 'opacity-50' : ''}>
            <p className={`font-medium ${reminder.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {reminder.title}
            </p>
            {reminder.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                {reminder.description}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'contacts',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) =>
        row.original.contacts ? (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.original.contacts.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'due_date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        const reminder = row.original
        const overdue = isOverdue(reminder.due_date) && !reminder.is_completed
        const dueToday = isToday(reminder.due_date) && !reminder.is_completed
        return (
          <div className={`flex items-center gap-1.5 text-sm ${
            overdue ? 'text-red-600' : dueToday ? 'text-blue-600' : 'text-muted-foreground'
          }`}>
            {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
            <span>{new Date(reminder.due_date).toLocaleDateString()}</span>
            {overdue && <span className="text-xs">(Overdue)</span>}
            {dueToday && <span className="text-xs">(Today)</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => getPriorityBadge(row.original.priority),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const reminder = row.original
        return (
          <DataTableRowActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(reminder)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleComplete(reminder)}>
                  {reminder.is_completed ? (
                    <>
                      <Circle className="mr-2 h-4 w-4" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Complete
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    setReminderToDelete(reminder)
                    setDeleteModalOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DataTableRowActions>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Never miss a follow-up or important task
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={reminders.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl border bg-card p-4 text-left transition-colors ${
            filter === 'all' ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
        >
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-xl font-semibold text-foreground">{reminders.length}</p>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-xl border bg-card p-4 text-left transition-colors ${
            filter === 'pending' ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
        >
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-xl font-semibold text-amber-600">{pendingCount}</p>
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`rounded-xl border bg-card p-4 text-left transition-colors ${
            filter === 'today' ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
        >
          <p className="text-xs text-muted-foreground mb-1">Due Today</p>
          <p className="text-xl font-semibold text-blue-600">{todayCount}</p>
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`rounded-xl border bg-card p-4 text-left transition-colors ${
            filter === 'overdue' ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
        >
          <p className="text-xs text-muted-foreground mb-1">Overdue</p>
          <p className="text-xl font-semibold text-red-600">{overdueCount}</p>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'completed' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setFilter(filter === 'completed' ? 'all' : 'completed')}
        >
          Show Completed
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
          </div>
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">
            {filter !== 'all' ? 'No reminders match this filter' : 'No reminders yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {filter !== 'all' ? 'Try a different filter' : 'Create your first reminder to get started.'}
          </p>
          {filter === 'all' && (
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredReminders}
          searchKey="title"
          searchPlaceholder="Search reminders..."
        />
      )}

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        reminder={selectedReminder}
        contacts={contacts}
        onSave={handleReminderSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setReminderToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${reminderToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Excel Import Modal */}
      <ExcelUpload
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
        columnMappings={EXCEL_COLUMN_MAPPINGS}
        title="Import Reminders"
        description="Upload an Excel or CSV file to import reminders."
        templateDownload={handleDownloadTemplate}
      />
    </div>
  )
}
