
'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Trash2, Download, Calendar, Github, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocumentCard } from '@/components/document-card'
import { Document } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { GitHubImport } from '@/components/github-import'
import { GoogleDriveImport } from '@/components/google-drive-import'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isGitHubImportOpen, setIsGitHubImportOpen] = useState(false)
  const [isGoogleDriveImportOpen, setIsGoogleDriveImportOpen] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newDocument = await response.json()
        setDocuments([newDocument, ...documents])
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDocuments(documents.filter(d => d.id !== documentId))
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleGitHubImportSuccess = (newDocument: Document) => {
    setDocuments([newDocument, ...documents])
    setIsGitHubImportOpen(false)
  }

  const handleGoogleDriveImportSuccess = (newDocuments: Document[]) => {
    setDocuments([...newDocuments, ...documents])
    setIsGoogleDriveImportOpen(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-slate-400">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              Document Library
            </h1>
            <p className="text-slate-400 mt-2">
              Upload documents and import from GitHub repositories or Google Drive for comprehensive knowledge analysis
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.md"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <Button 
                  className="btn-primary"
                  disabled={isUploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </span>
                </Button>
              </label>
            </div>
            
            <Dialog open={isGitHubImportOpen} onOpenChange={setIsGitHubImportOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Import GitHub Repo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Import GitHub Repository</DialogTitle>
                </DialogHeader>
                <GitHubImport
                  onImportSuccess={handleGitHubImportSuccess}
                  onClose={() => setIsGitHubImportOpen(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isGoogleDriveImportOpen} onOpenChange={setIsGoogleDriveImportOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Import Google Drive
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Import from Google Drive</DialogTitle>
                </DialogHeader>
                <GoogleDriveImport
                  onImportSuccess={handleGoogleDriveImportSuccess}
                  onClose={() => setIsGoogleDriveImportOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Documents Yet</h3>
            <p className="text-slate-500 mb-6">Upload your first document to provide context for AI conversations</p>
            <div className="relative inline-block">
              <input
                type="file"
                id="file-upload-empty"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.md"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label htmlFor="file-upload-empty">
                <Button 
                  className="btn-primary"
                  disabled={isUploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Your First Document'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDeleteDocument}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
