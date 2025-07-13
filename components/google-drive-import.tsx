
'use client'

import { useState, useEffect } from 'react'
import { Cloud, Download, AlertCircle, CheckCircle, FileText, Search, Folder, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GoogleDriveFile, GoogleDriveImportForm } from '@/lib/types'

interface GoogleDriveImportProps {
  onImportSuccess: (documents: any[]) => void
  onClose: () => void
}

interface AuthTokens {
  access_token: string
  refresh_token?: string
}

export function GoogleDriveImport({ onImportSuccess, onClose }: GoogleDriveImportProps) {
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [files, setFiles] = useState<GoogleDriveFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)

  const authenticate = async () => {
    setIsAuthenticating(true)
    setError('')

    try {
      const response = await fetch('/api/google-drive/auth')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authentication URL')
      }

      // Open popup window for authentication
      const popup = window.open(
        data.authUrl,
        'google-drive-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      // Listen for popup closure and extract authorization code
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsAuthenticating(false)
          // You would typically handle the callback here
          // For now, we'll ask user to manually enter the code
          const code = prompt('Please enter the authorization code from Google:')
          if (code) {
            handleAuthCallback(code)
          }
        }
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setIsAuthenticating(false)
    }
  }

  const handleAuthCallback = async (code: string) => {
    try {
      const response = await fetch(`/api/google-drive/auth?code=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to exchange authorization code')
      }

      setAuthTokens(data.tokens)
      setUserInfo(data.user)
      await loadFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete authentication')
    }
  }

  const loadFiles = async (pageToken?: string, search?: string) => {
    if (!authTokens) return

    setIsLoadingFiles(true)
    setError('')

    try {
      const response = await fetch('/api/google-drive/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: authTokens.access_token,
          refreshToken: authTokens.refresh_token,
          searchQuery: search || searchQuery,
          pageToken
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load files')
      }

      const data = await response.json()
      
      if (pageToken) {
        setFiles(prev => [...prev, ...data.files])
      } else {
        setFiles(data.files)
      }
      
      setNextPageToken(data.nextPageToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleSearch = () => {
    setFiles([])
    setNextPageToken(null)
    loadFiles(undefined, searchQuery)
  }

  const handleLoadMore = () => {
    if (nextPageToken) {
      loadFiles(nextPageToken)
    }
  }

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId)
    } else {
      newSelection.add(fileId)
    }
    setSelectedFiles(newSelection)
  }

  const handleImport = async () => {
    if (selectedFiles.size === 0 || !authTokens) return

    setIsImporting(true)
    setError('')

    try {
      const selectedFileObjects = files.filter(file => selectedFiles.has(file.id))

      const response = await fetch('/api/google-drive/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: authTokens.access_token,
          refreshToken: authTokens.refresh_token,
          selectedFiles: selectedFileObjects
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import files')
      }

      const data = await response.json()
      onImportSuccess(data.importedDocuments)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import files')
    } finally {
      setIsImporting(false)
    }
  }

  const formatFileSize = (size?: string) => {
    if (!size) return 'Unknown size'
    const bytes = parseInt(size)
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('document') || mimeType.includes('word')) return '📃'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
    if (mimeType.includes('text')) return '📝'
    if (mimeType.includes('image')) return '🖼️'
    return '📄'
  }

  if (!authTokens) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-100 mb-2">Connect to Google Drive</h3>
            <p className="text-slate-400 text-sm mb-6">
              Authenticate with Google Drive to browse and import your documents
            </p>
          </div>
          
          <Button
            onClick={authenticate}
            disabled={isAuthenticating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAuthenticating ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Connect to Google Drive
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert className="bg-red-900/20 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      {userInfo && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-100 font-medium">{userInfo.name}</p>
                <p className="text-slate-400 text-sm">{userInfo.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border-slate-700"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoadingFiles}
          variant="outline"
          className="bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Files List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Your Files
            </span>
            {selectedFiles.size > 0 && (
              <Badge variant="secondary" className="bg-blue-600">
                {selectedFiles.size} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFiles && files.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Download className="w-8 h-8 mx-auto mb-2 animate-spin" />
              Loading files...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              No supported files found
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 truncate font-medium">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(file.webViewLink, '_blank')}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {nextPageToken && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingFiles}
                    variant="outline"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  >
                    {isLoadingFiles ? (
                      <>
                        <Download className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert className="bg-red-900/20 border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {selectedFiles.size > 0 && (
        <Alert className="bg-green-900/20 border-green-500/20">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-200">
            Ready to import {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''}. 
            These documents will be processed and made available for AI conversations.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleImport}
          disabled={selectedFiles.size === 0 || isImporting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isImporting ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-spin" />
              Importing {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Import {selectedFiles.size > 0 ? selectedFiles.size : ''} File{selectedFiles.size !== 1 ? 's' : ''}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="px-6 bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
