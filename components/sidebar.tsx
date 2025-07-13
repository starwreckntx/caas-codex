
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Bot, FileText, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Conversations',
    href: '/',
    icon: MessageSquare,
  },
  {
    name: 'Models',
    href: '/models',
    icon: Bot,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'Logic Analyzer',
    href: '/logic-analyzer',
    icon: Brain,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="sidebar-nav w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100">HueAndLogic</h1>
            <p className="text-xs text-slate-400">Recursive AI Reasoning</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'sidebar-nav-item rounded-lg cursor-pointer',
                    isActive && 'active'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center">
          <p>Chain of Thought Analysis</p>
          <p>& Logic Evaluation</p>
        </div>
      </div>
    </div>
  )
}
