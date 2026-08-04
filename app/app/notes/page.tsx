'use client';

import { useState } from 'react';
import { FileText, Plus, Search, Tag, Trash2, Edit3, Lock, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Modal } from '@/components/crm/crm-ui';
import { toast } from '@/components/ui/toast';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  leadName?: string;
  category: 'Call Remark' | 'Follow-up' | 'Meeting Notes' | 'Personal';
  createdAt: string;
}

const INITIAL_NOTES: NoteItem[] = [];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Call Remark' | 'Follow-up' | 'Meeting Notes' | 'Personal'>('Call Remark');
  const [leadName, setLeadName] = useState('');

  const filtered = notes.filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({ title: 'Validation Error', description: 'Title and content are required.' });
      return;
    }
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title,
      content,
      leadName: leadName || undefined,
      category,
      createdAt: 'Just now',
    };
    setNotes([newNote, ...notes]);
    setModalOpen(false);
    setTitle('');
    setContent('');
    setLeadName('');
    toast({ title: 'Note Saved', description: 'Your note has been recorded.' });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: 'Note Deleted', description: 'Note removed from list.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telecaller Notes & Call Scratchpad"
        subtitle="Workstation • Quick Remarks, Lead Conversation Notes & Follow-up Log"
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add New Note
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((note) => (
          <Card key={note.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="green">{note.category}</Badge>
                <span className="text-[11px] text-slate-400">{note.createdAt}</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{note.title}</h3>
                {note.leadName && <p className="text-xs font-semibold text-emerald-700 mt-0.5">Lead: {note.leadName}</p>}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {note.content}
              </p>

              <div className="flex justify-end pt-2">
                <Button size="sm" variant="ghost" onClick={() => deleteNote(note.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Telecaller Note">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp Pricing Inquiry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as unknown as typeof category)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="Call Remark">Call Remark</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Meeting Notes">Meeting Notes</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Lead (Optional)</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Remarks</label>
            <textarea
              rows={4}
              required
              placeholder="Enter detailed call remarks or action items…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Note</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
