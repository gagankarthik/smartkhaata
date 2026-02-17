"use client"

import * as React from "react"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Ticket,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { createClient } from "@/utils/supabase/client"

const chartConfig = {
  deals: {
    label: "Deals",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  invoices: {
    label: "Invoices",
    color: "hsl(var(--chart-3))",
  },
  contacts: {
    label: "Contacts",
    color: "hsl(var(--chart-4))",
  },
  tickets: {
    label: "Tickets",
    color: "hsl(var(--chart-5))",
  },
  won: {
    label: "Won",
    color: "hsl(142, 76%, 36%)",
  },
  lost: {
    label: "Lost",
    color: "hsl(0, 84%, 60%)",
  },
  new: {
    label: "New",
    color: "hsl(217, 91%, 60%)",
  },
  negotiating: {
    label: "Negotiating",
    color: "hsl(262, 83%, 58%)",
  },
  quoted: {
    label: "Quoted",
    color: "hsl(45, 93%, 47%)",
  },
} satisfies ChartConfig

const DEAL_COLORS = {
  new: "#3b82f6",
  quoted: "#eab308",
  negotiating: "#8b5cf6",
  won: "#22c55e",
  lost: "#ef4444",
}

const TICKET_COLORS = {
  open: "#3b82f6",
  in_progress: "#eab308",
  waiting: "#8b5cf6",
  resolved: "#22c55e",
  closed: "#6b7280",
}

const INVOICE_COLORS = {
  draft: "#6b7280",
  sent: "#3b82f6",
  paid: "#22c55e",
  overdue: "#ef4444",
  cancelled: "#f97316",
}

export default function ReportsPage() {
  const [loading, setLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState("30d")
  const [stats, setStats] = React.useState({
    totalDeals: 0,
    totalRevenue: 0,
    totalContacts: 0,
    totalInvoices: 0,
    totalTickets: 0,
    dealGrowth: 0,
    revenueGrowth: 0,
    contactGrowth: 0,
  })
  const [monthlyData, setMonthlyData] = React.useState<any[]>([])
  const [dealsByStatus, setDealsByStatus] = React.useState<any[]>([])
  const [invoicesByStatus, setInvoicesByStatus] = React.useState<any[]>([])
  const [ticketsByStatus, setTicketsByStatus] = React.useState<any[]>([])
  const [ticketsByCategory, setTicketsByCategory] = React.useState<any[]>([])

  const supabase = createClient()

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const prevStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // Fetch all data
    const [dealsRes, contactsRes, invoicesRes, ticketsRes] = await Promise.all([
      supabase.from("deals").select("*").eq("user_id", user.id),
      supabase.from("contacts").select("*").eq("user_id", user.id),
      supabase.from("invoices").select("*").eq("user_id", user.id),
      supabase.from("tickets").select("*").eq("user_id", user.id),
    ])

    const deals = dealsRes.data || []
    const contacts = contactsRes.data || []
    const invoices = invoicesRes.data || []
    const tickets = ticketsRes.data || []

    // Calculate current period stats
    const currentDeals = deals.filter(d => new Date(d.created_at) >= startDate)
    const prevDeals = deals.filter(d => new Date(d.created_at) >= prevStartDate && new Date(d.created_at) < startDate)

    const currentRevenue = deals.filter(d => d.status === "won" && new Date(d.created_at) >= startDate).reduce((sum, d) => sum + (d.value || 0), 0)
    const prevRevenue = deals.filter(d => d.status === "won" && new Date(d.created_at) >= prevStartDate && new Date(d.created_at) < startDate).reduce((sum, d) => sum + (d.value || 0), 0)

    const currentContacts = contacts.filter(c => new Date(c.created_at) >= startDate)
    const prevContacts = contacts.filter(c => new Date(c.created_at) >= prevStartDate && new Date(c.created_at) < startDate)

    const calcGrowth = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0
      return Math.round(((current - prev) / prev) * 100)
    }

    setStats({
      totalDeals: deals.length,
      totalRevenue: deals.filter(d => d.status === "won").reduce((sum, d) => sum + (d.value || 0), 0),
      totalContacts: contacts.length,
      totalInvoices: invoices.length,
      totalTickets: tickets.length,
      dealGrowth: calcGrowth(currentDeals.length, prevDeals.length),
      revenueGrowth: calcGrowth(currentRevenue, prevRevenue),
      contactGrowth: calcGrowth(currentContacts.length, prevContacts.length),
    })

    // Generate monthly data for the last 6 months
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = date.toLocaleString('default', { month: 'short' })

      const monthDeals = deals.filter(d => {
        const created = new Date(d.created_at)
        return created >= date && created <= monthEnd
      })

      const monthRevenue = monthDeals.filter(d => d.status === "won").reduce((sum, d) => sum + (d.value || 0), 0)
      const monthContacts = contacts.filter(c => {
        const created = new Date(c.created_at)
        return created >= date && created <= monthEnd
      }).length

      const monthInvoices = invoices.filter(inv => {
        const created = new Date(inv.created_at)
        return created >= date && created <= monthEnd
      }).length

      months.push({
        month: monthName,
        deals: monthDeals.length,
        revenue: monthRevenue,
        contacts: monthContacts,
        invoices: monthInvoices,
      })
    }
    setMonthlyData(months)

    // Deals by status
    const statusCounts: Record<string, number> = {}
    deals.forEach(d => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
    })
    setDealsByStatus(Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      fill: DEAL_COLORS[status as keyof typeof DEAL_COLORS] || "#6b7280",
    })))

    // Invoices by status
    const invoiceStatusCounts: Record<string, number> = {}
    invoices.forEach(inv => {
      invoiceStatusCounts[inv.status] = (invoiceStatusCounts[inv.status] || 0) + 1
    })
    setInvoicesByStatus(Object.entries(invoiceStatusCounts).map(([status, count]) => ({
      status,
      count,
      fill: INVOICE_COLORS[status as keyof typeof INVOICE_COLORS] || "#6b7280",
    })))

    // Tickets by status
    const ticketStatusCounts: Record<string, number> = {}
    tickets.forEach(t => {
      ticketStatusCounts[t.status] = (ticketStatusCounts[t.status] || 0) + 1
    })
    setTicketsByStatus(Object.entries(ticketStatusCounts).map(([status, count]) => ({
      status: status.replace("_", " "),
      count,
      fill: TICKET_COLORS[status as keyof typeof TICKET_COLORS] || "#6b7280",
    })))

    // Tickets by category
    const categoryCounts: Record<string, number> = {}
    tickets.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
    })
    setTicketsByCategory(Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    })))

    setLoading(false)
  }, [timeRange])

  React.useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track your business performance and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-xs ${stats.dealGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.dealGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stats.dealGrowth)}%
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">{stats.totalDeals}</p>
              <p className="text-xs text-muted-foreground">Total Deals</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className={`flex items-center gap-1 text-xs ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stats.revenueGrowth)}%
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className={`flex items-center gap-1 text-xs ${stats.contactGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.contactGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stats.contactGrowth)}%
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">{stats.totalContacts}</p>
              <p className="text-xs text-muted-foreground">Total Contacts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">{stats.totalTickets}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={monthlyData} accessibilityLayer>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${Number(value).toLocaleString()}`} />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#fillRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Deals & Contacts Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Deals & Contacts</CardTitle>
            <CardDescription>Monthly deals and contacts over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="deals" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contacts" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deals by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Deals by Status</CardTitle>
            <CardDescription>Distribution of deals across statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie
                  data={dealsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {dealsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {dealsByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-muted-foreground capitalize">{item.status}: {item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices by Status</CardTitle>
            <CardDescription>Distribution of invoices across statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie
                  data={invoicesByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {invoicesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {invoicesByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-muted-foreground capitalize">{item.status}: {item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Distribution of support tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie
                  data={ticketsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {ticketsByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-muted-foreground capitalize">{item.status}: {item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets by Category */}
      {ticketsByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Category</CardTitle>
            <CardDescription>Breakdown of support tickets by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={ticketsByCategory} layout="vertical" accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
