require('dotenv').config();

const pg = require("pg");
pg.defaults.ssl =
  process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;
  
module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  "connectionString": (process.env.NODE_ENV === 'test')
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
  // "host": process.env.MIGRATION_DB_HOST,
  // "port": process.env.MIGRATION_DB_PORT,
  // "database": process.env.MIGRATION_DB_NAME,
  // "username": process.env.MIGRATION_DB_USER,
  // "password": process.env.MIGRATION_DB_PASS
}
