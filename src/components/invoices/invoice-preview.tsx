'use client'

import { X, Download, Printer, MessageSquare } from 'lucide-react'
import type { Invoice, Contact } from '@/types/database'

type InvoiceWithContact = Invoice & { contacts: Pick<Contact, 'id' | 'name' | 'phone' | 'email'> | null }

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

interface InvoicePreviewProps {
  invoice: InvoiceWithContact
  onClose: () => void
}

export function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  const items = (invoice.items as unknown as InvoiceItem[]) || []

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    if (!invoice.contacts?.phone) return

    const phone = invoice.contacts.phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Hi ${invoice.contacts.name},\n\nHere is your invoice ${invoice.invoice_number} for $${invoice.total?.toFixed(2)}.\n\nDue date: ${new Date(invoice.due_date).toLocaleDateString()}\n\nThank you for your business!`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 print:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static print:block">
        <div className="bg-white dark:bg-gray-900 print:dark:bg-white rounded-2xl print:rounded-none w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl print:max-w-none print:max-h-none print:shadow-none">
          {/* Header - Hidden on print */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 print:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Invoice Preview
            </h2>
            <div className="flex items-center gap-2">
              {invoice.contacts?.phone && (
                <button
                  onClick={handleWhatsApp}
                  className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                  title="Send via WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="p-8 print:p-12 print:text-black">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white print:text-black">
                  INVOICE
                </h1>
                <p className="text-gray-500 print:text-gray-600">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white print:text-black">FlowDesk</p>
                <p className="text-sm text-gray-500 print:text-gray-600">Your Company Address</p>
                <p className="text-sm text-gray-500 print:text-gray-600">contact@flowdesk.com</p>
              </div>
            </div>

            {/* Dates and Customer */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-gray-500 print:text-gray-600 mb-1">Bill To</p>
                <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                  {invoice.contacts?.name || 'N/A'}
                </p>
                {invoice.contacts?.email && (
                  <p className="text-sm text-gray-500 print:text-gray-600">{invoice.contacts.email}</p>
                )}
                {invoice.contacts?.phone && (
                  <p className="text-sm text-gray-500 print:text-gray-600">{invoice.contacts.phone}</p>
                )}
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-sm text-gray-500 print:text-gray-600">Invoice Date</p>
                  <p className="font-medium text-gray-900 dark:text-white print:text-black">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 print:text-gray-600">Due Date</p>
                  <p className="font-medium text-gray-900 dark:text-white print:text-black">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 print:border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500 print:text-gray-600">Description</th>
                  <th className="text-center py-3 text-sm font-medium text-gray-500 print:text-gray-600">Qty</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 print:text-gray-600">Price</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 print:text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 print:border-gray-100">
                    <td className="py-3 text-gray-900 dark:text-white print:text-black">{item.description}</td>
                    <td className="py-3 text-center text-gray-600 dark:text-gray-400 print:text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400 print:text-gray-600">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-gray-900 dark:text-white print:text-black">
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 print:text-gray-600">Subtotal</span>
                  <span className="text-gray-900 dark:text-white print:text-black">
                    ${invoice.amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 print:text-gray-600">Tax</span>
                  <span className="text-gray-900 dark:text-white print:text-black">
                    ${invoice.tax?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700 print:border-gray-200">
                  <span className="text-gray-900 dark:text-white print:text-black">Total</span>
                  <span className="text-gray-900 dark:text-white print:text-black">
                    ${invoice.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 print:border-gray-200">
                <p className="text-sm font-medium text-gray-500 print:text-gray-600 mb-1">Notes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                  {invoice.notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 print:border-gray-200 text-center">
              <p className="text-sm text-gray-500 print:text-gray-600">
                Thank you for your business!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
