const { Client } = require('pg');
require('dotenv').config();

async function setup() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("DATABASE_URL not found");
        process.exit(1);
    }

    // Parse the URL to get the db name and the base connection URL
    // Format: postgresql://user:password@host:port/dbname
    const match = dbUrl.match(/postgresql:\/\/(.*):(.*)@(.*):(\d+)\/(.*)/);

    if (!match) {
        console.error("Invalid DATABASE_URL format. Expected postgresql://user:pass@host:port/dbname");
        process.exit(1);
    }

    const [_, user, password, host, port, dbName] = match;
    const postgresUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;

    console.log(`Checking if database '${dbName}' exists...`);

    const client = new Client({ connectionString: postgresUrl });

    try {
        await client.connect();

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`Database '${dbName}' does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

    } catch (err) {
        console.error("Error checking/creating database:", err.message);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Now run the table init
    console.log("Initializing tables...");
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: dbUrl });

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS appeals (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(255),
        denial_reason TEXT,
        appeal_letter TEXT,
        cpt_codes JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        original_file_name VARCHAR(255),
        claim_amount DECIMAL(10, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'Draft'
    );
    `;

    try {
        await pool.query(createTableQuery);
        console.log("Appeals table setup complete.");
    } catch (err) {
        console.error("Error creating table:", err.message);
    } finally {
        await pool.end();
    }
}

setup();
