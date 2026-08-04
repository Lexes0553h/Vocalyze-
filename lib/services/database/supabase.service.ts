/**
 * Supabase Service Helper Interface
 */
import { createBrowserClient } from '@/lib/supabase/client';

export class SupabaseDatabaseService {
  private client = createBrowserClient();

  public async fetchTable<T>(tableName: string, query?: Record<string, unknown>): Promise<T[]> {
    let q = this.client.from(tableName).select('*');
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        q = q.eq(k, v);
      });
    }
    const { data, error } = await q;
    if (error) {
      console.warn(`Supabase fetch failed for ${tableName}:`, error.message);
      return [];
    }
    return (data as T[]) || [];
  }

  public async insertRecord<T extends Record<string, unknown>>(tableName: string, record: T): Promise<T | null> {
    const { data, error } = await this.client.from(tableName).insert(record as unknown as never).select().single();
    if (error) {
      console.warn(`Supabase insert failed for ${tableName}:`, error.message);
      return null;
    }
    return data as T;
  }
}
