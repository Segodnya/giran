import path from 'path';

// Load .env from monorepo root BEFORE importing server
const envPath = path.join(import.meta.dir, '../../.env');

await Bun.file(envPath)
  .text()
  .then((content) => {
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();

      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');

        if (key && values.length) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    });
    console.log('✅ Environment variables loaded from monorepo root');
    console.log('GITHUB_TOKEN present:', !!process.env.GITHUB_TOKEN);
    console.log('GITHUB_REPO_OWNER:', process.env.GITHUB_REPO_OWNER);
  })
  .catch((error) => {
    console.warn('⚠️  No .env file found at monorepo root:', envPath);
  });

// Import server AFTER loading environment variables
import { createServer } from './server';

const port = process.env.PORT || 3000;

const app = createServer();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
