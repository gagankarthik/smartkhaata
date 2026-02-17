'use client'

import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus,
  Phone,
  Mail,
  Building2,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare,
  Upload,
  Download,
  Users,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ContactModal } from '@/components/contacts/contact-modal'
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
import type { Contact } from '@/types/database'

const EXCEL_COLUMN_MAPPINGS: ColumnMapping[] = [
  { excelColumn: 'Name', dbColumn: 'name', label: 'Name', required: true },
  { excelColumn: 'Phone', dbColumn: 'phone', label: 'Phone', required: true },
  { excelColumn: 'Email', dbColumn: 'email', label: 'Email' },
  { excelColumn: 'WhatsApp', dbColumn: 'whatsapp', label: 'WhatsApp' },
  { excelColumn: 'Company', dbColumn: 'company', label: 'Company' },
  { excelColumn: 'Notes', dbColumn: 'notes', label: 'Notes' },
  {
    excelColumn: 'Tags',
    dbColumn: 'tags',
    label: 'Tags',
    transform: (value: string) =>
      value ? value.split(',').map((t: string) => t.trim()) : [],
  },
]

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contacts:', error)
    } else {
      setContacts(data || [])
    }
    setLoading(false)
  }

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!contactToDelete) return

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactToDelete.id)

    if (error) {
      console.error('Error deleting contact:', error)
    } else {
      setContacts(contacts.filter(c => c.id !== contactToDelete.id))
    }
    setDeleteModalOpen(false)
    setContactToDelete(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedContact(null)
  }

  const handleContactSaved = () => {
    fetchContacts()
    handleModalClose()
  }

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${formattedPhone}`, '_blank')
  }

  const handleImport = async (data: Record<string, any>[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const contactsToInsert = data.map((row) => ({
      user_id: user.id,
      name: row.name,
      phone: row.phone,
      email: row.email || null,
      whatsapp: row.whatsapp || null,
      company: row.company || null,
      notes: row.notes || null,
      tags: row.tags || [],
    }))

    const { error } = await supabase.from('contacts').insert(contactsToInsert)

    if (error) throw new Error(error.message)

    await fetchContacts()
  }

  const handleExport = () => {
    exportToExcel(
      contacts,
      [
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'company', label: 'Company' },
        { key: 'notes', label: 'Notes' },
      ],
      'contacts'
    )
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(
      [
        { label: 'Name', example: 'John Doe' },
        { label: 'Phone', example: '+1234567890' },
        { label: 'Email', example: 'john@example.com' },
        { label: 'WhatsApp', example: '+1234567890' },
        { label: 'Company', example: 'Acme Inc' },
        { label: 'Notes', example: 'Met at conference' },
        { label: 'Tags', example: 'client,vip' },
      ],
      'contacts'
    )
  }

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const contact = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-medium">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground">{contact.name}</p>
              {contact.company && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {contact.company}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <a
          href={`tel:${row.original.phone}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="h-3.5 w-3.5" />
          {row.original.phone}
        </a>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) =>
        row.original.email ? (
          <a
            href={`mailto:${row.original.email}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3.5 w-3.5" />
            {row.original.email}
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags || []
        if (tags.length === 0) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Added" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const contact = row.original
        return (
          <DataTableRowActions>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => openWhatsApp(contact.whatsapp || contact.phone)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(contact)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    setContactToDelete(contact)
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
          <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your customer contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={contacts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">No contacts yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first contact or importing from Excel.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={contacts}
          searchKey="name"
          searchPlaceholder="Search contacts..."
        />
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        contact={selectedContact}
        onSave={handleContactSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setContactToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete "${contactToDelete?.name}"? This action cannot be undone.`}
      />

      {/* Excel Import Modal */}
      <ExcelUpload
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
        columnMappings={EXCEL_COLUMN_MAPPINGS}
        title="Import Contacts"
        description="Upload an Excel or CSV file to import contacts."
        templateDownload={handleDownloadTemplate}
      />
    </div>
  )
}
