const db = require('../db');

async function migrate() {
    try {
        console.log("Running migration v4...");
        await db.query(`
            ALTER TABLE appeals 
            ADD COLUMN IF NOT EXISTS claim_amount DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft';
        `);
        console.log("Migration v4 successful: Added claim_amount and status columns to appeals table.");
        process.exit(0);
    } catch (err) {
        console.error("Migration v4 failed:", err);
        process.exit(1);
    }
}

migrate();
