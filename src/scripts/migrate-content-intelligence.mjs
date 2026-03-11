import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:santaan.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function run() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS content_assets (
      id integer primary key autoincrement,
      asset_type text not null,
      title text not null,
      url text,
      center text default 'network',
      audience text default 'patient',
      funnel_stage text default 'awareness',
      primary_keyword text,
      secondary_keywords text default '[]',
      tags text default '[]',
      source_platform text default 'manual',
      status text default 'published',
      owner text,
      notes text,
      published_at text,
      created_at text default CURRENT_TIMESTAMP,
      updated_at text default CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS content_feedback (
      id integer primary key autoincrement,
      feedback_date text not null,
      source text not null,
      center text default 'network',
      topic text not null,
      suggested_keyword text,
      patient_question text,
      audience text default 'patient',
      funnel_stage text default 'awareness',
      priority text default 'medium',
      occurrence_count integer default 1,
      recommended_action text default 'write_blog',
      owner text,
      status text default 'open',
      notes text,
      created_at text default CURRENT_TIMESTAMP,
      updated_at text default CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_content_assets_type ON content_assets(asset_type);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_content_assets_center ON content_assets(center);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_content_assets_status ON content_assets(status);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_content_feedback_date ON content_feedback(feedback_date);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_content_feedback_source ON content_feedback(source);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_content_feedback_center ON content_feedback(center);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_content_feedback_status ON content_feedback(status);`);

  console.log('content intelligence migration applied successfully.');
}

run().catch((error) => {
  console.error('Failed to migrate content intelligence tables:', error);
  process.exit(1);
});
