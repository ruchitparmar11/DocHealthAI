const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function deploySchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Neon handling
    });

    try {
        console.log("Connecting to database...");
        await pool.connect();
        console.log("Connected successfully.");

        // 1. Create Users Table
        console.log("Creating/Updating 'users' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Create Appeals Table
        console.log("Creating/Updating 'appeals' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS appeals (
                id SERIAL PRIMARY KEY,
                patient_name VARCHAR(255),
                denial_reason TEXT,
                appeal_letter TEXT,
                cpt_codes JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                original_file_name VARCHAR(255),
                claim_amount DECIMAL(10, 2) DEFAULT 0.00,
                status VARCHAR(50) DEFAULT 'Draft',
                user_id INTEGER REFERENCES users(id)
            );
        `);

        // Ensure columns exist if table already existed (idempotency)
        await pool.query(`
            ALTER TABLE appeals 
            ADD COLUMN IF NOT EXISTS claim_amount DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft',
            ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
        `);

        // 3. Create Chat Messages Table
        console.log("Creating/Updating 'chat_messages' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                appeal_id INTEGER REFERENCES appeals(id),
                role VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_chat_appeal_user ON chat_messages(appeal_id, user_id);
        `);

        console.log("✅ Schema deployment complete!");
    } catch (err) {
        console.error("❌ Schema deployment failed:", err);
    } finally {
        await pool.end();
    }
}

deploySchema();
