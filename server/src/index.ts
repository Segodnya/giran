import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { getArticle, getArticles } from './services/githuber'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!')
})

app.get(
  '/api/articles',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const articles = await getArticles()
      res.json(articles)
    } catch (error) {
      next(error)
    }
  },
)

app.get(
  '/api/articles/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await getArticle(req.params.id)
      res.json(article)
    } catch (error) {
      next(error)
    }
  },
)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export { app }
