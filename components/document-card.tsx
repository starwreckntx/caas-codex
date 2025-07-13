
'use client'

import { FileText, Trash2, Download, Calendar, Github, Star, Code, GitBranch, Cloud, ExternalLink, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Document } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface DocumentCardProps {
  document: Document
  onDelete: (documentId: string) => void
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('text')) return '📝'
    if (fileType.includes('word')) return '📃'
    return '📄'
  }

  if (document.isGoogleDrive) {
    return (
      <div className="content-card hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-100 truncate">
                {document.driveFileName || document.originalName}
              </h3>
              <p className="text-sm text-slate-400">Google Drive</p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(document.id)}
            className="text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              <FileText className="w-3 h-3 mr-1" />
              {document.driveMimeType?.includes('google-apps') ? 
                document.driveMimeType.split('.').pop()?.toUpperCase() : 
                document.driveMimeType?.split('/').pop()?.toUpperCase()
              }
            </Badge>
            {document.driveOwnerEmail && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                <User className="w-3 h-3 mr-1" />
                {document.driveOwnerEmail}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Size:</span>
            <span className="text-slate-300">{formatFileSize(document.fileSize)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Imported:</span>
            <span className="text-slate-300">
              {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}
            </span>
          </div>
          
          {document.driveModifiedTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Last Modified:</span>
              <span className="text-slate-300">
                {formatDistanceToNow(new Date(document.driveModifiedTime), { addSuffix: true })}
              </span>
            </div>
          )}
          
          {document.driveWebViewLink && (
            <div>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700"
                onClick={() => window.open(document.driveWebViewLink!, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Google Drive
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (document.isGitHubRepo) {
    return (
      <div className="content-card hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-100 truncate">
                {document.repoOwner}/{document.repoName}
              </h3>
              <p className="text-sm text-slate-400">GitHub Repository</p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(document.id)}
            className="text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {document.repoLanguage && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                <Code className="w-3 h-3 mr-1" />
                {document.repoLanguage}
              </Badge>
            )}
            {document.repoStars !== null && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                <Star className="w-3 h-3 mr-1" />
                {document.repoStars}
              </Badge>
            )}
            {document.repoBranch && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                <GitBranch className="w-3 h-3 mr-1" />
                {document.repoBranch}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Size:</span>
            <span className="text-slate-300">{formatFileSize(document.fileSize)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Imported:</span>
            <span className="text-slate-300">
              {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}
            </span>
          </div>
          
          {document.repoStructure && (
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Repository Structure
              </label>
              <div className="text-sm text-slate-300 mt-1 space-y-1">
                <div className="flex justify-between">
                  <span>Files:</span>
                  <span>{document.repoStructure.files?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Directories:</span>
                  <span>{document.repoStructure.directories?.length || 0}</span>
                </div>
              </div>
            </div>
          )}
          
          {document.repoUrl && (
            <div>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700"
                onClick={() => window.open(document.repoUrl!, '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="content-card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mr-3">
            <span className="text-lg">{getFileIcon(document.fileType)}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-100 truncate">
              {document.originalName}
            </h3>
            <p className="text-sm text-slate-400">{document.fileType}</p>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(document.id)}
          className="text-slate-400 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Size:</span>
          <span className="text-slate-300">{formatFileSize(document.fileSize)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Uploaded:</span>
          <span className="text-slate-300">
            {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}
          </span>
        </div>
        
        {document.content && (
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Content Preview
            </label>
            <p className="text-sm text-slate-300 mt-1 line-clamp-3">
              {document.content.substring(0, 150)}...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
