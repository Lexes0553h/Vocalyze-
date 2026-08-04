export const APP_CONFIG = {
  name: 'Vocalyze CRM',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  ai: {
    model: 'gemini-2.5-flash',
  },
};
