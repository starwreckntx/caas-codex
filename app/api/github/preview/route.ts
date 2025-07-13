
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { owner, repo, branch } = body

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repository name are required' },
        { status: 400 }
      )
    }

    // Fetch repository information from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'HueAndLogic-App'
      }
    })

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch repository information' },
        { status: 500 }
      )
    }

    const repoData = await repoResponse.json()

    // Check if the specified branch exists (if provided)
    if (branch && branch !== repoData.default_branch) {
      const branchResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'HueAndLogic-App'
        }
      })

      if (!branchResponse.ok) {
        return NextResponse.json(
          { error: `Branch '${branch}' not found` },
          { status: 404 }
        )
      }
    }

    const preview = {
      name: repoData.name,
      owner: repoData.owner.login,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stargazers_count,
      size: repoData.size,
      defaultBranch: repoData.default_branch,
      isPrivate: repoData.private,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at
    }

    return NextResponse.json(preview)
  } catch (error) {
    console.error('Error previewing repository:', error)
    return NextResponse.json(
      { error: 'Failed to preview repository' },
      { status: 500 }
    )
  }
}
