import axios from 'axios'

const githuberClient = axios.create({
  baseURL: process.env.GITHUBEER_SERVICE_URL || 'http://localhost:3001',
})

export const getArticles = async () => {
  const response = await githuberClient.get('/articles')
  return response.data
}

export const getArticle = async (name: string) => {
  const response = await githuberClient.get(`/articles/${name}`)
  return response.data
}
