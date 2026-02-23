import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type SettingRow = { key: string; value: string };

const WEEK1_SETTINGS: SettingRow[] = [
  { key: 'ceo_week1_window_start', value: '2026-02-23' },
  { key: 'ceo_week1_window_end', value: '2026-03-01' },
  { key: 'ceo_week1_owner', value: 'CEO' },

  { key: 'ceo_week1_network_target_attribution_pct', value: '95' },
  { key: 'ceo_week1_network_target_not_tagged_leads', value: '0' },
  { key: 'ceo_week1_network_target_pending_gt24h_max', value: '3' },

  { key: 'ceo_week1_bhubaneswar_target_leads', value: '24' },
  { key: 'ceo_week1_bhubaneswar_target_leads_stretch', value: '30' },
  { key: 'ceo_week1_bhubaneswar_target_high_intent_leads', value: '8' },
  { key: 'ceo_week1_bhubaneswar_target_qualified_leads', value: '12' },
  { key: 'ceo_week1_bhubaneswar_target_converted_leads', value: '3' },
  { key: 'ceo_week1_bhubaneswar_target_conversion_rate_pct_min', value: '12.5' },
  { key: 'ceo_week1_bhubaneswar_target_pending_gt24h_max', value: '2' },
  { key: 'ceo_week1_bhubaneswar_target_attribution_pct_min', value: '95' },
  { key: 'ceo_week1_bhubaneswar_target_first_response_2h_pct_min', value: '90' },

  { key: 'ceo_week1_berhampur_target_leads', value: '12' },
  { key: 'ceo_week1_berhampur_target_leads_stretch', value: '16' },
  { key: 'ceo_week1_berhampur_target_high_intent_leads', value: '4' },
  { key: 'ceo_week1_berhampur_target_qualified_leads', value: '6' },
  { key: 'ceo_week1_berhampur_target_converted_leads', value: '1' },
  { key: 'ceo_week1_berhampur_target_conversion_rate_pct_min', value: '8.0' },
  { key: 'ceo_week1_berhampur_target_pending_gt24h_max', value: '1' },
  { key: 'ceo_week1_berhampur_target_attribution_pct_min', value: '95' },
  { key: 'ceo_week1_berhampur_target_first_response_2h_pct_min', value: '90' },

  { key: 'ceo_week1_bangalore_target_leads', value: '16' },
  { key: 'ceo_week1_bangalore_target_leads_stretch', value: '22' },
  { key: 'ceo_week1_bangalore_target_high_intent_leads', value: '5' },
  { key: 'ceo_week1_bangalore_target_qualified_leads', value: '8' },
  { key: 'ceo_week1_bangalore_target_converted_leads', value: '2' },
  { key: 'ceo_week1_bangalore_target_conversion_rate_pct_min', value: '10.0' },
  { key: 'ceo_week1_bangalore_target_pending_gt24h_max', value: '1' },
  { key: 'ceo_week1_bangalore_target_attribution_pct_min', value: '95' },
  { key: 'ceo_week1_bangalore_target_first_response_2h_pct_min', value: '90' },
];

async function seedCeoWeek1Kpis() {
  const url = process.env.TURSO_DATABASE_URL || 'file:santaan.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    console.log(`Seeding CEO week-1 KPI settings on: ${url}`);
    const nowIso = new Date().toISOString();

    for (const row of WEEK1_SETTINGS) {
      await client.execute({
        sql: `
          INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        `,
        args: [row.key, row.value, nowIso],
      });
    }

    const result = await client.execute({
      sql: `
        SELECT key, value
        FROM settings
        WHERE key LIKE 'ceo_week1_%'
        ORDER BY key ASC
      `,
      args: [],
    });

    console.log(`Seeded ${WEEK1_SETTINGS.length} CEO week-1 setting(s).`);
    console.log(`Stored keys: ${result.rows.length}`);
  } finally {
    client.close();
  }
}

seedCeoWeek1Kpis().catch((error) => {
  console.error('Failed to seed CEO week-1 KPI settings:', error);
  process.exit(1);
});
