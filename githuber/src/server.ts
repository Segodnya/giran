import express from 'express'
import cors from 'cors'

import { GitHubService } from './services/github.service'

export function createServer() {
  const app = express()
  app.use(cors())

  const githubService = new GitHubService()

  const owner = process.env.GITHUB_REPO_OWNER
  const repo = process.env.GITHUB_REPO_NAME
  const articlesDir = process.env.GITHUB_REPO_FOLDER || ''

  if (!owner || !repo) {
    throw new Error(
      'GitHub repository owner and name must be configured in environment variables.',
    )
  }

  app.get('/articles', async (req, res) => {
    try {
      const contents = await githubService.getContent(owner, repo, articlesDir)
      const articles = contents.filter(
        (content) => content.type === 'file' && content.name.endsWith('.md'),
      )
      res.json(articles)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error fetching articles' })
    }
  })

  app.get('/articles/:name', async (req, res) => {
    try {
      const articleName = req.params.name
      const articlePath = `${articlesDir}/${articleName}`
      const content = await githubService.getFileContent(
        owner,
        repo,
        articlePath,
      )
      res.send(content)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error fetching article content' })
    }
  })

  return app
}
