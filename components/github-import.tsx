
'use client'

import { useState } from 'react'
import { Github, Download, AlertCircle, CheckCircle, Code, GitBranch, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GitHubRepoImportForm } from '@/lib/types'

interface GitHubImportProps {
  onImportSuccess: (document: any) => void
  onClose: () => void
}

interface RepoPreview {
  name: string
  owner: string
  description: string
  language: string
  stars: number
  size: number
  defaultBranch: string
}

export function GitHubImport({ onImportSuccess, onClose }: GitHubImportProps) {
  const [formData, setFormData] = useState<GitHubRepoImportForm>({
    repoUrl: '',
    branch: ''
  })
  const [repoPreview, setRepoPreview] = useState<RepoPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')

  const parseGitHubUrl = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) return null
      
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '')
      }
    } catch {
      return null
    }
  }

  const handlePreview = async () => {
    if (!formData.repoUrl.trim()) {
      setError('Please enter a GitHub repository URL')
      return
    }

    const parsed = parseGitHubUrl(formData.repoUrl)
    if (!parsed) {
      setError('Invalid GitHub repository URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/github/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: parsed.owner,
          repo: parsed.repo,
          branch: formData.branch
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch repository information')
      }

      const preview = await response.json()
      setRepoPreview(preview)
      setFormData(prev => ({ ...prev, branch: prev.branch || preview.defaultBranch }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview repository')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!repoPreview) return

    setIsImporting(true)
    setError('')

    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: formData.repoUrl,
          branch: formData.branch || repoPreview.defaultBranch
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import repository')
      }

      const importedDoc = await response.json()
      onImportSuccess(importedDoc)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import repository')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repoUrl">GitHub Repository URL</Label>
          <Input
            id="repoUrl"
            type="url"
            placeholder="https://github.com/username/repository"
            value={formData.repoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch (optional)</Label>
          <Input
            id="branch"
            type="text"
            placeholder="main"
            value={formData.branch}
            onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <Button
          onClick={handlePreview}
          disabled={isLoading || !formData.repoUrl.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-spin" />
              Fetching Repository Info...
            </>
          ) : (
            <>
              <Github className="w-4 h-4 mr-2" />
              Preview Repository
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

      {repoPreview && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Github className="w-5 h-5" />
              {repoPreview.owner}/{repoPreview.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 text-sm">
              {repoPreview.description || 'No description available'}
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">{repoPreview.language || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">{repoPreview.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">{formData.branch || repoPreview.defaultBranch}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-700">
                {(repoPreview.size / 1024).toFixed(1)} KB
              </Badge>
            </div>

            <Alert className="bg-green-900/20 border-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-200">
                Repository ready for import. This will analyze all files and create a searchable document.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <Download className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Repository
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
