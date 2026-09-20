import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const baseURL = process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL)
const origins = [
  'http://localhost:3000',
  baseURL,
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL,
  trustedOrigins: origins,
  emailAndPassword: { enabled: true },
  advanced: process.env.NODE_ENV === 'development' ? { defaultCookieAttributes: { sameSite: 'none', secure: true } } : undefined,
})
