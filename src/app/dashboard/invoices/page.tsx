'use client'

import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus,
  FileText,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Send,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { InvoiceModal } from '@/components/invoices/invoice-modal'
import { InvoicePreview } from '@/components/invoices/invoice-preview'
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
import type { Invoice, InvoiceStatus, Contact } from '@/types/database'

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FileText },
  sent: { label: 'Sent', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Send },
  paid: { label: 'Paid', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bgColor: 'bg-gray-100', icon: Clock },
}

type InvoiceWithContact = Invoice & { contacts: Pick<Contact, 'id' | 'name' | 'phone' | 'email'> | null }

const EXCEL_COLUMN_MAPPINGS: ColumnMapping[] = [
  { excelColumn: 'Invoice Number', dbColumn: 'invoice_number', label: 'Invoice #', required: true },
  { excelColumn: 'Amount', dbColumn: 'amount', label: 'Amount', transform: (v) => Number(v) || 0 },
  { excelColumn: 'Tax', dbColumn: 'tax', label: 'Tax', transform: (v) => Number(v) || 0 },
  { excelColumn: 'Due Date', dbColumn: 'due_date', label: 'Due Date', required: true },
  { excelColumn: 'Status', dbColumn: 'status', label: 'Status' },
  { excelColumn: 'Notes', dbColumn: 'notes', label: 'Notes' },
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithContact[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithContact | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithContact | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceWithContact | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchInvoices()
    fetchContacts()
  }, [])

  async function fetchInvoices() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('invoices')
      .select('*, contacts(id, name, phone, email)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
    } else {
      setInvoices(data || [])
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

  const handleEdit = (invoice: InvoiceWithContact) => {
    setSelectedInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
    const { error } = await supabase
      .from('invoices')
      .update({
        status,
        paid_date: status === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    if (error) {
      console.error('Error updating invoice status:', error)
    } else {
      setInvoices(invoices.map(i =>
        i.id === invoiceId
          ? { ...i, status, paid_date: status === 'paid' ? new Date().toISOString() : null }
          : i
      ))
    }
  }

  const handleDelete = async () => {
    if (!invoiceToDelete) return

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceToDelete.id)

    if (error) {
      console.error('Error deleting invoice:', error)
    } else {
      setInvoices(invoices.filter(i => i.id !== invoiceToDelete.id))
    }
    setDeleteModalOpen(false)
    setInvoiceToDelete(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedInvoice(null)
  }

  const handleInvoiceSaved = () => {
    fetchInvoices()
    handleModalClose()
  }

  const handleImport = async (data: Record<string, any>[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const invoicesToInsert = data.map((row) => ({
      user_id: user.id,
      invoice_number: row.invoice_number,
      amount: row.amount || 0,
      tax: row.tax || 0,
      total: (row.amount || 0) + (row.tax || 0),
      due_date: row.due_date,
      status: (['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : 'draft') as InvoiceStatus,
      notes: row.notes || null,
      items: [],
    }))

    const { error } = await supabase.from('invoices').insert(invoicesToInsert)
    if (error) throw new Error(error.message)
    await fetchInvoices()
  }

  const handleExport = () => {
    exportToExcel(
      invoices.map(i => ({
        ...i,
        customer_name: i.contacts?.name || '',
      })),
      [
        { key: 'invoice_number', label: 'Invoice #' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'amount', label: 'Amount' },
        { key: 'tax', label: 'Tax' },
        { key: 'total', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'due_date', label: 'Due Date' },
      ],
      'invoices'
    )
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(
      [
        { label: 'Invoice Number', example: 'INV-001' },
        { label: 'Amount', example: '1000' },
        { label: 'Tax', example: '100' },
        { label: 'Due Date', example: '2024-03-15' },
        { label: 'Status', example: 'draft' },
        { label: 'Notes', example: 'Payment terms: Net 30' },
      ],
      'invoices'
    )
  }

  const totalPending = invoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total || 0), 0)

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (i.total || 0), 0)

  const getStatusBadge = (status: InvoiceStatus) => {
    const config = STATUS_CONFIG[status]
    const Icon = config.icon
    return (
      <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0 gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<InvoiceWithContact>[] = [
    {
      accessorKey: 'invoice_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.invoice_number}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.original.created_at).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'contacts',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) =>
        row.original.contacts ? (
          <div>
            <p className="text-sm font-medium">{row.original.contacts.name}</p>
            {row.original.contacts.email && (
              <p className="text-xs text-muted-foreground">{row.original.contacts.email}</p>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" className="text-right" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-semibold text-foreground">
          ${row.original.total?.toLocaleString() || 0}
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
      accessorKey: 'due_date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.due_date).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <DataTableRowActions>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewInvoice(invoice)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {invoice.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleUpdateStatus(invoice.id, 'sent')}>
                    <Send className="mr-2 h-4 w-4" />
                    Mark as Sent
                  </DropdownMenuItem>
                )}
                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                  <DropdownMenuItem onClick={() => handleUpdateStatus(invoice.id, 'paid')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    setInvoiceToDelete(invoice)
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
          <h1 className="text-xl font-semibold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage your invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={invoices.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Invoices</p>
          <p className="text-xl font-semibold text-foreground">{invoices.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Pending Amount</p>
          <p className="text-xl font-semibold text-amber-600">${totalPending.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Paid Amount</p>
          <p className="text-xl font-semibold text-green-600">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Overdue</p>
          <p className="text-xl font-semibold text-red-600">
            {invoices.filter(i => i.status === 'overdue').length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
          </div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">No invoices yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first invoice to get started.
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          searchKey="invoice_number"
          searchPlaceholder="Search invoices..."
        />
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        invoice={selectedInvoice}
        contacts={contacts}
        onSave={handleInvoiceSaved}
      />

      {/* Invoice Preview */}
      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setInvoiceToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${invoiceToDelete?.invoice_number}"? This action cannot be undone.`}
      />

      {/* Excel Import Modal */}
      <ExcelUpload
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
        columnMappings={EXCEL_COLUMN_MAPPINGS}
        title="Import Invoices"
        description="Upload an Excel or CSV file to import invoices."
        templateDownload={handleDownloadTemplate}
      />
    </div>
  )
}
