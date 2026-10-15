import mysql from "mysql2/promise";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";

let pool: Pool | undefined;

export function database(): Pool {
  if (!pool) {
    const dsn = process.env.DATABASE_URL;
    if (!dsn) throw new Error("The Manus native database is not configured.");
    const url = new URL(dsn);
    pool = mysql.createPool({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.slice(1)),
      ssl: { rejectUnauthorized: true },
      connectionLimit: 6,
      connectTimeout: 10000,
      decimalNumbers: true,
      timezone: "Z",
      enableKeepAlive: true,
      namedPlaceholders: false,
      multipleStatements: false,
    });
  }
  return pool;
}

export async function rows<T extends RowDataPacket>(
  sql: string,
  parameters: (string | number | boolean | null | Date | Buffer)[] = [],
): Promise<T[]> {
  const [result] = await database().execute<T[]>(sql, parameters);
  return result;
}

export async function transaction<T>(run: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const result = await run(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
