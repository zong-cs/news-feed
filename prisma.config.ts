import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import path from 'path'

const databaseUrl = process.env.DATABASE_URL
const resolvedDatabaseUrl = databaseUrl?.startsWith('file:')
  ? `file:${path.resolve(process.cwd(), databaseUrl.slice('file:'.length))}`
  : databaseUrl

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: resolvedDatabaseUrl,
  },
})
