interface TursoStmt {
  sql: string;
  args?: (string | number | boolean | null)[];
}

interface TursoResponseCell {
  type: string;
  value?: string | number | boolean | null;
}

export async function queryDb<T = Record<string, any>>(
  stmt: TursoStmt,
  env?: Record<string, any>
): Promise<T[]> {
  // Check Cloudflare runtime env first, then fallback to import.meta.env
  const rawUrl = env?.TURSO_HTTP_URL || import.meta.env.TURSO_HTTP_URL;
  const token = env?.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

  if (!rawUrl || !token) {
    console.error('❌ Turso Error: TURSO_HTTP_URL or TURSO_AUTH_TOKEN missing from environment variables');
    throw new Error('Database credentials missing');
  }

  const baseUrl = rawUrl.replace(/\/v[12]\/pipeline\/?$/, '').replace(/\/$/, '');
  const endpoint = `${baseUrl}/v2/pipeline`;

  const formattedArgs = (stmt.args || []).map((arg) => {
    if (typeof arg === 'number') return { type: 'float', value: arg };
    if (typeof arg === 'boolean') return { type: 'integer', value: arg ? 1 : 0 };
    if (arg === null) return { type: 'null' };
    return { type: 'text', value: String(arg) };
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql: stmt.sql, args: formattedArgs } },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Turso HTTP ${response.status} Error:`, errorText);
    throw new Error(`Turso Error: ${errorText}`);
  }

  const data = await response.json();

  const firstResult = data.results?.[0];
  if (firstResult?.type === 'error') {
    console.error('❌ SQL Execution Error:', firstResult.error);
    throw new Error(`SQL Error: ${firstResult.error.message}`);
  }

  const result = firstResult?.response?.result;
  if (!result || !result.cols) return [];

  const cols: string[] = result.cols.map((c: { name: string }) => c.name);
  return result.rows.map((row: TursoResponseCell[]) => {
    const rowObj: Record<string, any> = {};
    row.forEach((cell, index) => {
      rowObj[cols[index]] = cell.value ?? null;
    });
    return rowObj as T;
  });
}