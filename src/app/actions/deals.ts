'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { Deal, DealStatus } from '@/types/database'

export async function getDeals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('deals')
    .select('*, contacts(id, name, phone, email)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching deals:', error)
    return []
  }

  return data || []
}

export async function getDeal(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('deals')
    .select('*, contacts(id, name, phone, email)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching deal:', error)
    return null
  }

  return data
}

export async function createDeal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const value = parseFloat(formData.get('value') as string) || 0
  const status = (formData.get('status') as DealStatus) || 'new'
  const contactId = formData.get('contact_id') as string
  const description = formData.get('description') as string
  const expectedCloseDate = formData.get('expected_close_date') as string

  if (!title) {
    return { error: 'Title is required' }
  }

  const { data, error } = await supabase
    .from('deals')
    .insert({
      user_id: user.id,
      title,
      value,
      status,
      contact_id: contactId || null,
      description: description || null,
      expected_close_date: expectedCloseDate || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating deal:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/deals')
  return { success: true, data }
}

export async function updateDeal(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const value = parseFloat(formData.get('value') as string) || 0
  const status = formData.get('status') as DealStatus
  const contactId = formData.get('contact_id') as string
  const description = formData.get('description') as string
  const expectedCloseDate = formData.get('expected_close_date') as string

  if (!title) {
    return { error: 'Title is required' }
  }

  const { error } = await supabase
    .from('deals')
    .update({
      title,
      value,
      status,
      contact_id: contactId || null,
      description: description || null,
      expected_close_date: expectedCloseDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating deal:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/deals')
  return { success: true }
}

export async function updateDealStatus(id: string, status: DealStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('deals')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating deal status:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/deals')
  return { success: true }
}

export async function deleteDeal(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting deal:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/deals')
  return { success: true }
}
