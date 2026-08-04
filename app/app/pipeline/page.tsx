'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Calendar, User, TrendingUp, X, Edit3, Trash2, Tag, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/crm/crm-ui';
import { useDeals } from '@/lib/data/hooks';
import type { Deal } from '@/lib/crm-data';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const STAGES: { id: Deal['stage']; label: string; color: string }[] = [
  { id: 'Lead', label: 'Lead', color: 'bg-slate-400' },
  { id: 'Qualified', label: 'Qualified', color: 'bg-cyan' },
  { id: 'Proposal', label: 'Proposal', color: 'bg-amber-400' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-primary' },
  { id: 'Closed', label: 'Closed Won', color: 'bg-emerald-400' },
];

export default function PipelinePage() {
  const { data: DEALS = [] } = useDeals();
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [dragged, setDragged] = useState<Deal | null>(null);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [formId, setFormId] = useState('');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('25000');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState<Deal['stage']>('Lead');
  const [agent, setAgent] = useState('Sarah Chen');
  const [probability, setProbability] = useState('50');
  const [expectedClose, setExpectedClose] = useState('2026-03-31');
  const [followUpDate, setFollowUpDate] = useState('2026-02-15');
  const [tags, setTags] = useState('Enterprise, Urgent');
  const [priority, setPriority] = useState('High');
  const [notes, setNotes] = useState('');

  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const weightedValue = deals.reduce((s, d) => s + ((d.value || 0) * (d.probability || 0)) / 100, 0);

  const resetForm = () => {
    setFormId('');
    setTitle('');
    setValue('25000');
    setContact('');
    setPhone('');
    setEmail('');
    setCompany('');
    setStage('Lead');
    setAgent('Sarah Chen');
    setProbability('50');
    setExpectedClose('2026-03-31');
    setFollowUpDate('2026-02-15');
    setTags('Enterprise');
    setPriority('Medium');
    setNotes('');
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (d: Deal) => {
    setFormId(d.id);
    setTitle(d.title);
    setValue(String(d.value));
    setContact(d.contact || '');
    setPhone(d.phone || '+1 (555) 019-2834');
    setEmail(d.email || 'contact@client.com');
    setCompany(d.company);
    setStage(d.stage);
    setAgent(d.agent || 'Sarah Chen');
    setProbability(String(d.probability || 50));
    setExpectedClose(d.expectedClose || '2026-03-31');
    setFollowUpDate(d.nextActivity || '2026-02-15');
    setTags(d.tags ? d.tags.join(', ') : 'Enterprise');
    setPriority(d.priority || 'Medium');
    setNotes(d.notes || 'Interested in annual subscription license.');
    setIsEditModalOpen(true);
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast({ title: 'Validation Error', description: 'Please enter deal title.' });
      return;
    }

    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      title,
      value: Number(value) || 0,
      stage,
      probability: Number(probability) || 50,
      contact: contact || 'Key Decision Maker',
      company: company || 'Acme Corp',
      agent,
      expectedClose,
      email,
      phone,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      priority,
      notes,
    };

    setDeals([newDeal, ...deals]);
    setIsAddModalOpen(false);
    toast({ title: 'Deal Created!', description: `"${title}" added to ${stage} stage.` });
  };

  const handleUpdateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    setDeals((prev) =>
      prev.map((d) =>
        d.id === formId
          ? {
              ...d,
              title,
              value: Number(value) || 0,
              stage,
              probability: Number(probability) || 50,
              contact,
              company,
              agent,
              expectedClose,
              email,
              phone,
              tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
              priority,
              notes,
            }
          : d
      )
    );
    setIsEditModalOpen(false);
    setSelected(null);
    toast({ title: 'Deal Updated', description: `Changes saved for "${title}".` });
  };

  const handleDeleteDeal = () => {
    if (!selected) return;
    setDeals((prev) => prev.filter((d) => d.id !== selected.id));
    setIsDeleteModalOpen(false);
    setSelected(null);
    toast({ title: 'Deal Deleted', description: 'Deal removed from pipeline.' });
  };

  const handleDrop = (targetStage: Deal['stage']) => {
    if (!dragged) return;
    setDeals((prev) => prev.map((d) => (d.id === dragged.id ? { ...d, stage: targetStage } : d)));
    toast({ title: 'Stage Changed', description: `Moved "${dragged.title}" to ${targetStage}` });
    setDragged(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Pipeline & Kanban"
        subtitle={`${deals.length} active deals • $${totalValue.toLocaleString()} pipeline value • $${weightedValue.toLocaleString()} weighted forecast`}
        actions={
          <Button variant="primary" onClick={openAddModal} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" /> New Deal
          </Button>
        }
      />

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const stageDeals = deals.filter((d) => d.stage === s.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
          return (
            <div
              key={s.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(s.id)}
              className="w-72 shrink-0"
            >
              <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 dark:bg-white/5 px-3 py-2 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', s.color)} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.label}</span>
                  <span className="text-xs font-semibold text-muted-foreground">({stageDeals.length})</span>
                </div>
                <span className="text-xs font-bold text-primary">${stageValue.toLocaleString()}</span>
              </div>

              <div
                className={cn(
                  'min-h-[220px] space-y-2.5 rounded-2xl border-2 border-dashed p-2 transition-colors',
                  dragged ? 'border-primary/40 bg-primary/5' : 'border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]'
                )}
              >
                {stageDeals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={() => setDragged(deal)}
                    onDragEnd={() => setDragged(null)}
                    onClick={() => setSelected(deal)}
                    whileHover={{ y: -2 }}
                    className={cn(
                      'cursor-grab rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-3.5 shadow-sm transition-all hover:shadow-md hover:border-primary/40 active:cursor-grabbing',
                      dragged?.id === deal.id && 'opacity-40'
                    )}
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{deal.title}</p>
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(deal); }} className="text-muted-foreground hover:text-foreground p-1">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">{deal.company} {deal.contact ? `• ${deal.contact}` : ''}</p>
                    
                    <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {deal.expectedClose}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{deal.probability}% win</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2">
                      <span className="text-[11px] font-medium text-slate-500">
                        {deal.agent ? deal.agent.split(' ')[0] : 'Unassigned'}
                      </span>
                      <span className="text-xs font-extrabold text-primary">${deal.value?.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="flex h-36 items-center justify-center text-xs font-medium text-slate-400">
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal onClose={() => setIsAddModalOpen(false)} title="Create New Deal">
            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deal Title *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Enterprise License Expansion" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deal Value ($) *</label>
                  <input type="number" required value={value} onChange={(e) => setValue(e.target.value)} placeholder="25000" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pipeline Stage</label>
                  <select value={stage} onChange={(e) => setStage(e.target.value as Deal['stage'])} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none">
                    {STAGES.map((s) => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="John Doe" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@acme.com" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Employee</label>
                  <select value={agent} onChange={(e) => setAgent(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none">
                    <option value="Sarah Chen">Sarah Chen</option>
                    <option value="James Holt">James Holt</option>
                    <option value="Marcus Reid">Marcus Reid</option>
                    <option value="Lena Ortiz">Lena Ortiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expected Closing Date</label>
                  <input type="date" value={expectedClose} onChange={(e) => setExpectedClose(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes & Next Actions</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add conversation details or next follow-up agenda..." className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Deal</Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Deal Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <Modal onClose={() => setIsEditModalOpen(false)} title="Edit Deal Details">
            <form onSubmit={handleUpdateDeal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deal Title *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deal Value ($)</label>
                  <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pipeline Stage</label>
                  <select value={stage} onChange={(e) => setStage(e.target.value as Deal['stage'])} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none">
                    {STAGES.map((s) => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-sm focus:border-primary/50 focus:outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Selected Deal Detail View */}
      <AnimatePresence>
        {selected && !isEditModalOpen && !isDeleteModalOpen && (
          <Modal onClose={() => setSelected(null)} title="Deal Overview">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selected.title}</h3>
                  <p className="text-xs text-muted-foreground">{selected.company} • Contact: {selected.contact || 'N/A'}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(selected)}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsDeleteModalOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                  <p className="text-[11px] font-semibold text-primary">Deal Value</p>
                  <p className="text-xl font-black text-primary">${selected.value?.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-white/5 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground">Win Likelihood</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{selected.probability}%</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5"><span className="text-muted-foreground">Stage</span><Badge variant="primary">{selected.stage}</Badge></div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5"><span className="text-muted-foreground">Owner</span><span className="font-semibold">{selected.agent}</span></div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5"><span className="text-muted-foreground">Expected Close</span><span>{selected.expectedClose}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Phone</span><span>{selected.phone || '+1 (555) 019-2834'}</span></div>
              </div>

              {selected.notes && (
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 border border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{selected.notes}</p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selected && (
          <Modal onClose={() => setIsDeleteModalOpen(false)} title="Delete Deal">
            <div className="space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selected.title}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleDeleteDeal} className="bg-red-600 hover:bg-red-700">Delete Deal</Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </>
  );
}
