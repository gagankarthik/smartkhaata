"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  Star,
  MessageSquare,
  Users,
  Clock,
  FileText,
  Bell,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
  Repeat,
  TrendingUp,
  Moon,
  Sun,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  ChevronUp,
  Play,
  Database,
  Layout,
  Workflow,
  Shield,
  Puzzle,
  Code,
  Zap,
  Globe,
  Smartphone,
  Cloud,
  Layers,
  Grid,
  DollarSign
} from "lucide-react";

import Image from "next/image";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <>
      <head>
        <title>Smartkhaata - WhatsApp-first CRM for micro-businesses</title>
        <meta name="description" content="Replace Excel + WhatsApp chaos with simple deal tracking, follow-up reminders, and invoice syncing. Built for 1-5 person teams." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        .bg-grid-pattern {
          background-size: 32px 32px;
          background-image: 
            linear-gradient(to right, rgb(0 0 0 / 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.02) 1px, transparent 1px);
        }

        .dark .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgb(255 255 255 / 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(255 255 255 / 0.02) 1px, transparent 1px);
        }

        .card-shadow {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: box-shadow 0.2s ease;
        }

        .card-shadow:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        }

        .dark .card-shadow {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .dark .card-shadow:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .gradient-text {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .hover-lift {
          transition: transform 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .section-fade {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}</style>

      <main className={`min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        {/* Grid Background */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none"></div>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className=" flex items-center justify-center">
                  <Image src="/logo-text.svg" height={135} width={135} alt="Logo"/>
                </div>
                
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
                <a href="#about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">About</a>
                <a href="#docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Docs</a>
              </div>

              {/* Right Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-3">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800"
              >
                <div className="flex flex-col space-y-3">
                  <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 py-2">Features</a>
                  <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 py-2">Pricing</a>
                  <a href="#about" className="text-sm text-gray-600 dark:text-gray-400 py-2">About</a>
                  <a href="#docs" className="text-sm text-gray-600 dark:text-gray-400 py-2">Docs</a>
                  <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
                  <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 py-2">Log in</Link>
                  <Link href="/auth/signup" className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg text-center">
                    Get Started
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Hero Section - NocoBase Style */}
        <section className="pt-32 pb-24 px-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-800 mb-6">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">WhatsApp-first CRM</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-gray-900 dark:text-white mb-6">
                  The most <span className="gradient-text">simple</span> way
                  <br />
                  to close deals on WhatsApp
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  Replace Excel + WhatsApp chaos with deal tracking, follow-up reminders, and invoice syncing. 
                  Built for 1–5 person teams.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                  <Link href="/auth/signup" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link href="/demo" className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors inline-flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Demo
                  </Link>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Used by 1,000+ micro-businesses. No credit card required.
                </p>
              </motion.div>
            </div>

            {/* Dashboard Preview - NocoBase Style */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 relative"
            >
              <div className="relative mx-auto max-w-5xl">
                {/* Main Dashboard Card */}
                <div className="card-shadow rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Window Controls */}
                  <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Smartkaatha Dashboard</span>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Left Column - Chats */}
                      <div className="border-r border-gray-200 dark:border-gray-800 pr-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recent Chats</h3>
                          <span className="text-xs text-blue-600 dark:text-blue-400">12 new</span>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: "Sarah Chen", message: "Can you send the invoice?", time: "5m ago", active: true },
                            { name: "Michael R.", message: "Thanks for the quote!", time: "1h ago" },
                            { name: "Priya Patel", message: "When can you start?", time: "2h ago" },
                          ].map((chat, i) => (
                            <div key={i} className={`flex items-start space-x-2 p-2 rounded-lg ${chat.active ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{chat.name}</p>
                                  <span className="text-xs text-gray-500">{chat.time}</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{chat.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Middle Column - Deal Pipeline */}
                      <div className="border-r border-gray-200 dark:border-gray-800 pr-6">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Deal Pipeline</h3>
                        <div className="space-y-3">
                          {[
                            { stage: "Website Redesign", value: "$2,400", status: "Negotiation" },
                            { stage: "Consulting Package", value: "$1,200", status: "Proposal" },
                            { stage: "Maintenance Contract", value: "$800/mo", status: "New" },
                          ].map((deal, i) => (
                            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{deal.stage}</p>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">{deal.value}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{deal.status}</span>
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="w-2/3 h-full bg-blue-600 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Column - Quick Actions */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                          <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 inline mr-2" />
                            <span className="text-sm">Create Invoice</span>
                          </button>
                          <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 inline mr-2" />
                            <span className="text-sm">Add Customer</span>
                          </button>
                          <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 inline mr-2" />
                            <span className="text-sm">Set Reminder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-200 dark:bg-blue-900/30 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl -z-10"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Used By Section - NocoBase Style */}
        <section className="py-16 px-4 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center mb-8">Trusted by growing businesses worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {['Shopify', 'Xero', 'Stripe', 'Zapier', 'QuickBooks', 'WhatsApp'].map((company) => (
                <span key={company} className="text-lg font-medium text-gray-400 dark:text-gray-600">{company}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Step Process - NocoBase Style */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">3 steps to start closing deals</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Simple process, powerful results.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: MessageSquare, 
                  title: "Connect WhatsApp", 
                  description: "Link your WhatsApp Business account in one click",
                  step: "01"
                },
                { 
                  icon: Database, 
                  title: "Sync your data", 
                  description: "Import existing customers or start fresh",
                  step: "02"
                },
                { 
                  icon: TrendingUp, 
                  title: "Start closing", 
                  description: "Track deals, send invoices, get paid faster",
                  step: "03"
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center mb-4">
                      <step.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2 block">{step.step}</span>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/4 -right-4 text-gray-300 dark:text-gray-700">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Interactive Demo Note */}
            <div className="mt-12 text-center">
              <Link href="/demo" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline inline-flex items-center">
                Try it yourself
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Core Features - NocoBase Style */}
        <section id="features" className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">Core features</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Everything you need to run your business on WhatsApp.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: MessageSquare, title: "WhatsApp Native", description: "Work where your customers already are" },
                { icon: Layout, title: "Deal Pipeline", description: "Visual kanban for tracking opportunities" },
                { icon: FileText, title: "Smart Invoicing", description: "Create and send invoices from any chat" },
                { icon: Bell, title: "Follow-up Reminders", description: "Never miss a payment or follow-up" },
                { icon: Repeat, title: "Auto-sync", description: "Seamless integration with Xero & QuickBooks" },
                { icon: BarChart3, title: "Analytics", description: "Know exactly where your business stands" }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="card-shadow rounded-xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 hover-lift"
                >
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Smartkaatha - NocoBase Style Problem/Solution */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-6">Excel + WhatsApp = chaos</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Juggling spreadsheets and chats is killing your productivity. Here's what you're dealing with:
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Grid, text: "Lost deals falling through the cracks" },
                    { icon: Clock, text: "Hours wasted on manual follow-ups" },
                    { icon: FileText, text: "Endless copy-pasting from WhatsApp to Excel" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-50 dark:bg-red-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-6">Smartkaatha fixes that</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Simple tools that work together seamlessly:
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Check, text: "All deals tracked in one place" },
                    { icon: Check, text: "Automatic follow-up reminders" },
                    { icon: Check, text: "Invoices created directly from chats" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - NocoBase Style */}
        <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">Loved by micro-businesses</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Join 1,000+ teams saving time with Smartkaatha.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Smartkaatha saved us 15 hours a week on admin. Finally, a CRM that actually works for small teams.",
                  author: "Sarah Chen",
                  role: "Design Studio Owner",
                  rating: 5
                },
                {
                  quote: "The WhatsApp integration is seamless. I can manage deals and send invoices without leaving my chats.",
                  author: "Michael Rodriguez",
                  role: "Plumbing Contractor",
                  rating: 5
                },
                {
                  quote: "Simple, elegant, powerful. Everything we needed and nothing we didn't.",
                  author: "Priya Patel",
                  role: "Consulting Agency",
                  rating: 5
                }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="card-shadow rounded-xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - NocoBase Style */}
        <section id="pricing" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">No hidden fees. Cancel anytime.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="card-shadow rounded-xl bg-white dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Starter</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">For freelancers and solo entrepreneurs</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$9</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['WhatsApp integration', 'Basic deal pipeline', '5 invoices/month', 'Email support'].map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Start Free Trial
                </button>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="card-shadow rounded-xl bg-blue-600 p-8 border border-blue-700 relative"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white dark:bg-gray-900 rounded-full text-xs font-medium text-blue-600 border border-blue-200 dark:border-blue-800">
                  Most Popular
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Pro</h3>
                <p className="text-sm text-blue-200 mb-4">For growing small teams</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$19</span>
                  <span className="text-blue-200">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Starter', 'Advanced automations', 'Unlimited invoices', 'Team collaboration', 'Priority support'].map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-blue-100">
                      <Check className="w-4 h-4 mr-2 text-white" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full px-4 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Start Free Trial
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section - NocoBase Style */}
        <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">Ready for Smartkaatha?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Deploy a personalized demo in just 1 minute, or start your free trial—it's equally simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/signup" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Get Started
                  <ArrowRight className="inline ml-2 w-4 h-4" />
                </Link>
                <Link href="/demo" className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Live Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer - NocoBase Style */}
        <footer className="py-16 px-4 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center justify-center">
                  <Image src="/logo-text.svg" height={135} width={135} alt="Logo"/>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  WhatsApp-first CRM for micro-businesses.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Features</a></li>
                  <li><a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Pricing</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Integrations</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">About</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Terms</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Security</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
                © 2024 Smartkaatha. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Back to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-10 h-10 bg-white dark:bg-gray-900 rounded-lg shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-800 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </main>
    </>
  );
}