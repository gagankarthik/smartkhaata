'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { Contact } from '@/types/database'

export async function getContacts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }

  return data || []
}

export async function getContact(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching contact:', error)
    return null
  }

  return data
}

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const company = formData.get('company') as string
  const notes = formData.get('notes') as string
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : []

  if (!name || !phone) {
    return { error: 'Name and phone are required' }
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      user_id: user.id,
      name,
      email: email || null,
      phone,
      whatsapp: whatsapp || phone,
      company: company || null,
      notes: notes || null,
      tags,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating contact:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/contacts')
  return { success: true, data }
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const company = formData.get('company') as string
  const notes = formData.get('notes') as string
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : []

  if (!name || !phone) {
    return { error: 'Name and phone are required' }
  }

  const { error } = await supabase
    .from('contacts')
    .update({
      name,
      email: email || null,
      phone,
      whatsapp: whatsapp || phone,
      company: company || null,
      notes: notes || null,
      tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating contact:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/contacts')
  return { success: true }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting contact:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/contacts')
  return { success: true }
}

export async function searchContacts(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`)
    .order('name', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Error searching contacts:', error)
    return []
  }

  return data || []
}
