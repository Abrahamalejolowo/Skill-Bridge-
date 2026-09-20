import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? true
    : {
        rejectUnauthorized: false,
      },
})

// Connection tracking
let connecting = false
let connected = false

const connect = async () => {
  if (connected) return
  if (connecting) {
    // Wait for existing connection attempt
    while (connecting) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return
  }

  connecting = true
  try {
    await client.connect()
    connected = true
    console.log('✅ Database connected')
  } catch (err) {
    console.error('❌ Database connection failed:', err)
    connecting = false
    throw err
  }
  connecting = false
}

// Try to connect in background
connect().catch(console.error)

export const db = drizzle(client)

// Export connect function to call before first query
export { connect }

// Graceful shutdown
process.on('SIGINT', async () => {
  if (connected) {
    await client.end()
    connected = false
  }
  process.exit(0)
})