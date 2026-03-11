import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:santaan.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

async function migrateReviewsTable() {
  const client = createClient({ url, authToken });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS reputation_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      center TEXT NOT NULL,
      external_review_id TEXT,
      source_location TEXT,
      reviewer_name TEXT,
      rating INTEGER NOT NULL,
      review_date TEXT NOT NULL,
      headline TEXT,
      review_text TEXT NOT NULL,
      public_url TEXT,
      sentiment TEXT DEFAULT 'neutral',
      themes TEXT DEFAULT '[]',
      response_status TEXT DEFAULT 'pending',
      response_owner TEXT,
      response_text TEXT,
      responded_at TEXT,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`ALTER TABLE reputation_reviews ADD COLUMN external_review_id TEXT;`).catch(() => {});
  await client.execute(`ALTER TABLE reputation_reviews ADD COLUMN source_location TEXT;`).catch(() => {});

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_reputation_reviews_date ON reputation_reviews(review_date);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_reputation_reviews_center ON reputation_reviews(center);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_reputation_reviews_source ON reputation_reviews(source);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_reputation_reviews_response_status ON reputation_reviews(response_status);`);
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reputation_reviews_source_external ON reputation_reviews(source, external_review_id) WHERE external_review_id IS NOT NULL;`);

  console.log('reputation_reviews migration applied successfully.');
}

migrateReviewsTable().catch((error) => {
  console.error('Failed to migrate reputation_reviews:', error);
  process.exit(1);
});
