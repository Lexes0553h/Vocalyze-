'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Building2, Globe, MapPin, Users, DollarSign, X, Edit, Trash2 } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useCompanies, useContacts, useDeals } from '@/lib/data/hooks';
import type { Company } from '@/lib/crm-data';
import { insertRecord, updateRecord, deleteRecord } from '@/lib/data/crud';
import { toast } from '@/components/ui/toast';

export default function CompaniesPage() {
  const { data: initialCompanies = [], refetch } = useCompanies();
  const [localCompanies, setLocalCompanies] = useState<Company[]>([]);

  const COMPANIES = useMemo(() => {
    return localCompanies.length > 0 ? localCompanies : initialCompanies;
  }, [localCompanies, initialCompanies]);

  const { data: CONTACTS = [] } = useContacts();
  const { data: DEALS = [] } = useDeals();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Company | null>(null);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Technology',
    status: 'Prospect' as Company['status'],
    employees: 50,
    revenue: '$1M - $5M',
    location: 'San Francisco, CA',
    website: 'https://example.com',
  });

  const filtered = COMPANIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      industry: 'SaaS / Enterprise',
      status: 'Prospect',
      employees: 25,
      revenue: '$500K - $2M',
      location: 'New York, NY',
      website: 'www.acme.com',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Company) => {
    setEditingCompany(c);
    setFormData({
      name: c.name,
      industry: c.industry,
      status: c.status,
      employees: c.employees,
      revenue: c.revenue,
      location: c.location,
      website: c.website,
    });
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'Name Required', description: 'Please enter a company name.' });
      return;
    }

    if (editingCompany) {
      const updated = { ...editingCompany, ...formData };
      await updateRecord('companies', editingCompany.id, formData);
      setLocalCompanies((prev) => (prev.length > 0 ? prev : COMPANIES).map((item) => (item.id === editingCompany.id ? updated : item)));
    } else {
      const newCompany: Company = {
        id: `company-${Date.now()}`,
        logo: formData.name.substring(0, 2).toUpperCase(),
        deals: 0,
        dealValue: 0,
        ...formData,
      };
      await insertRecord('companies', newCompany);
      setLocalCompanies((prev) => [newCompany, ...(prev.length > 0 ? prev : COMPANIES)]);
    }

    setIsModalOpen(false);
    if (selected) setSelected(null);
    refetch();
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteRecord('companies', id);
      setLocalCompanies((prev) => (prev.length > 0 ? prev : COMPANIES).filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies Account Database"
        subtitle={`${COMPANIES.length} total companies • ${COMPANIES.filter((c) => c.status === 'Active').length} active accounts`}
        actions={<Button variant="primary" onClick={handleOpenAddModal}><Plus className="h-4 w-4" /> New Company</Button>}
      />

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name or industry…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((company, i) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            onClick={() => setSelected(company)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-700 border border-emerald-100">
                {company.logo || company.name.substring(0, 2).toUpperCase()}
              </div>
              <Badge variant={company.status === 'Active' ? 'green' : company.status === 'Prospect' ? 'cyan' : 'red'}>
                {company.status}
              </Badge>
            </div>
            <h3 className="font-bold text-slate-900">{company.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{company.industry}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <div>
                <p className="text-xs text-slate-400 font-medium">Employees</p>
                <p className="text-xs font-bold text-slate-800">{company.employees}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Revenue</p>
                <p className="text-xs font-bold text-emerald-700">{company.revenue}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit Modal */}
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
                <h3 className="text-lg font-bold text-slate-900">{editingCompany ? 'Edit Company' : 'Add New Company'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Company Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Acme Industries"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Industry</label>
                    <input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g. Fintech"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Company['status'] })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Prospect">Prospect</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Employee Count</label>
                    <input
                      type="number"
                      value={formData.employees}
                      onChange={(e) => setFormData({ ...formData, employees: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Annual Revenue</label>
                    <input
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      placeholder="e.g. $5M"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Location</label>
                    <input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Austin, TX"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">{editingCompany ? 'Update Company' : 'Save Company'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-700 border border-emerald-100">
                    {selected.logo}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                    <p className="text-xs text-slate-500">{selected.industry}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs">
                <div><span className="text-slate-400">Employees</span><p className="font-bold text-slate-800">{selected.employees}</p></div>
                <div><span className="text-slate-400">Revenue</span><p className="font-bold text-emerald-700">{selected.revenue}</p></div>
                <div><span className="text-slate-400">Location</span><p className="font-bold text-slate-800">{selected.location}</p></div>
                <div><span className="text-slate-400">Website</span><p className="font-bold text-blue-600">{selected.website}</p></div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleOpenEditModal(selected)}>Edit Company</Button>
                <Button variant="outline" onClick={() => handleDeleteCompany(selected.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

