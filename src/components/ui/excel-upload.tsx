"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import { Upload, FileSpreadsheet, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface ColumnMapping {
  excelColumn: string
  dbColumn: string
  label: string
  required?: boolean
  transform?: (value: any) => any
}

interface ExcelUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: Record<string, any>[]) => Promise<void>
  columnMappings: ColumnMapping[]
  title?: string
  description?: string
  templateDownload?: () => void
}

export function ExcelUpload({
  open,
  onOpenChange,
  onImport,
  columnMappings,
  title = "Import from Excel",
  description = "Upload an Excel file (.xlsx, .xls) or CSV to import data.",
  templateDownload,
}: ExcelUploadProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [previewData, setPreviewData] = React.useState<Record<string, any>[]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [mappings, setMappings] = React.useState<Record<string, string>>({})
  const [step, setStep] = React.useState<"upload" | "mapping" | "preview">("upload")
  const [importing, setImporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError(null)
    setFile(selectedFile)

    try {
      const data = await readExcelFile(selectedFile)
      if (data.length === 0) {
        setError("The file appears to be empty.")
        return
      }

      const fileHeaders = Object.keys(data[0])
      setHeaders(fileHeaders)
      setPreviewData(data)

      // Auto-map columns based on similarity
      const autoMappings: Record<string, string> = {}
      columnMappings.forEach((mapping) => {
        const matchingHeader = fileHeaders.find(
          (h) =>
            h.toLowerCase() === mapping.excelColumn.toLowerCase() ||
            h.toLowerCase() === mapping.label.toLowerCase() ||
            h.toLowerCase().includes(mapping.dbColumn.toLowerCase())
        )
        if (matchingHeader) {
          autoMappings[mapping.dbColumn] = matchingHeader
        }
      })
      setMappings(autoMappings)
      setStep("mapping")
    } catch (err) {
      setError("Failed to read the file. Please ensure it's a valid Excel or CSV file.")
    }
  }

  const readExcelFile = (file: File): Promise<Record<string, any>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)
          resolve(jsonData as Record<string, any>[])
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsBinaryString(file)
    })
  }

  const handleMappingChange = (dbColumn: string, excelColumn: string) => {
    setMappings((prev) => ({ ...prev, [dbColumn]: excelColumn }))
  }

  const validateMappings = () => {
    const missingRequired = columnMappings
      .filter((m) => m.required && !mappings[m.dbColumn])
      .map((m) => m.label)

    if (missingRequired.length > 0) {
      setError(`Please map required fields: ${missingRequired.join(", ")}`)
      return false
    }
    return true
  }

  const getMappedData = (): Record<string, any>[] => {
    return previewData.map((row) => {
      const mappedRow: Record<string, any> = {}
      columnMappings.forEach((mapping) => {
        const excelColumn = mappings[mapping.dbColumn]
        if (excelColumn && row[excelColumn] !== undefined) {
          let value = row[excelColumn]
          if (mapping.transform) {
            value = mapping.transform(value)
          }
          mappedRow[mapping.dbColumn] = value
        }
      })
      return mappedRow
    })
  }

  const handlePreview = () => {
    if (validateMappings()) {
      setStep("preview")
      setError(null)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    try {
      const mappedData = getMappedData()
      await onImport(mappedData)
      handleClose()
    } catch (err: any) {
      setError(err.message || "Failed to import data. Please try again.")
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setHeaders([])
    setMappings({})
    setStep("upload")
    setError(null)
    onOpenChange(false)
  }

  const mappedPreviewData = step === "preview" ? getMappedData().slice(0, 5) : []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-4">
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 hover:border-muted-foreground/50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Excel (.xlsx, .xls) or CSV files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {templateDownload && (
                <div className="text-center">
                  <Button variant="link" size="sm" onClick={templateDownload}>
                    Download template file
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                <span>File loaded: {file?.name}</span>
                <span className="text-muted-foreground/50">({previewData.length} rows)</span>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Map your columns</p>
                {columnMappings.map((mapping) => (
                  <div
                    key={mapping.dbColumn}
                    className="flex items-center gap-4 rounded-lg border bg-card p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {mapping.label}
                        {mapping.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </p>
                    </div>
                    <select
                      value={mappings[mapping.dbColumn] || ""}
                      onChange={(e) => handleMappingChange(mapping.dbColumn, e.target.value)}
                      className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select column...</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Preview of first 5 rows to be imported:
              </p>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnMappings
                        .filter((m) => mappings[m.dbColumn])
                        .map((m) => (
                          <TableHead key={m.dbColumn} className="whitespace-nowrap">
                            {m.label}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedPreviewData.map((row, i) => (
                      <TableRow key={i}>
                        {columnMappings
                          .filter((m) => mappings[m.dbColumn])
                          .map((m) => (
                            <TableCell key={m.dbColumn} className="whitespace-nowrap">
                              {String(row[m.dbColumn] ?? "-")}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground">
                Total rows to import: <strong>{previewData.length}</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step !== "upload" && (
            <Button
              variant="outline"
              onClick={() => setStep(step === "preview" ? "mapping" : "upload")}
            >
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === "mapping" && (
            <Button onClick={handlePreview}>Preview Import</Button>
          )}
          {step === "preview" && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : `Import ${previewData.length} rows`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Utility function to export data to Excel
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
) {
  const exportData = data.map((row) => {
    const exportRow: Record<string, any> = {}
    columns.forEach((col) => {
      exportRow[col.label] = row[col.key]
    })
    return exportRow
  })

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Utility function to download a template
export function downloadTemplate(
  columns: { label: string; example?: string }[],
  filename: string
) {
  const templateData = [
    columns.reduce((acc, col) => {
      acc[col.label] = col.example || ""
      return acc
    }, {} as Record<string, string>),
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
  XLSX.writeFile(workbook, `${filename}_template.xlsx`)
}
