import 'dotenv/config'

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './models/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL,
  },
}