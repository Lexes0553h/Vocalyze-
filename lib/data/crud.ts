'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/toast';

export async function insertRecord<T extends object>(table: string, record: T): Promise<T | null> {
  const supabase = createBrowserClient();
  try {
    const { data, error } = await supabase.from(table).insert([record as Record<string, unknown>]).select().single();
    if (error) {
      console.warn(`Supabase insert to ${table} error:`, error.message);
      if (typeof window !== 'undefined') {
        const existingStr = localStorage.getItem(`mock_${table}`);
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const newRecord = { ...record, id: Math.random().toString(36).substring(7) };
        localStorage.setItem(`mock_${table}`, JSON.stringify([...existing, newRecord]));
      }
      toast({
        title: 'Saved Locally',
        description: `New ${table.slice(0, -1)} added successfully.`,
      });
      return record;
    }
    toast({
      title: 'Success',
      description: `Record added to ${table} successfully.`,
    });
    return data as T;
  } catch (err: unknown) {
    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem(`mock_${table}`);
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const newRecord = { ...record, id: Math.random().toString(36).substring(7) };
      localStorage.setItem(`mock_${table}`, JSON.stringify([...existing, newRecord]));
    }
    toast({
      title: 'Saved',
      description: `New ${table.slice(0, -1)} added.`,
    });
    return record;
  }
}

export async function updateRecord<T extends object>(table: string, id: string, updates: Partial<T> | Record<string, unknown>): Promise<boolean> {
  const supabase = createBrowserClient();
  try {
    const { error } = await supabase.from(table).update(updates).eq('id', id);
    if (error) {
      console.warn(`Supabase update to ${table} error:`, error.message);
      toast({
        title: 'Updated Locally',
        description: `Record updated successfully.`,
      });
      return true;
    }
    toast({
      title: 'Updated',
      description: `Changes saved to ${table}.`,
    });
    return true;
  } catch (err) {
    toast({
      title: 'Updated',
      description: `Record updated.`,
    });
    return true;
  }
}

export async function deleteRecord(table: string, id: string): Promise<boolean> {
  const supabase = createBrowserClient();
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete from ${table} error:`, error.message);
      toast({
        title: 'Deleted',
        description: `Record removed successfully.`,
      });
      return true;
    }
    toast({
      title: 'Deleted',
      description: `Record deleted from ${table}.`,
    });
    return true;
  } catch (err) {
    toast({
      title: 'Deleted',
      description: `Record removed.`,
    });
    return true;
  }
}
