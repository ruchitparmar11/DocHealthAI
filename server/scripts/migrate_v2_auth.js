const { Client } = require('pg');
require('dotenv').config();

async function migrateAuth() {
    const dbUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        // 1. Create Users Table
        console.log("Creating users table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Add user_id to appeals
        console.log("Adding user_id to appeals table...");
        await client.query(`
            ALTER TABLE appeals 
            ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
        `);

        console.log("Migration complete: Users table created & appeals linked.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrateAuth();
