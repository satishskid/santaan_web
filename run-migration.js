const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { migrate } = require('drizzle-orm/libsql/migrator');

const client = createClient({
  url: 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ1MzUxNjcsImlkIjoiMmRhOThjNjgtYWYzOC00NWUzLWFjZmYtODJjNDgxODg0Mjc4IiwicmlkIjoiZTE3MDQ3ZjYtNTk0My00MmE2LWE1OGMtMmRlY2ExMjg3ZWU4In0.vmdtm-2skhPh8afhsLt16QAEKeAOHJ3hYjcGkmhloQyxeVlSn2Cf8N_-NfS58yzYIfQD74D-GrqpwQaMd9isDg'
});
const db = drizzle(client);

async function main() {
  console.log('Running migrations manually...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete!');
  process.exit(0);
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
