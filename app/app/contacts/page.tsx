'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, Mail, Plus, Building2, X, MessageCircle, FileText, Edit, Trash2, MoreVertical } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import { useContacts } from '@/lib/data/hooks';
import type { Contact } from '@/lib/crm-data';
import { insertRecord, updateRecord, deleteRecord } from '@/lib/data/crud';
import { CommunicationModal, CommType } from '@/components/crm/communication-dialog';
import { toast } from '@/components/ui/toast';

const COMM_TIMELINE = [
  { type: 'call', title: 'Outbound call — 8:42 min', desc: 'Discussed team plan and pricing', time: '2h ago', icon: Phone },
  { type: 'email', title: 'Email: Re: Team plan pricing', desc: 'Sent pricing breakdown for 40 seats', time: '5h ago', icon: Mail },
  { type: 'whatsapp', title: 'WhatsApp message', desc: 'Confirmed demo for Friday', time: '1d ago', icon: MessageCircle },
  { type: 'note', title: 'Note added by Sarah Chen', desc: 'Decision maker. Loop in procurement.', time: '2d ago', icon: FileText },
];

export default function ContactsPage() {
  const { data: initialContacts = [], refetch } = useContacts();
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);

  const CONTACTS = useMemo(() => {
    return localContacts.length > 0 ? localContacts : initialContacts;
  }, [localContacts, initialContacts]);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Communication Modal State
  const [commModal, setCommModal] = useState<{ open: boolean; type: CommType; name?: string; contact?: string }>({
    open: false,
    type: 'call',
  });

  const filtered = useMemo(
    () =>
      CONTACTS.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.company.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      ),
    [CONTACTS, search]
  );

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      role: 'Decision Maker',
      company: '',
      email: '',
      phone: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Contact) => {
    setEditingContact(c);
    setFormData({
      name: c.name,
      role: c.role || '',
      company: c.company,
      email: c.email,
      phone: c.phone,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'Name Required', description: 'Please enter a contact name.' });
      return;
    }

    if (editingContact) {
      const updated = { ...editingContact, ...formData };
      await updateRecord('contacts', editingContact.id, formData);
      setLocalContacts((prev) => (prev.length > 0 ? prev : CONTACTS).map((item) => (item.id === editingContact.id ? updated : item)));
    } else {
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        ...formData,
        tags: ['VIP Contact'],
        avatar: '',
        lastSeen: 'Just now',
      };
      await insertRecord('contacts', newContact);
      setLocalContacts((prev) => [newContact, ...(prev.length > 0 ? prev : CONTACTS)]);
    }

    setIsModalOpen(false);
    if (selected) setSelected(null);
    refetch();
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await deleteRecord('contacts', id);
      setLocalContacts((prev) => (prev.length > 0 ? prev : CONTACTS).filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      refetch();
    }
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
        title="Contacts Directory"
        subtitle={`${CONTACTS.length} contacts across ${new Set(CONTACTS.map((c) => c.company)).size} companies`}
        actions={
          <Button variant="primary" onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4" /> New Contact
          </Button>
        }
      />

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts by name, company, email…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((contact, i) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            onClick={() => setSelected(contact)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <Avatar src={contact.avatar} name={contact.name} size={48} ring />
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(contact); }}
                  className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                  className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-slate-900">{contact.name}</h3>
            <p className="text-xs text-slate-500">{contact.role || 'Executive'}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-600">
              <Building2 className="h-3 w-3 text-emerald-600" />{contact.company}
            </p>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => { e.stopPropagation(); setCommModal({ open: true, type: 'call', name: contact.name, contact: contact.phone }); }}
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" /> Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => { e.stopPropagation(); setCommModal({ open: true, type: 'whatsapp', name: contact.name, contact: contact.phone }); }}
              >
                <MessageCircle className="h-3.5 w-3.5 text-green-600" /> Chat
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">{editingContact ? 'Edit Contact' : 'New Contact'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Pam Beesly"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Company</label>
                    <input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Sabre Corp"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="pam@sabre.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 987-6543"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Job Title / Role</label>
                  <input
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. VP of Operations"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">{editingContact ? 'Update Contact' : 'Save Contact'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl"
            >
              <button onClick={() => setSelected(null)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex flex-col items-center text-center">
                <Avatar src={selected.avatar} name={selected.name} size={72} ring />
                <h2 className="mt-3 text-xl font-bold text-slate-900">{selected.name}</h2>
                <p className="text-sm font-medium text-slate-500">{selected.role} at {selected.company}</p>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-2">
                <Button variant="primary" size="sm" onClick={() => setCommModal({ open: true, type: 'call', name: selected.name, contact: selected.phone })}><Phone className="h-3.5 w-3.5" /> Call</Button>
                <Button variant="outline" size="sm" onClick={() => setCommModal({ open: true, type: 'email', name: selected.name, contact: selected.email })}><Mail className="h-3.5 w-3.5" /> Email</Button>
                <Button variant="outline" size="sm" onClick={() => setCommModal({ open: true, type: 'whatsapp', name: selected.name, contact: selected.phone })}><MessageCircle className="h-3.5 w-3.5" /> Chat</Button>
              </div>

              <Card className="mb-4 bg-slate-50 border border-slate-200" title="Contact Info">
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-600" />{selected.email || 'N/A'}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-600" />{selected.phone || 'N/A'}</div>
                  <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-600" />{selected.company}</div>
                </div>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleOpenEditModal(selected)}>Edit Contact</Button>
                <Button variant="outline" onClick={() => handleDeleteContact(selected.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

