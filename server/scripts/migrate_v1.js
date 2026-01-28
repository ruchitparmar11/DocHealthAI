const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const dbUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        // Add claim_amount
        await client.query(`
            ALTER TABLE appeals 
            ADD COLUMN IF NOT EXISTS claim_amount DECIMAL(10, 2) DEFAULT 0.00;
        `);

        // Add status
        await client.query(`
            ALTER TABLE appeals 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft';
        `);

        console.log("Migration complete: Added 'claim_amount' and 'status' columns.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
