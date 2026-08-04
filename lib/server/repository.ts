import type { SupabaseClient } from '@supabase/supabase-js';

export interface ListOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  eq?: Record<string, unknown>;
}

export interface FindOptions {
  eq?: Record<string, unknown>;
}

export class Repository<T extends Record<string, unknown>> {
  constructor(
    private client: SupabaseClient,
    private table: string
  ) {}

  async list(opts: ListOptions = {}): Promise<T[]> {
    let q = this.client.from(this.table).select('*');
    if (opts.eq) {
      for (const [col, val] of Object.entries(opts.eq)) {
        q = q.eq(col, val as string);
      }
    }
    if (opts.orderBy) {
      q = q.order(opts.orderBy, { ascending: opts.ascending ?? false });
    }
    if (opts.limit) {
      q = q.limit(opts.limit);
    }
    if (opts.offset) {
      q = q.range(opts.offset, opts.offset + (opts.limit ?? 100) - 1);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as T[];
  }

  async find(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as T | null;
  }

  async findBy(opts: FindOptions): Promise<T[]> {
    let q = this.client.from(this.table).select('*');
    if (opts.eq) {
      for (const [col, val] of Object.entries(opts.eq)) {
        q = q.eq(col, val as string);
      }
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as T[];
  }

  async create(payload: Partial<T>): Promise<T> {
    const { data, error } = await this.client
      .from(this.table)
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data as T;
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    const { data, error } = await this.client
      .from(this.table)
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as T;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(this.table).delete().eq('id', id);
    if (error) throw error;
  }

  async count(opts: FindOptions = {}): Promise<number> {
    let q = this.client.from(this.table).select('*', { count: 'exact', head: true });
    if (opts.eq) {
      for (const [col, val] of Object.entries(opts.eq)) {
        q = q.eq(col, val as string);
      }
    }
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  }
}
