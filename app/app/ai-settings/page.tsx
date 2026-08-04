'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Save, Sparkles, Mic, MessageSquare, FileText, Zap,
  Cpu, Thermometer, Globe, Ruler, Palette, Lightbulb,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useAiSettings } from '@/lib/data/ai-hooks';
import { cn } from '@/lib/utils';

const PROVIDERS = [
  { id: 'simulated', name: 'Simulated (No API Key)', desc: 'Built-in placeholder for demos', connected: true },
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4 Turbo, GPT-3.5', connected: false },
  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 1.5 Pro, Flash', connected: false },
  { id: 'claude', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet, Opus', connected: false },
  { id: 'azure', name: 'Azure OpenAI', desc: 'Enterprise Azure deployment', connected: false },
  { id: 'local', name: 'Local LLM', desc: 'Ollama, LM Studio, vLLM', connected: false },
];

const MODELS: Record<string, string[]> = {
  simulated: ['vocalyze-simulated-v1'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
  claude: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
  azure: ['gpt-4o', 'gpt-4-turbo', 'gpt-35-turbo'],
  local: ['llama-3-70b', 'mistral-7b', 'phi-3'],
};

const LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'hi', 'ja', 'zh'];
const LENGTHS = [
  { id: 'short', label: 'Short', desc: 'Concise, to the point' },
  { id: 'medium', label: 'Medium', desc: 'Balanced detail' },
  { id: 'long', label: 'Long', desc: 'Comprehensive' },
];
const CREATIVITY = [
  { id: 'conservative', label: 'Conservative', desc: 'Factual, precise' },
  { id: 'balanced', label: 'Balanced', desc: 'Natural variety' },
  { id: 'creative', label: 'Creative', desc: 'Expressive, varied' },
];

export default function AiSettingsPage() {
  const { data: saved } = useAiSettings();
  const [provider, setProvider] = useState('simulated');
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [language, setLanguage] = useState('en');
  const [responseLength, setResponseLength] = useState('medium');
  const [creativity, setCreativity] = useState('balanced');
  const [autoSummary, setAutoSummary] = useState(true);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [savedFlag, setSavedFlag] = useState(false);

  useEffect(() => {
    if (saved) {
      setProvider(saved.provider);
      setModel(saved.model);
      setTemperature(saved.temperature);
      setMaxTokens(saved.maxTokens);
      setLanguage(saved.language);
      setResponseLength(saved.responseLength);
      setCreativity(saved.creativity);
      setAutoSummary(saved.autoSummary);
      setAutoSuggestions(saved.autoSuggestions);
      setVoiceEnabled(saved.voiceEnabled);
    }
  }, [saved]);

  const handleSave = () => {
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Settings" subtitle="Configure your AI provider, model, and preferences." actions={<Button variant="primary" onClick={handleSave}><Save className="h-4 w-4" />{savedFlag ? 'Saved!' : 'Save Settings'}</Button>} />

      {/* Provider Selection */}
      <Card title="AI Provider">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setProvider(p.id); setModel(MODELS[p.id]?.[0] ?? 'gpt-4o'); }}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                provider === p.id ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/20' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Cpu className="h-5 w-5" /></div>
                {p.connected ? <Badge variant="green">Connected</Badge> : <Badge variant="muted">Not configured</Badge>}
              </div>
              <p className="mt-3 text-sm font-medium">{p.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
            </button>
          ))}
        </div>
        {provider !== 'simulated' && (
          <div className="mt-4 rounded-xl bg-primary/5 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5" />Provider Configuration</p>
            <p className="mt-1 text-xs text-muted-foreground">API keys are stored securely in server-side environment variables and are never exposed to the client. Add the key to your environment configuration to connect this provider.</p>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model & Parameters */}
        <Card title="Model & Parameters">
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Bot className="h-3.5 w-3.5" />Model</p>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                {(MODELS[provider] ?? []).map((m) => <option key={m} value={m} className="bg-background">{m}</option>)}
              </select>
            </div>

            <div>
              <p className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5" />Temperature</span>
                <span className="text-primary">{temperature.toFixed(1)}</span>
              </p>
              <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-primary" />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60"><span>Precise</span><span>Balanced</span><span>Creative</span></div>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Ruler className="h-3.5 w-3.5" />Max Response Tokens</p>
              <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} min="100" max="8192" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Globe className="h-3.5 w-3.5" />Language</p>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                {LANGUAGES.map((l) => <option key={l} value={l} className="bg-background">{l.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Response Style */}
        <Card title="Response Style">
          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Palette className="h-3.5 w-3.5" />Response Length</p>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map((l) => (
                  <button key={l.id} onClick={() => setResponseLength(l.id)} className={cn('rounded-xl border p-3 text-left transition-all', responseLength === l.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 hover:border-white/20')}>
                    <p className="text-sm font-medium">{l.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Sparkles className="h-3.5 w-3.5" />Creativity Level</p>
              <div className="grid grid-cols-3 gap-2">
                {CREATIVITY.map((c) => (
                  <button key={c.id} onClick={() => setCreativity(c.id)} className={cn('rounded-xl border p-3 text-left transition-all', creativity === c.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 hover:border-white/20')}>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Automation Toggles */}
      <Card title="AI Automation">
        <div className="space-y-3">
          <ToggleRow icon={<FileText className="h-4 w-4" />} label="Auto Call Summary" desc="Automatically generate summaries after each call" enabled={autoSummary} onToggle={() => setAutoSummary((v) => !v)} />
          <ToggleRow icon={<Lightbulb className="h-4 w-4" />} label="Auto Suggestions" desc="Show AI suggestions proactively in the CRM" enabled={autoSuggestions} onToggle={() => setAutoSuggestions((v) => !v)} />
          <ToggleRow icon={<Mic className="h-4 w-4" />} label="Voice Assistant" desc="Enable voice input and text-to-speech" enabled={voiceEnabled} onToggle={() => setVoiceEnabled((v) => !v)} />
        </div>
      </Card>

      {/* Security note */}
      <Card>
        <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Zap className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-medium">Security & Privacy</p>
            <p className="mt-1 text-xs text-muted-foreground">API keys are stored exclusively in server-side environment variables and are never sent to the browser. All AI requests are authenticated and rate-limited. Your CRM data is processed in accordance with your chosen provider&apos;s data policy.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ToggleRow({ icon, label, desc, enabled, onToggle }: { icon: React.ReactNode; label: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</div>
        <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      </div>
      <button onClick={onToggle} className={cn('h-6 w-11 rounded-full transition-colors', enabled ? 'bg-primary' : 'bg-white/15')}>
        <motion.span layout className={cn('block h-5 w-5 rounded-full bg-white', enabled ? 'translate-x-5' : 'translate-x-0.5')} style={{ marginTop: '2px' }} />
      </button>
    </div>
  );
}
