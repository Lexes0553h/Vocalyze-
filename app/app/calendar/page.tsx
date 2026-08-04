'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Phone, Users, CheckSquare, Clock, X } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useCalendarEvents } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';
import { insertRecord } from '@/lib/data/crud';
import { toast } from '@/components/ui/toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TYPE_ICONS = { call: Phone, meeting: Users, task: CheckSquare };

export default function CalendarPage() {
  const { data: initialEvents = [], refetch } = useCalendarEvents();
  const [localEvents, setLocalEvents] = useState(initialEvents);

  const events = localEvents.length > 0 ? localEvents : initialEvents;

  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 26));

  // New Event Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    type: 'call' as 'call' | 'meeting' | 'task',
    time: '10:00 AM',
    duration: 30,
    attendees: 1,
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData.title) {
      toast({ title: 'Title Required', description: 'Please enter an event title.' });
      return;
    }

    const newEv = {
      id: `evt-${Date.now()}`,
      ...eventData,
      color: eventData.type === 'meeting' ? 'cyan' : 'primary',
      date: currentDate.toISOString().split('T')[0],
    };

    await insertRecord('calendar_events', newEv);
    setLocalEvents((prev) => [newEv, ...(prev.length > 0 ? prev : initialEvents)]);
    setIsModalOpen(false);
    toast({ title: 'Event Scheduled', description: `${eventData.title} added to calendar.` });
    refetch();
  };

  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00 ${i + 8 < 12 ? 'AM' : 'PM'}`);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Scheduling"
        subtitle="Manage upcoming customer calls, demos, and team check-ins"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'relative rounded-lg px-3 py-1 text-xs font-bold capitalize transition-colors',
                    view === v ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" /> Schedule Event
            </Button>
          </div>
        }
      />

      <Card className="p-0 bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(2026, 6, 26))}>Today</Button>
        </div>

        {/* Week view */}
        {view === 'week' && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[60px_repeat(7,1fr)]">
              <div className="border-b border-slate-100 bg-slate-50" />
              {weekDays.map((d, i) => (
                <div key={i} className={cn('border-b border-l border-slate-100 p-2 text-center bg-slate-50', d.toDateString() === new Date(2026, 6, 26).toDateString() && 'bg-emerald-50/50')}>
                  <p className="text-xs font-semibold text-slate-500">{DAYS[d.getDay()]}</p>
                  <p className={cn('text-base font-bold text-slate-800', d.toDateString() === new Date(2026, 6, 26).toDateString() && 'text-emerald-700')}>{d.getDate()}</p>
                </div>
              ))}
              {hours.map((hour, h) => (
                <div key={`row-${h}`} className="contents">
                  <div className="border-b border-slate-100 px-2 py-3 text-[11px] font-semibold text-slate-400">{hour}</div>
                  {weekDays.map((d, di) => (
                    <div key={`cell-${h}-${di}`} className="relative min-h-[50px] border-b border-l border-slate-100 p-1">
                      {events.filter((e) => e.time.startsWith(String(h + 8))).slice(0, 1).map((ev) => {
                        const Icon = TYPE_ICONS[ev.type as keyof typeof TYPE_ICONS] || Phone;
                        return (
                          <div
                            key={ev.id}
                            className={cn('flex items-center gap-1.5 rounded-lg p-1.5 text-xs font-semibold border', ev.type === 'meeting' ? 'bg-cyan-50 text-cyan-800 border-cyan-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200')}
                          >
                            <Icon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{ev.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day & Month fallbacks */}
        {view !== 'week' && (
          <div className="p-8 text-center text-slate-500 text-sm">
            Switching to {view} view. Standard agenda loaded for July {currentDate.getDate()}, 2026.
          </div>
        )}
      </Card>

      {/* Upcoming events list */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Today's Scheduled Events" className="lg:col-span-2 bg-white border border-slate-200">
          <div className="space-y-2.5">
            {events.map((ev) => {
              const Icon = TYPE_ICONS[ev.type as keyof typeof TYPE_ICONS] || Phone;
              return (
                <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-100/50 transition-colors">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold', ev.type === 'meeting' ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-100 text-emerald-700')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{ev.title}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="h-3 w-3" />{ev.time} • {ev.duration} min • {ev.attendees} attendees
                    </p>
                  </div>
                  <Badge variant="muted" className="capitalize">{ev.type}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Calendar Summary" className="bg-white border border-slate-200">
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <p className="text-xs font-bold text-slate-500">Total Events Scheduled</p>
              <p className="text-2xl font-black text-slate-900">{events.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700">Calls Scheduled</p>
              <p className="text-2xl font-black text-emerald-800">{events.filter((e) => e.type === 'call').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Schedule New Event</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Event Title</label>
                  <input
                    required
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    placeholder="e.g. Product Demo with Acme Corp"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Event Type</label>
                    <select
                      value={eventData.type}
                      onChange={(e) => setEventData({ ...eventData, type: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="task">Task</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Time</label>
                    <input
                      value={eventData.time}
                      onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                      placeholder="e.g. 10:30 AM"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Duration (mins)</label>
                    <input
                      type="number"
                      value={eventData.duration}
                      onChange={(e) => setEventData({ ...eventData, duration: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Attendees</label>
                    <input
                      type="number"
                      value={eventData.attendees}
                      onChange={(e) => setEventData({ ...eventData, attendees: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">Schedule Event</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

