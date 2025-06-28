import dotenv from 'dotenv'

import { createServer } from './server'

dotenv.config()

const port = process.env.PORT || 3000

const app = createServer()

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
