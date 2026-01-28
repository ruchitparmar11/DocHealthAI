const db = require('../db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS appeals (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255),
    denial_reason TEXT,
    appeal_letter TEXT,
    cpt_codes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_file_name VARCHAR(255)
);
`;

async function initDb() {
    try {
        console.log("Initializing database...");
        await db.query(createTableQuery);
        console.log("Appeals table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
}

initDb();
