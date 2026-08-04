'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Plus, Play, Pause, Trash2, ArrowDown, MoreVertical,
  Filter, Send, Calendar, User, MessageCircle,
  CheckSquare, Building2, X, Bot, Sparkles, Webhook,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, EmptyState } from '@/components/crm/crm-ui';
import { useAiRequest } from '@/lib/data/ai-hooks';
import { cn } from '@/lib/utils';

interface FlowStep { id: string; type: 'trigger' | 'condition' | 'action'; label: string; icon: typeof Zap }
interface Flow { id: string; name: string; description: string; isActive: boolean; executions: number; steps: FlowStep[] }

const TRIGGERS = [
  { type: 'lead_created', label: 'When a lead is created', icon: User },
  { type: 'call_completed', label: 'When a call is completed', icon: Zap },
  { type: 'deal_won', label: 'When a deal is won', icon: Building2 },
  { type: 'task_overdue', label: 'When a task is overdue', icon: CheckSquare },
];

const CONDITIONS = [
  { type: 'score_above', label: 'If lead score is above 80', icon: Filter },
  { type: 'value_above', label: 'If deal value exceeds $10K', icon: Filter },
  { type: 'status_is', label: 'If lead status is Qualified', icon: Filter },
  { type: 'source_is', label: 'If lead source is WhatsApp', icon: Filter },
];

const ACTIONS = [
  { type: 'assign', label: 'Assign to manager (round-robin)', icon: User },
  { type: 'send_whatsapp', label: 'Send WhatsApp message', icon: MessageCircle },
  { type: 'send_email', label: 'Send email', icon: Send },
  { type: 'schedule_followup', label: 'Schedule follow-up call', icon: Calendar },
  { type: 'create_task', label: 'Create task', icon: CheckSquare },
  { type: 'ai_score', label: 'Run AI lead scoring', icon: Sparkles },
];

const TEMPLATES = [
  { name: 'Hot Lead Routing', desc: 'Auto-assign and follow up with high-score leads', trigger: 'lead_created' },
  { name: 'Welcome Sequence', desc: 'Send welcome messages to new leads via WhatsApp', trigger: 'lead_created' },
  { name: 'Won Deal Celebration', desc: 'Create tasks and send confirmation when a deal is won', trigger: 'deal_won' },
  { name: 'Overdue Task Alert', desc: 'Notify manager when tasks are overdue', trigger: 'task_overdue' },
];

let stepId = 0;
const nextId = () => `step-${++stepId}`;

export default function AutomationPage() {
  const { request } = useAiRequest();
  const [flows, setFlows] = useState<Flow[]>([
    { id: '1', name: 'Hot Lead Auto-Assignment', description: 'Routes high-score leads to managers and sends WhatsApp', isActive: true, executions: 42, steps: [
      { id: 's1', type: 'trigger', label: 'When a lead is created', icon: User },
      { id: 's2', type: 'condition', label: 'If lead score is above 80', icon: Filter },
      { id: 's3', type: 'action', label: 'Assign to manager (round-robin)', icon: User },
      { id: 's4', type: 'action', label: 'Send WhatsApp message', icon: MessageCircle },
      { id: 's5', type: 'action', label: 'Schedule follow-up call', icon: Calendar },
    ]},
  ]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderSteps, setBuilderSteps] = useState<FlowStep[]>([]);
  const [flowName, setFlowName] = useState('');
  const [flowDesc, setFlowDesc] = useState('');
  const [showPalette, setShowPalette] = useState<'trigger' | 'condition' | 'action' | null>(null);

  const addStep = (type: 'trigger' | 'condition' | 'action', label: string, icon: typeof Zap) => {
    setBuilderSteps((s) => [...s, { id: nextId(), type, label, icon }]);
    setShowPalette(null);
  };

  const removeStep = (id: string) => setBuilderSteps((s) => s.filter((st) => st.id !== id));

  const saveFlow = () => {
    if (!flowName || builderSteps.length === 0) return;
    setFlows((f) => [...f, { id: nextId(), name: flowName, description: flowDesc, isActive: false, executions: 0, steps: builderSteps }]);
    setFlowName(''); setFlowDesc(''); setBuilderSteps([]); setShowBuilder(false);
  };

  const toggleFlow = (id: string) => setFlows((f) => f.map((fl) => fl.id === id ? { ...fl, isActive: !fl.isActive } : fl));

  const aiSuggest = async () => {
    const res = await request('automation-suggest', 'Suggest an automation flow for new high-value leads');
    if (res?.structured) {
      const s = res.structured as { suggestedFlow: { trigger: { label: string; type: string }; steps: { label: string; type: string }[] } };
      const iconMap: Record<string, typeof Zap> = { action: Zap, condition: Filter, trigger: User };
      setBuilderSteps([
        { id: nextId(), type: 'trigger', label: s.suggestedFlow.trigger.label, icon: User },
        ...s.suggestedFlow.steps.map((st) => ({ id: nextId(), type: st.type as 'trigger' | 'condition' | 'action', label: st.label, icon: iconMap[st.type] ?? Zap })),
      ]);
    }
  };

  const stepColor = (type: string) => type === 'trigger' ? 'border-primary/30 bg-primary/5' : type === 'condition' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-cyan/30 bg-cyan/5';
  const stepIconColor = (type: string) => type === 'trigger' ? 'text-primary' : type === 'condition' ? 'text-yellow-400' : 'text-cyan';

  return (
    <div className="space-y-6">
      <PageHeader title="Automation Builder" subtitle="Create visual workflows with triggers, conditions, and actions." actions={<Button variant="primary" onClick={() => { setShowBuilder(true); setBuilderSteps([]); }}><Plus className="h-4 w-4" />New Flow</Button>} />

      {/* Templates */}
      <Card title="Templates" delay={0.05}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t, i) => (
            <motion.button key={t.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }} onClick={() => { setShowBuilder(true); setFlowName(t.name); setFlowDesc(t.desc); setBuilderSteps([]); }} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Zap className="h-5 w-5" /></div>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Existing flows */}
      <div className="space-y-3">
        {flows.map((flow, i) => (
          <motion.div key={flow.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', flow.isActive ? 'bg-primary/15 text-primary' : 'bg-white/5 text-muted-foreground')}><Zap className="h-5 w-5" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{flow.name}</p>
                      <Badge variant={flow.isActive ? 'green' : 'muted'}>{flow.isActive ? 'Active' : 'Paused'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{flow.description || 'No description'} • {flow.executions} runs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleFlow(flow.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground">{flow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {flow.steps.map((step, si) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs', stepColor(step.type))}>
                      <step.icon className={cn('h-3.5 w-3.5', stepIconColor(step.type))} />
                      <span>{step.label}</span>
                    </div>
                    {si < flow.steps.length - 1 && <ArrowDown className="h-3 w-3 rotate-[-90deg] text-muted-foreground/50" />}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Builder modal */}
      <AnimatePresence>
        {showBuilder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBuilder(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-2xl rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">Build Automation Flow</h2>
                  <button onClick={() => setShowBuilder(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Flow Name</p><input value={flowName} onChange={(e) => setFlowName(e.target.value)} placeholder="e.g. Hot Lead Routing" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                  <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Description</p><input value={flowDesc} onChange={(e) => setFlowDesc(e.target.value)} placeholder="What does this flow do?" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                </div>

                <Button variant="secondary" size="sm" onClick={aiSuggest} className="mb-4"><Bot className="h-3.5 w-3.5" />Suggest with AI</Button>

                {/* Flow canvas */}
                <div className="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-xl bg-white/[0.02] p-4">
                  {builderSteps.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Add a trigger to start building your flow.</div>
                  ) : (
                    builderSteps.map((step, si) => (
                      <div key={step.id}>
                        <div className={cn('flex items-center justify-between rounded-lg border px-3 py-2.5', stepColor(step.type))}>
                          <div className="flex items-center gap-2">
                            <step.icon className={cn('h-4 w-4', stepIconColor(step.type))} />
                            <span className="text-sm">{step.label}</span>
                            <Badge variant="muted" className="capitalize">{step.type}</Badge>
                          </div>
                          <button onClick={() => removeStep(step.id)} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-white/10 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                        </div>
                        {si < builderSteps.length - 1 && <div className="flex justify-center py-1"><ArrowDown className="h-4 w-4 text-muted-foreground/50" /></div>}
                      </div>
                    ))
                  )}
                </div>

                {/* Step palette */}
                <div className="mb-4 flex gap-2">
                  <button onClick={() => setShowPalette('trigger')} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', showPalette === 'trigger' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground hover:bg-white/10')}><Webhook className="mr-1 inline h-3 w-3" />Triggers</button>
                  <button onClick={() => setShowPalette('condition')} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', showPalette === 'condition' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-muted-foreground hover:bg-white/10')}><Filter className="mr-1 inline h-3 w-3" />Conditions</button>
                  <button onClick={() => setShowPalette('action')} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', showPalette === 'action' ? 'bg-cyan/20 text-cyan' : 'bg-white/5 text-muted-foreground hover:bg-white/10')}><Zap className="mr-1 inline h-3 w-3" />Actions</button>
                </div>

                <AnimatePresence>
                  {showPalette && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-2">
                        {(showPalette === 'trigger' ? TRIGGERS : showPalette === 'condition' ? CONDITIONS : ACTIONS).map((item) => {
                          const Icon = item.icon;
                          return (
                            <button key={item.type} onClick={() => addStep(showPalette, item.label, Icon)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
                              <Icon className="h-3.5 w-3.5" />{item.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1" disabled={!flowName || builderSteps.length === 0} onClick={saveFlow}><Zap className="h-4 w-4" />Save Flow</Button>
                  <Button variant="secondary" onClick={() => setShowBuilder(false)}>Cancel</Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
