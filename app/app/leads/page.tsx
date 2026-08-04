'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Upload,
  LayoutGrid,
  Table as TableIcon,
  Columns3,
  X,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  Tag,
  UserCog,
  MessageCircle,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar, SectionTabs } from '@/components/crm/crm-ui';
import { useLeads } from '@/lib/data/hooks';
import type { Lead } from '@/lib/crm-data';
import { insertRecord, updateRecord, deleteRecord } from '@/lib/data/crud';
import { CommunicationModal, CommType } from '@/components/crm/communication-dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const STATUS_COLORS: Record<Lead['status'], 'muted' | 'cyan' | 'primary' | 'green' | 'yellow' | 'red'> = {
  New: 'muted',
  Contacted: 'cyan',
  Qualified: 'primary',
  Proposal: 'yellow',
  Negotiation: 'primary',
  Won: 'green',
  Lost: 'red',
};

const KANBAN_COLUMNS: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won'];

export default function LeadsPage() {
  const { data: LEADS = [], refetch } = useLeads();

  const [view, setView] = useState<'kanban' | 'table' | 'grid'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New' as Lead['status'],
    priority: 'Medium' as Lead['priority'],
    value: 10000,
    source: 'Website',
    notes: '',
  });

  // Comm Modal
  const [commModal, setCommModal] = useState<{ open: boolean; type: CommType; name?: string; contact?: string }>({
    open: false,
    type: 'call',
  });

  const filtered = useMemo(() => {
    return LEADS.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [LEADS, search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'New',
      priority: 'Medium',
      value: 15000,
      source: 'Inbound Call',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      priority: lead.priority,
      value: lead.value,
      source: lead.source || 'Direct',
      notes: lead.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'Name Required', description: 'Please enter a valid lead name.' });
      return;
    }

    if (editingLead) {
      // Update
      await updateRecord('leads', editingLead.id, formData);
      toast({ title: 'Lead Updated', description: `${formData.name} was saved.` });
    } else {
      // Add
      const newLeadPayload = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        priority: formData.priority,
        value: formData.value,
        source: formData.source,
        notes: formData.notes,
        tags: ['New Prospect'],
        agent: 'Current User',
        avatar: '',
        last_contact: new Date().toISOString(),
      };
      await insertRecord('leads', newLeadPayload);
      toast({ title: 'Lead Created', description: `${formData.name} was added to pipeline.` });
    }

    setIsModalOpen(false);
    if (selected) setSelected(null);
    refetch();
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteRecord('leads', id);
      if (selected?.id === id) setSelected(null);
      toast({ title: 'Lead Deleted', description: 'Lead removed from database.' });
      refetch();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      <CommunicationModal
        open={commModal.open}
        onOpenChange={(open) => setCommModal((prev) => ({ ...prev, open }))}
        type={commModal.type}
        recipientName={commModal.name}
        recipientContact={commModal.contact}
      />

      <PageHeader
        title="Leads Management"
        subtitle={`${LEADS.length} total prospects • ${LEADS.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length} active pipeline deals`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto" onClick={() => toast({ title: 'Export', description: 'Exporting CSV file...' })}><Download className="h-4 w-4" /> Export CSV</Button>
            <Button variant="primary" size="md" className="w-full sm:w-auto" onClick={handleOpenAddModal}><Plus className="h-4 w-4" /> Add Lead</Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, email, company…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            {KANBAN_COLUMNS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <SectionTabs tabs={['kanban', 'table', 'grid']} active={view} onChange={(v) => setView(v as typeof view)} />
        </div>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <span className="text-sm font-semibold text-slate-800">{selectedIds.length} selected</span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => toast({ title: 'Assigned', description: 'Assigned selected leads to telecaller queue.' })}><UserCog className="h-3.5 w-3.5" />Assign</Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const colLeads = filtered.filter((l) => l.status === col);
            const total = colLeads.reduce((sum, l) => sum + (l.value || 0), 0);
            return (
              <div key={col} className="w-72 shrink-0">
                <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 p-2.5">
                  <span className="text-sm font-bold text-slate-800">{col} ({colLeads.length})</span>
                  <span className="text-xs font-semibold text-emerald-700">${(total / 1000).toFixed(0)}K</span>
                </div>
                <div className="space-y-2.5">
                  {colLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      layout
                      onClick={() => setSelected(lead)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar src={lead.avatar} name={lead.name} size={32} ring />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                            <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                          </div>
                        </div>
                        <Badge variant={lead.priority === 'Urgent' ? 'red' : lead.priority === 'High' ? 'yellow' : 'muted'}>
                          {lead.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                        <span className="text-sm font-extrabold text-emerald-700">${((lead.value || 0) / 1000).toFixed(0)}K</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setCommModal({ open: true, type: 'call', name: lead.name, contact: lead.phone }); }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(lead); }}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                      No leads in {col}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'table' && (
        <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Deal Value</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={lead.avatar} name={lead.name} size={32} />
                          <div>
                            <p className="font-bold text-slate-900">{lead.name}</p>
                            <p className="text-xs text-slate-500">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{lead.company}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_COLORS[lead.status]}>{lead.status}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={lead.priority === 'Urgent' ? 'red' : 'muted'}>{lead.priority}</Badge></td>
                      <td className="px-4 py-3 font-bold text-emerald-700">${((lead.value || 0) / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setCommModal({ open: true, type: 'call', name: lead.name, contact: lead.phone })}>
                            <Phone className="h-3.5 w-3.5 text-emerald-600" /> Call
                          </Button>
                          <button onClick={() => handleOpenEditModal(lead)} className="p-1.5 text-slate-400 hover:text-blue-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteLead(lead.id)} className="p-1.5 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">
                      No leads found in database. Click &quot;Add Lead&quot; above to create your first lead.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLead} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Michael Scott"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Company</label>
                    <input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Dunder Mifflin"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="mscott@dundermifflin.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      {KANBAN_COLUMNS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Lead['priority'] })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Deal Value ($)</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Notes & Prospect Context</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter telecaller notes..."
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="primary" className="w-full sm:w-auto">{editingLead ? 'Update Lead' : 'Save Lead'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar src={selected.avatar} name={selected.name} size={48} ring />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{selected.company} • {selected.email}</p>
                    <div className="mt-1 flex gap-1.5">
                      <Badge variant={STATUS_COLORS[selected.status]}>{selected.status}</Badge>
                      <Badge variant={selected.priority === 'Urgent' ? 'red' : 'muted'}>{selected.priority}</Badge>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 rounded-xl bg-slate-50 p-3">
                <div>
                  <span className="text-xs text-slate-500">Deal Value</span>
                  <p className="text-lg font-extrabold text-emerald-700">${((selected.value || 0) / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Phone</span>
                  <p className="text-sm font-bold text-slate-800">{selected.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-xs font-bold text-slate-700">Notes & Interaction History</span>
                  <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selected.notes || 'No specific notes entered yet.'}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="primary" className="w-full sm:flex-1" onClick={() => setCommModal({ open: true, type: 'call', name: selected.name, contact: selected.phone })}>
                  <Phone className="h-4 w-4" /> Start Call
                </Button>
                <Button variant="outline" className="w-full sm:flex-1" onClick={() => setCommModal({ open: true, type: 'whatsapp', name: selected.name, contact: selected.phone })}>
                  <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => handleOpenEditModal(selected)}>
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => handleDeleteLead(selected.id)} className="text-red-600 hover:bg-red-50 flex-1 sm:flex-none">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

