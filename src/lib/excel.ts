import type { Contact, Deal, Invoice } from '@/types/database'

// Export contacts to CSV
export function exportContactsToCSV(contacts: Contact[]): string {
  const headers = ['Name', 'Email', 'Phone', 'WhatsApp', 'Company', 'Tags', 'Notes', 'Created At']

  const rows = contacts.map(contact => [
    contact.name,
    contact.email || '',
    contact.phone,
    contact.whatsapp || '',
    contact.company || '',
    contact.tags?.join('; ') || '',
    contact.notes || '',
    new Date(contact.created_at).toLocaleDateString()
  ])

  return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n')
}

// Export deals to CSV
export function exportDealsToCSV(deals: (Deal & { contacts?: { name: string } | null })[]): string {
  const headers = ['Title', 'Contact', 'Value', 'Status', 'Description', 'Expected Close Date', 'Created At']

  const rows = deals.map(deal => [
    deal.title,
    deal.contacts?.name || '',
    deal.value?.toString() || '0',
    deal.status,
    deal.description || '',
    deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '',
    new Date(deal.created_at).toLocaleDateString()
  ])

  return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n')
}

// Export invoices to CSV
export function exportInvoicesToCSV(invoices: (Invoice & { contacts?: { name: string } | null })[]): string {
  const headers = ['Invoice Number', 'Customer', 'Amount', 'Tax', 'Total', 'Status', 'Due Date', 'Paid Date', 'Created At']

  const rows = invoices.map(invoice => [
    invoice.invoice_number,
    invoice.contacts?.name || '',
    invoice.amount?.toString() || '0',
    invoice.tax?.toString() || '0',
    invoice.total?.toString() || '0',
    invoice.status,
    new Date(invoice.due_date).toLocaleDateString(),
    invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString() : '',
    new Date(invoice.created_at).toLocaleDateString()
  ])

  return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n')
}

// Download CSV file
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Parse CSV content
export function parseCSV(content: string): string[][] {
  const lines = content.split('\n')
  const result: string[][] = []

  for (const line of lines) {
    if (!line.trim()) continue

    const row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    row.push(current.trim())
    result.push(row)
  }

  return result
}

// Parse contacts from CSV
export function parseContactsFromCSV(content: string): Partial<Contact>[] {
  const rows = parseCSV(content)
  if (rows.length < 2) return []

  const headers = rows[0].map(h => h.toLowerCase().trim())
  const contacts: Partial<Contact>[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const contact: Partial<Contact> = {}

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || ''

      if (header.includes('name') && !header.includes('company')) {
        contact.name = value
      } else if (header.includes('email')) {
        contact.email = value || null
      } else if (header.includes('phone') && !header.includes('whatsapp')) {
        contact.phone = value
      } else if (header.includes('whatsapp')) {
        contact.whatsapp = value || null
      } else if (header.includes('company')) {
        contact.company = value || null
      } else if (header.includes('tag')) {
        contact.tags = value ? value.split(';').map(t => t.trim()).filter(Boolean) : []
      } else if (header.includes('note')) {
        contact.notes = value || null
      }
    })

    if (contact.name && contact.phone) {
      contacts.push(contact)
    }
  }

  return contacts
}

// Parse deals from CSV
export function parseDealsFromCSV(content: string): Partial<Deal>[] {
  const rows = parseCSV(content)
  if (rows.length < 2) return []

  const headers = rows[0].map(h => h.toLowerCase().trim())
  const deals: Partial<Deal>[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const deal: Partial<Deal> = {}

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || ''

      if (header.includes('title')) {
        deal.title = value
      } else if (header.includes('value') || header.includes('amount')) {
        deal.value = parseFloat(value) || 0
      } else if (header.includes('status')) {
        const status = value.toLowerCase()
        if (['new', 'quoted', 'negotiating', 'won', 'lost'].includes(status)) {
          deal.status = status as Deal['status']
        }
      } else if (header.includes('description')) {
        deal.description = value || null
      } else if (header.includes('close') || header.includes('date')) {
        if (value) {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            deal.expected_close_date = date.toISOString()
          }
        }
      }
    })

    if (deal.title) {
      deals.push(deal)
    }
  }

  return deals
}

// Read file as text
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
