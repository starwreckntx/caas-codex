
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// Supported file extensions for content extraction
const SUPPORTED_EXTENSIONS = [
  '.md', '.txt', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp',
  '.h', '.hpp', '.css', '.scss', '.html', '.xml', '.json', '.yaml', '.yml',
  '.sh', '.bash', '.ps1', '.sql', '.php', '.rb', '.go', '.rs', '.swift',
  '.kt', '.dart', '.vue', '.svelte', '.r', '.m', '.scala', '.clj', '.pl',
  '.lua', '.dockerfile', '.gitignore', '.env.example', '.toml', '.ini'
]

const MAX_FILE_SIZE = 100 * 1024 // 100KB limit for individual files
const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB total limit

async function fetchRepositoryTree(owner: string, repo: string, branch: string = 'main') {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HueAndLogic-App'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch repository tree: ${response.statusText}`)
  }

  return await response.json()
}

async function fetchFileContent(owner: string, repo: string, path: string, branch: string = 'main') {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HueAndLogic-App'
    }
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  
  if (data.type === 'file' && data.content) {
    try {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    } catch {
      return null
    }
  }

  return null
}

function shouldIncludeFile(path: string, size: number) {
  // Skip files that are too large
  if (size > MAX_FILE_SIZE) return false
  
  // Skip binary files and common non-text directories
  const skipDirs = ['.git', 'node_modules', '.next', 'dist', 'build', '.vscode', '.idea', '__pycache__']
  if (skipDirs.some(dir => path.includes(dir))) return false

  // Check if file has supported extension
  const ext = path.substring(path.lastIndexOf('.')).toLowerCase()
  return SUPPORTED_EXTENSIONS.includes(ext) || path.includes('README') || path.includes('LICENSE')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { repoUrl, branch = 'main' } = body

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // Parse GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      )
    }

    const owner = match[1]
    const repo = match[2].replace(/\.git$/, '')

    // Fetch repository information
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'HueAndLogic-App'
      }
    })

    if (!repoResponse.ok) {
      return NextResponse.json(
        { error: 'Repository not found or not accessible' },
        { status: 404 }
      )
    }

    const repoData = await repoResponse.json()

    // Fetch repository tree
    const treeData = await fetchRepositoryTree(owner, repo, branch)

    // Filter files to include
    const filesToProcess = treeData.tree.filter((item: any) => 
      item.type === 'blob' && shouldIncludeFile(item.path, item.size)
    )

    // Limit total processing to avoid overwhelming the system
    const sortedFiles = filesToProcess
      .sort((a: any, b: any) => {
        // Prioritize README and important files
        if (a.path.includes('README')) return -1
        if (b.path.includes('README')) return 1
        if (a.path.includes('package.json')) return -1
        if (b.path.includes('package.json')) return 1
        return a.path.localeCompare(b.path)
      })
      .slice(0, 100) // Limit to 100 files

    // Fetch file contents
    const fileContents: { [key: string]: string } = {}
    const repoStructure: any = {
      files: [],
      directories: new Set(),
      totalFiles: treeData.tree.filter((item: any) => item.type === 'blob').length,
      totalSize: treeData.tree.reduce((acc: number, item: any) => acc + (item.size || 0), 0)
    }

    let totalProcessedSize = 0

    for (const file of sortedFiles) {
      if (totalProcessedSize > MAX_TOTAL_SIZE) break

      const content = await fetchFileContent(owner, repo, file.path, branch)
      if (content) {
        fileContents[file.path] = content
        totalProcessedSize += content.length
      }

      // Track directory structure
      const parts = file.path.split('/')
      for (let i = 0; i < parts.length - 1; i++) {
        const dirPath = parts.slice(0, i + 1).join('/')
        repoStructure.directories.add(dirPath)
      }

      repoStructure.files.push({
        path: file.path,
        size: file.size,
        hasContent: !!content
      })
    }

    // Convert Set to Array for JSON serialization
    repoStructure.directories = Array.from(repoStructure.directories)

    // Create combined content for search
    const combinedContent = Object.entries(fileContents)
      .map(([path, content]) => `--- ${path} ---\n${content}`)
      .join('\n\n')

    // Create document in database
    const document = await prisma.document.create({
      data: {
        filename: `${owner}-${repo}-${branch}.github`,
        originalName: `${owner}/${repo}`,
        fileType: 'repository',
        fileSize: totalProcessedSize,
        content: combinedContent,
        isGitHubRepo: true,
        repoUrl,
        repoName: repo,
        repoOwner: owner,
        repoBranch: branch,
        repoLanguage: repoData.language,
        repoStars: repoData.stargazers_count,
        repoStructure: repoStructure
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error importing repository:', error)
    return NextResponse.json(
      { error: 'Failed to import repository' },
      { status: 500 }
    )
  }
}
