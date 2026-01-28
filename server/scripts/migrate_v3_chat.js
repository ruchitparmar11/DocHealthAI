const { Client } = require('pg');
require('dotenv').config();

async function migrateChat() {
    const dbUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        console.log("Creating chat_messages table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                appeal_id INTEGER REFERENCES appeals(id),
                role VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Index for faster retrieval
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_chat_appeal_user ON chat_messages(appeal_id, user_id);
        `);

        console.log("Migration complete: chat_messages table created.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrateChat();
