'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, AlertCircle, Check, Loader2 } from 'lucide-react'
import { readFileAsText, parseContactsFromCSV, parseDealsFromCSV } from '@/lib/excel'
import { createClient } from '@/utils/supabase/client'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'contacts' | 'deals'
  onSuccess: () => void
}

export function ImportModal({ isOpen, onClose, type, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    setError('')

    try {
      const content = await readFileAsText(selectedFile)
      const parsed = type === 'contacts'
        ? parseContactsFromCSV(content)
        : parseDealsFromCSV(content)

      if (parsed.length === 0) {
        setError('No valid records found in the file')
        return
      }

      setPreview(parsed.slice(0, 5))
    } catch (err) {
      setError('Failed to parse file')
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const content = await readFileAsText(file)

      if (type === 'contacts') {
        const contacts = parseContactsFromCSV(content)
        const contactsWithUser = contacts.map(c => ({
          ...c,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { error: insertError } = await supabase
          .from('contacts')
          .insert(contactsWithUser)

        if (insertError) throw insertError
      } else {
        const deals = parseDealsFromCSV(content)
        const dealsWithUser = deals.map(d => ({
          ...d,
          user_id: user.id,
          status: d.status || 'new',
          value: d.value || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { error: insertError } = await supabase
          .from('deals')
          .insert(dealsWithUser)

        if (insertError) throw insertError
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import {type === 'contacts' ? 'Contacts' : 'Deals'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* File Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-indigo-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-1">CSV files only</p>
                </>
              )}
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview ({preview.length} records shown)
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-40 overflow-auto">
                  {preview.map((item, i) => (
                    <div key={i} className="text-sm text-gray-600 dark:text-gray-400 py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      {type === 'contacts'
                        ? `${item.name} - ${item.phone}`
                        : `${item.title} - $${item.value || 0}`
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                CSV Format
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {type === 'contacts'
                  ? 'Required columns: Name, Phone. Optional: Email, WhatsApp, Company, Tags, Notes'
                  : 'Required columns: Title. Optional: Value, Status, Description, Expected Close Date'
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
