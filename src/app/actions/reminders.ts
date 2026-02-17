'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { Reminder, ReminderPriority } from '@/types/database'

export async function getReminders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('reminders')
    .select('*, contacts(id, name, phone)')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching reminders:', error)
    return []
  }

  return data || []
}

export async function createReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const dueDate = formData.get('due_date') as string
  const priority = (formData.get('priority') as ReminderPriority) || 'medium'
  const contactId = formData.get('contact_id') as string
  const dealId = formData.get('deal_id') as string

  if (!title || !dueDate) {
    return { error: 'Title and due date are required' }
  }

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      due_date: dueDate,
      priority,
      contact_id: contactId || null,
      deal_id: dealId || null,
      is_completed: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating reminder:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/reminders')
  return { success: true, data }
}

export async function updateReminder(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const dueDate = formData.get('due_date') as string
  const priority = formData.get('priority') as ReminderPriority
  const contactId = formData.get('contact_id') as string

  if (!title || !dueDate) {
    return { error: 'Title and due date are required' }
  }

  const { error } = await supabase
    .from('reminders')
    .update({
      title,
      description: description || null,
      due_date: dueDate,
      priority,
      contact_id: contactId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating reminder:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/reminders')
  return { success: true }
}

export async function toggleReminderComplete(id: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('reminders')
    .update({
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error toggling reminder:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/reminders')
  return { success: true }
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting reminder:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/reminders')
  return { success: true }
}
