import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateBlogPostsTable() {
  const url = process.env.TURSO_DATABASE_URL || 'file:santaan.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    console.log(`Running blog post migration on: ${url}`);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug text NOT NULL UNIQUE,
        title text NOT NULL,
        excerpt text NOT NULL,
        html text NOT NULL,
        author text DEFAULT 'Santaan Editorial Team',
        thumbnail text,
        tags text DEFAULT '[]',
        source_url text NOT NULL,
        type text DEFAULT 'blog',
        read_minutes integer DEFAULT 1,
        is_active integer DEFAULT true,
        published_at text NOT NULL,
        synced_at text DEFAULT CURRENT_TIMESTAMP,
        updated_at text DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute('CREATE INDEX IF NOT EXISTS idx_blog_posts_type_published ON blog_posts(type, published_at DESC)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)');

    console.log('Blog posts table migration completed.');
  } finally {
    client.close();
  }
}

migrateBlogPostsTable().catch((error) => {
  console.error('Blog posts migration failed:', error);
  process.exit(1);
});
