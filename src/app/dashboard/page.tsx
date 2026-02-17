import { createClient } from '@/utils/supabase/server'
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

async function getStats(userId: string) {
  const supabase = await createClient()

  const [contacts, deals, invoices, reminders] = await Promise.all([
    supabase.from('contacts').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('deals').select('id, value, status', { count: 'exact' }).eq('user_id', userId),
    supabase.from('invoices').select('id, total, status', { count: 'exact' }).eq('user_id', userId),
    supabase.from('reminders').select('id, is_completed', { count: 'exact' }).eq('user_id', userId).eq('is_completed', false),
  ])

  const totalContacts = contacts.count || 0
  const totalDeals = deals.count || 0
  const dealValue = deals.data?.reduce((sum, d) => sum + (d.value || 0), 0) || 0
  const wonDeals = deals.data?.filter(d => d.status === 'won').length || 0
  const totalInvoices = invoices.count || 0
  const paidInvoices = invoices.data?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0) || 0
  const pendingReminders = reminders.count || 0

  return {
    totalContacts,
    totalDeals,
    dealValue,
    wonDeals,
    totalInvoices,
    paidInvoices,
    pendingReminders
  }
}

async function getRecentActivity(userId: string) {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return activities || []
}

async function getUpcomingReminders(userId: string) {
  const supabase = await createClient()

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*, contacts(name)')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .gte('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })
    .limit(5)

  return reminders || []
}

async function getRecentDeals(userId: string) {
  const supabase = await createClient()

  const { data: deals } = await supabase
    .from('deals')
    .select('*, contacts(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return deals || []
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const stats = await getStats(user.id)
  const recentDeals = await getRecentDeals(user.id)
  const upcomingReminders = await getUpcomingReminders(user.id)

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts.toString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Deal Pipeline',
      value: `$${stats.dealValue.toLocaleString()}`,
      change: `${stats.wonDeals} won`,
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Invoices Paid',
      value: `$${stats.paidInvoices.toLocaleString()}`,
      change: `${stats.totalInvoices} total`,
      trend: 'up',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingReminders.toString(),
      change: 'due soon',
      trend: 'neutral',
      icon: Clock,
      color: 'bg-orange-500'
    },
  ]

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    quoted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    negotiating: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-card rounded-xl p-5 border border-border shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === 'up' && (
                  <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                )}
                {stat.trend === 'down' && (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Deals */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Deals</h2>
            <Link
              href="/dashboard/deals"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentDeals.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No deals yet. <Link href="/dashboard/deals" className="text-primary hover:underline">Create your first deal</Link>
              </div>
            ) : (
              recentDeals.map((deal: any) => (
                <div key={deal.id} className="p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">{deal.contacts?.name || 'No contact'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ${deal.value?.toLocaleString() || 0}
                      </p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[deal.status] || statusColors.new}`}>
                        {deal.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Upcoming Reminders</h2>
            <Link
              href="/dashboard/reminders"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingReminders.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No upcoming reminders. <Link href="/dashboard/reminders" className="text-primary hover:underline">Create a reminder</Link>
              </div>
            ) : (
              upcomingReminders.map((reminder: any) => (
                <div key={reminder.id} className="p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                      reminder.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                      reminder.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      <Clock className={`w-3.5 h-3.5 ${
                        reminder.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                        reminder.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                        'text-emerald-600 dark:text-emerald-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{reminder.description || 'No description'}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        Due: {new Date(reminder.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary rounded-xl p-5 text-primary-foreground">
        <h3 className="text-sm font-semibold mb-1">Quick Actions</h3>
        <p className="text-primary-foreground/70 text-xs mb-3">Get started with common tasks</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/contacts?action=new"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-colors"
          >
            + Add Contact
          </Link>
          <Link
            href="/dashboard/deals?action=new"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-colors"
          >
            + Create Deal
          </Link>
          <Link
            href="/dashboard/invoices?action=new"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-colors"
          >
            + New Invoice
          </Link>
          <Link
            href="/dashboard/reminders?action=new"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-colors"
          >
            + Set Reminder
          </Link>
        </div>
      </div>
    </div>
  )
}
