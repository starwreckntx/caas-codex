
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Archive, ArchiveRestore, Search, Filter, Calendar, MessageSquare, Users, Clock, Download } from 'lucide-react'
import { ArchivedConversation } from '@/lib/types'

interface ArchiveManagementProps {
  children: React.ReactNode
}

export function ArchiveManagement({ children }: ArchiveManagementProps) {
  const [open, setOpen] = useState(false)
  const [archivedConversations, setArchivedConversations] = useState<ArchivedConversation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('archivedAt')
  const [filterBy, setFilterBy] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchArchivedConversations()
    }
  }, [open])

  const fetchArchivedConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations/archive')
      if (response.ok) {
        const data = await response.json()
        setArchivedConversations(data)
      }
    } catch (error) {
      console.error('Error fetching archived conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnarchive = async (conversationId: string) => {
    try {
      const response = await fetch('/api/conversations/unarchive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })

      if (response.ok) {
        // Remove from archived list
        setArchivedConversations(prev => 
          prev.filter(archived => archived.conversationId !== conversationId)
        )
      }
    } catch (error) {
      console.error('Error unarchiving conversation:', error)
    }
  }

  const handleExport = async (archivedConversation: ArchivedConversation) => {
    const exportData = {
      id: archivedConversation.id,
      title: archivedConversation.conversation?.title,
      participants: [
        archivedConversation.conversation?.modelA?.name,
        archivedConversation.conversation?.modelB?.name
      ],
      archivedAt: archivedConversation.archivedAt,
      archiveReason: archivedConversation.archiveReason,
      messages: archivedConversation.conversation?.messages || [],
      metadata: archivedConversation.archiveMetadata
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `archived-conversation-${archivedConversation.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredConversations = archivedConversations.filter(archived => {
    const matchesSearch = archived.conversation?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         archived.conversation?.modelA?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         archived.conversation?.modelB?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterBy === 'all') return matchesSearch
    if (filterBy === 'recent') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return matchesSearch && new Date(archived.archivedAt) > weekAgo
    }
    if (filterBy === 'withReason') {
      return matchesSearch && archived.archiveReason
    }
    
    return matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'archivedAt') {
      return new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()
    }
    if (sortBy === 'title') {
      return (a.conversation?.title || '').localeCompare(b.conversation?.title || '')
    }
    return 0
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center">
            <Archive className="w-5 h-5 mr-2" />
            Archive Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search archived conversations..."
                className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="archivedAt">Archived Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Archived</SelectItem>
                <SelectItem value="recent">Recent (7 days)</SelectItem>
                <SelectItem value="withReason">With Reason</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Archived Conversations List */}
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No archived conversations found</p>
              </div>
            ) : (
              filteredConversations.map((archived) => (
                <Card key={archived.id} className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-slate-100 text-sm">
                          {archived.conversation?.title}
                        </CardTitle>
                        <div className="flex items-center text-xs text-slate-400 mt-1">
                          <Users className="w-3 h-3 mr-1" />
                          {archived.conversation?.modelA?.name} ↔ {archived.conversation?.modelB?.name}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnarchive(archived.conversationId)}
                          className="bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500"
                        >
                          <ArchiveRestore className="w-3 h-3 mr-1" />
                          Unarchive
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(archived)}
                          className="bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {archived.archiveReason && (
                        <div className="text-xs text-slate-300">
                          <strong>Reason:</strong> {archived.archiveReason}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(archived.archivedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {archived.conversation?.messages?.length || 0} messages
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(archived.archivedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="text-sm text-slate-400 text-center">
            Showing {filteredConversations.length} of {archivedConversations.length} archived conversations
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
