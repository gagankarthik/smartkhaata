'use client'

import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus,
  DollarSign,
  Calendar,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Kanban,
  List,
  Upload,
  Download,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { DealModal } from '@/components/deals/deal-modal'
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal'
import { DataTable, DataTableColumnHeader, DataTableRowActions } from '@/components/ui/data-table'
import { ExcelUpload, exportToExcel, downloadTemplate, ColumnMapping } from '@/components/ui/excel-upload'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Deal, DealStatus, Contact } from '@/types/database'

const DEAL_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'new', label: 'New', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'quoted', label: 'Quoted', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { value: 'negotiating', label: 'Negotiating', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { value: 'won', label: 'Won', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'lost', label: 'Lost', color: 'text-red-600', bgColor: 'bg-red-50' },
]

type DealWithContact = Deal & { contacts: Pick<Contact, 'id' | 'name' | 'phone' | 'email'> | null }

const EXCEL_COLUMN_MAPPINGS: ColumnMapping[] = [
  { excelColumn: 'Title', dbColumn: 'title', label: 'Title', required: true },
  { excelColumn: 'Value', dbColumn: 'value', label: 'Value', transform: (v) => Number(v) || 0 },
  { excelColumn: 'Status', dbColumn: 'status', label: 'Status' },
  { excelColumn: 'Description', dbColumn: 'description', label: 'Description' },
  { excelColumn: 'Expected Close Date', dbColumn: 'expected_close_date', label: 'Close Date' },
]

export default function DealsPage() {
  const [deals, setDeals] = useState<DealWithContact[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<DealWithContact | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<DealWithContact | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchDeals()
    fetchContacts()
  }, [])

  async function fetchDeals() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('deals')
      .select('*, contacts(id, name, phone, email)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching deals:', error)
    } else {
      setDeals(data || [])
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

  const handleUpdateStatus = async (dealId: string, newStatus: DealStatus) => {
    const { error } = await supabase
      .from('deals')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', dealId)

    if (error) {
      console.error('Error updating deal status:', error)
    } else {
      setDeals(deals.map(d => d.id === dealId ? { ...d, status: newStatus } : d))
    }
  }

  const handleEdit = (deal: DealWithContact) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!dealToDelete) return

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealToDelete.id)

    if (error) {
      console.error('Error deleting deal:', error)
    } else {
      setDeals(deals.filter(d => d.id !== dealToDelete.id))
    }
    setDeleteModalOpen(false)
    setDealToDelete(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDeal(null)
  }

  const handleDealSaved = () => {
    fetchDeals()
    handleModalClose()
  }

  const handleImport = async (data: Record<string, any>[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const dealsToInsert = data.map((row) => ({
      user_id: user.id,
      title: row.title,
      value: row.value || 0,
      status: (['new', 'quoted', 'negotiating', 'won', 'lost'].includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : 'new') as DealStatus,
      description: row.description || null,
      expected_close_date: row.expected_close_date || null,
    }))

    const { error } = await supabase.from('deals').insert(dealsToInsert)
    if (error) throw new Error(error.message)
    await fetchDeals()
  }

  const handleExport = () => {
    exportToExcel(
      deals.map(d => ({
        ...d,
        contact_name: d.contacts?.name || '',
      })),
      [
        { key: 'title', label: 'Title' },
        { key: 'value', label: 'Value' },
        { key: 'status', label: 'Status' },
        { key: 'contact_name', label: 'Contact' },
        { key: 'expected_close_date', label: 'Close Date' },
        { key: 'description', label: 'Description' },
      ],
      'deals'
    )
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(
      [
        { label: 'Title', example: 'Website Redesign' },
        { label: 'Value', example: '5000' },
        { label: 'Status', example: 'new' },
        { label: 'Description', example: 'Full website overhaul' },
        { label: 'Expected Close Date', example: '2024-03-15' },
      ],
      'deals'
    )
  }

  const getDealsByStatus = (status: DealStatus) => deals.filter(d => d.status === status)

  const totalPipelineValue = deals
    .filter(d => d.status !== 'lost')
    .reduce((sum, d) => sum + (d.value || 0), 0)

  const wonValue = deals
    .filter(d => d.status === 'won')
    .reduce((sum, d) => sum + (d.value || 0), 0)

  const getStatusBadge = (status: DealStatus) => {
    const config = DEAL_STATUSES.find(s => s.value === status)
    return (
      <Badge variant="secondary" className={`${config?.bgColor} ${config?.color} border-0`}>
        {config?.label}
      </Badge>
    )
  }

  const columns: ColumnDef<DealWithContact>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deal" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.title}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'contacts',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) =>
        row.original.contacts ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
              {row.original.contacts.name.charAt(0)}
            </div>
            <span className="text-sm">{row.original.contacts.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" className="text-right" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-semibold text-foreground">
          ${row.original.value?.toLocaleString() || 0}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'expected_close_date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Close Date" />
      ),
      cell: ({ row }) =>
        row.original.expected_close_date ? (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.expected_close_date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const deal = row.original
        return (
          <DataTableRowActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(deal)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {DEAL_STATUSES.filter(s => s.value !== deal.status).map(s => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => handleUpdateStatus(deal.id, s.value)}
                  >
                    Move to {s.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    setDealToDelete(deal)
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
          <h1 className="text-xl font-semibold text-foreground">Deals Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage your sales opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('kanban')}
            >
              <Kanban className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={deals.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Deals</p>
          <p className="text-xl font-semibold text-foreground">{deals.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Pipeline Value</p>
          <p className="text-xl font-semibold text-foreground">${totalPipelineValue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Won Value</p>
          <p className="text-xl font-semibold text-green-600">${wonValue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
          <p className="text-xl font-semibold text-foreground">
            {deals.length > 0 ? Math.round((deals.filter(d => d.status === 'won').length / deals.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {DEAL_STATUSES.map((statusConfig) => (
              <div key={statusConfig.value} className="w-72 flex-shrink-0">
                <div className={`${statusConfig.bgColor} rounded-t-lg p-3 border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getDealsByStatus(statusConfig.value).length}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ${getDealsByStatus(statusConfig.value).reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-b-lg p-2 min-h-[300px] space-y-2 border border-t-0">
                  {getDealsByStatus(statusConfig.value).map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-card rounded-lg p-3 border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => handleEdit(deal)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{deal.title}</h3>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          <span className="font-semibold">${deal.value?.toLocaleString() || 0}</span>
                        </div>
                        {deal.contacts && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate">{deal.contacts.name}</span>
                          </div>
                        )}
                        {deal.expected_close_date && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {getDealsByStatus(statusConfig.value).length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        loading ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/4 mx-auto" />
              <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
            </div>
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Kanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">No deals yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first deal to start tracking your pipeline.
            </p>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={deals}
            searchKey="title"
            searchPlaceholder="Search deals..."
          />
        )
      )}

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        deal={selectedDeal}
        contacts={contacts}
        onSave={handleDealSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDealToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete "${dealToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Excel Import Modal */}
      <ExcelUpload
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
        columnMappings={EXCEL_COLUMN_MAPPINGS}
        title="Import Deals"
        description="Upload an Excel or CSV file to import deals."
        templateDownload={handleDownloadTemplate}
      />
    </div>
  )
}
