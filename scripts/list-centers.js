
const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url: url,
    authToken: authToken
});

async function listCenters() {
    try {
        const result = await client.execute("SELECT id, city, title FROM centers");
        console.table(result.rows);
    } catch (e) {
        console.error(e);
    }
}

listCenters();
