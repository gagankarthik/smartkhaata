'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { Invoice, InvoiceStatus } from '@/types/database'

export async function getInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('invoices')
    .select('*, contacts(id, name, phone, email)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data || []
}

export async function getInvoice(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('invoices')
    .select('*, contacts(id, name, phone, email, company)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching invoice:', error)
    return null
  }

  return data
}

export async function generateInvoiceNumber() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'INV-001'

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const nextNumber = (count || 0) + 1
  return `INV-${nextNumber.toString().padStart(3, '0')}`
}

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const invoiceNumber = formData.get('invoice_number') as string
  const contactId = formData.get('contact_id') as string
  const dealId = formData.get('deal_id') as string
  const dueDate = formData.get('due_date') as string
  const status = (formData.get('status') as InvoiceStatus) || 'draft'
  const notes = formData.get('notes') as string
  const itemsJson = formData.get('items') as string

  let items = []
  try {
    items = JSON.parse(itemsJson)
  } catch {
    items = []
  }

  const amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
  const taxRate = parseFloat(formData.get('tax_rate') as string) || 0
  const tax = amount * (taxRate / 100)
  const total = amount + tax

  if (!invoiceNumber || !dueDate) {
    return { error: 'Invoice number and due date are required' }
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      contact_id: contactId || null,
      deal_id: dealId || null,
      amount,
      tax,
      total,
      status,
      due_date: dueDate,
      items,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invoice:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true, data }
}

export async function updateInvoice(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const contactId = formData.get('contact_id') as string
  const dueDate = formData.get('due_date') as string
  const status = formData.get('status') as InvoiceStatus
  const notes = formData.get('notes') as string
  const itemsJson = formData.get('items') as string

  let items = []
  try {
    items = JSON.parse(itemsJson)
  } catch {
    items = []
  }

  const amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
  const taxRate = parseFloat(formData.get('tax_rate') as string) || 0
  const tax = amount * (taxRate / 100)
  const total = amount + tax

  const { error } = await supabase
    .from('invoices')
    .update({
      contact_id: contactId || null,
      amount,
      tax,
      total,
      status,
      due_date: dueDate,
      items,
      notes: notes || null,
      paid_date: status === 'paid' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating invoice:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('invoices')
    .update({
      status,
      paid_date: status === 'paid' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating invoice status:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true }
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting invoice:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true }
}
