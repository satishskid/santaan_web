
const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url: url,
    authToken: authToken
});

async function deleteDuplicate() {
    try {
        console.log("Deleting duplicate center with ID 6...");
        const result = await client.execute("DELETE FROM centers WHERE id = 6");
        console.log("Deleted rows:", result.rowsAffected);
    } catch (e) {
        console.error(e);
    }
}

deleteDuplicate();
