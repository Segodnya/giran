import { GitHubService, GitHubApiError } from '../services/github.service'
import { validateGitHubConfig } from '../config/github.config'

/**
 * Example usage of the GitHub API service
 * This file demonstrates various operations you can perform with the GitHub service
 */

async function demonstrateGitHubService() {
  // Validate configuration
  validateGitHubConfig()

  // Create a new GitHub service instance
  const github = new GitHubService()

  try {
    console.log('🚀 Starting GitHub API service demonstrations...\n')

    // 1. Check rate limit status
    console.log('📊 Checking rate limit status...')
    const rateLimit = await github.getRateLimit()
    console.log(
      `Rate limit: ${rateLimit.rate.remaining}/${rateLimit.rate.limit} requests remaining`,
    )
    console.log(
      `Reset time: ${new Date(rateLimit.rate.reset * 1000).toISOString()}\n`,
    )

    // 2. Get repository information
    console.log('📁 Getting repository information...')
    const repo = await github.getRepository('microsoft', 'vscode')
    console.log(`Repository: ${repo.fullName}`)
    console.log(`Description: ${repo.description}`)
    console.log(`Stars: ${repo.stargazersCount}`)
    console.log(`Language: ${repo.language}`)
    console.log(`Default branch: ${repo.defaultBranch}\n`)

    // 3. Get repository branches
    console.log('🌿 Getting repository branches...')
    const branches = await github.getBranches('microsoft', 'vscode')
    console.log(`Found ${branches.length} branches:`)
    branches.slice(0, 5).forEach((branch) => {
      console.log(`- ${branch.name} (${branch.commit.sha.substring(0, 7)})`)
    })
    console.log()

    // 4. Get repository content (root directory)
    console.log('📂 Getting repository content...')
    const contents = await github.getContent('microsoft', 'vscode')
    console.log(`Found ${contents.length} items in root directory:`)
    contents.slice(0, 10).forEach((item) => {
      console.log(`- ${item.name} (${item.type})`)
    })
    console.log()

    // 5. Get a specific file content
    console.log('📄 Getting specific file content...')
    try {
      const readmeContent = await github.getFileContent(
        'microsoft',
        'vscode',
        'README.md',
      )
      console.log(
        `README.md content length: ${readmeContent.length} characters`,
      )
      console.log(
        `First 200 characters: ${readmeContent.substring(0, 200)}...\n`,
      )
    } catch (error) {
      console.log('Could not fetch README.md content\n')
    }

    // 6. Get recent commits
    console.log('📝 Getting recent commits...')
    const commits = await github.getCommits('microsoft', 'vscode', {
      perPage: 5,
    })
    console.log(`Found ${commits.length} recent commits:`)
    commits.forEach((commit) => {
      console.log(
        `- ${commit.sha.substring(0, 7)}: ${commit.message.split('\n')[0]}`,
      )
      console.log(`  Author: ${commit.author.name} (${commit.author.date})`)
    })
    console.log()

    // 7. Search repositories
    console.log('🔍 Searching repositories...')
    const searchResults = await github.searchRepositories('typescript react', {
      sort: 'stars',
      order: 'desc',
      perPage: 5,
    })
    console.log(
      `Found ${searchResults.totalCount} repositories matching "typescript react":`,
    )
    searchResults.repositories.forEach((repo) => {
      console.log(`- ${repo.fullName} (⭐ ${repo.stargazersCount})`)
      console.log(`  ${repo.description || 'No description'}`)
    })
    console.log()

    // 8. Check if repository is public
    console.log('🔓 Checking repository visibility...')
    const isPublic = await github.isRepositoryPublic('microsoft', 'vscode')
    console.log(`microsoft/vscode is public: ${isPublic}\n`)

    // 9. Get repository tree
    console.log('🌳 Getting repository tree...')
    const tree = await github.getTree('microsoft', 'vscode', 'HEAD', false)
    console.log(`Repository tree has ${tree.tree.length} items in root`)
    tree.tree.slice(0, 10).forEach((item: any) => {
      console.log(`- ${item.path} (${item.type})`)
    })
    console.log()

    // 10. Get request statistics
    console.log('📈 Request statistics:')
    const stats = github.getRequestStats()
    console.log(`Requests made this hour: ${stats.count}`)
    console.log(`Stats reset time: ${stats.resetTime.toISOString()}\n`)

    console.log('✅ GitHub API service demonstration completed successfully!')
  } catch (error) {
    if (error instanceof GitHubApiError) {
      console.error(`❌ GitHub API Error: ${error.message}`)
      if (error.status) {
        console.error(`Status: ${error.status}`)
      }
    } else {
      console.error(`❌ Unexpected error: ${error}`)
    }
  }
}

// Example of using the service in a more practical scenario
async function getRepositoryArticles(
  owner: string,
  repo: string,
  path: string = '',
) {
  const github = new GitHubService()

  try {
    // Get all markdown files from a specific path
    const contents = await github.getContent(owner, repo, path)
    const articles = contents.filter(
      (item) =>
        item.type === 'file' &&
        (item.name.endsWith('.md') || item.name.endsWith('.markdown')),
    )

    console.log(`Found ${articles.length} articles in ${owner}/${repo}/${path}`)

    // Get content of each article
    const articleContents = await Promise.all(
      articles.map(async (article) => {
        try {
          const content = await github.getFileContent(owner, repo, article.path)
          return {
            name: article.name,
            path: article.path,
            content: content,
            size: article.size,
          }
        } catch (error) {
          console.warn(`Could not fetch content for ${article.path}`)
          return null
        }
      }),
    )

    return articleContents.filter((article) => article !== null)
  } catch (error) {
    console.error('Error fetching repository articles:', error)
    return []
  }
}

// Export functions for use in other modules
export { demonstrateGitHubService, getRepositoryArticles }

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateGitHubService().catch(console.error)
}
