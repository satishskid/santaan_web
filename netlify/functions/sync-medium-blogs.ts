import type { Config, Context } from '@netlify/functions';

function getBaseUrl(context: Context): string | null {
  const fromContext = context.site?.url;
  if (fromContext) return fromContext;

  return process.env.URL || process.env.DEPLOY_PRIME_URL || null;
}

const handler = async (_request: Request, context: Context) => {
  const baseUrl = getBaseUrl(context);
  const syncSecret = process.env.BLOG_SYNC_SECRET;

  if (!baseUrl) {
    return new Response(JSON.stringify({ error: 'Missing site URL for scheduled sync' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!syncSecret) {
    return new Response(JSON.stringify({ error: 'Missing BLOG_SYNC_SECRET' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/api/blogs/sync`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-sync-token': syncSecret,
    },
    body: JSON.stringify({ trigger: 'netlify-scheduled-function' }),
  });

  const body = await response.text();

  if (!response.ok) {
    return new Response(
      JSON.stringify({
        error: 'Scheduled sync request failed',
        status: response.status,
        body,
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      endpoint,
      status: response.status,
      body,
      syncedAt: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    },
  );
};

export default handler;

export const config: Config = {
  schedule: '0 2 * * *',
};
