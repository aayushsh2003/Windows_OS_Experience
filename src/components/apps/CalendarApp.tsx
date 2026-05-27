import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, Search, CalendarDays,
  LayoutGrid, List, Bell, Edit2, Trash2, Tag, Repeat, MapPin
} from 'lucide-react';

/* ─── types ─── */
type ViewMode = 'month' | 'week' | 'day';
type EventCategory = 'work' | 'personal' | 'health' | 'meeting' | 'reminder' | 'other';

interface CalEvent {
  id: string;
  date: string;        // YYYY-MM-DD
  endDate?: string;     // multi-day
  title: string;
  description?: string;
  time?: string;        // HH:mm
  endTime?: string;
  color: string;
  category: EventCategory;
  location?: string;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'none';
  reminder?: boolean;
}

const CATEGORY_META: Record<EventCategory, { label: string; color: string; icon: string }> = {
  work:     { label: 'Work',     color: 'hsl(207,90%,54%)', icon: '💼' },
  personal: { label: 'Personal', color: 'hsl(270,60%,55%)', icon: '🏠' },
  health:   { label: 'Health',   color: 'hsl(150,60%,45%)', icon: '💪' },
  meeting:  { label: 'Meeting',  color: 'hsl(350,80%,55%)', icon: '👥' },
  reminder: { label: 'Reminder', color: 'hsl(40,90%,50%)',  icon: '🔔' },
  other:    { label: 'Other',    color: 'hsl(200,10%,55%)', icon: '📌' },
};

const LS_KEY = 'win-calendar-events';

function loadEvents(): CalEvent[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : getDefaultEvents();
  } catch { return getDefaultEvents(); }
}

function getDefaultEvents(): CalEvent[] {
  const today = fmtDate(new Date());
  return [
    { id: '1', date: today, title: 'Welcome to Calendar!', color: CATEGORY_META.personal.color, category: 'personal', time: '09:00' },
    { id: '2', date: today, title: 'Team standup', color: CATEGORY_META.meeting.color, category: 'meeting', time: '10:00', endTime: '10:30', recurring: 'daily' },
  ];
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => { const r = new Date(d); r.setDate(d.getDate() + i); return r; });
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/* ═══ MAIN ═══ */
export function CalendarApp() {
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>(loadEvents);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('month');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('personal');
  const [formLocation, setFormLocation] = useState('');
  const [formRecurring, setFormRecurring] = useState<CalEvent['recurring']>('none');
  const [formReminder, setFormReminder] = useState(false);
  const [formColor, setFormColor] = useState(CATEGORY_META.personal.color);

  // persist
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(events)); }, [events]);

  const year = current.getFullYear();
  const month = current.getMonth();
  const today = fmtDate(new Date());

  /* ─── navigation ─── */
  const nav = useCallback((dir: number) => {
    setCurrent(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      else if (view === 'week') d.setDate(d.getDate() + dir * 7);
      else d.setDate(d.getDate() + dir);
      return d;
    });
  }, [view]);

  const goToday = () => { setCurrent(new Date()); setSelected(fmtDate(new Date())); };

  /* ─── month grid ─── */
  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells: { day: number; date: string; isCurrentMonth: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dt = new Date(year, month - 1, d);
      cells.push({ day: d, date: fmtDate(dt), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, date: fmtDate(new Date(year, month, i)), isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const dt = new Date(year, month + 1, i);
      cells.push({ day: i, date: fmtDate(dt), isCurrentMonth: false });
    }
    return cells;
  }, [year, month]);

  const weekDays = useMemo(() => getWeekDays(current), [current]);

  /* ─── event helpers ─── */
  const eventsForDate = useCallback((date: string) => events.filter(e => e.date === date), [events]);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return events.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q));
  }, [events, search]);

  /* ─── form ─── */
  const openNewEvent = (date?: string) => {
    setEditEvent(null);
    setFormTitle(''); setFormDesc(''); setFormTime('09:00'); setFormEndTime('10:00');
    setFormCategory('personal'); setFormLocation(''); setFormRecurring('none');
    setFormReminder(false); setFormColor(CATEGORY_META.personal.color);
    if (date) setSelected(date);
    setShowForm(true);
  };

  const openEditEvent = (ev: CalEvent) => {
    setEditEvent(ev);
    setFormTitle(ev.title); setFormDesc(ev.description || ''); setFormTime(ev.time || '');
    setFormEndTime(ev.endTime || ''); setFormCategory(ev.category); setFormLocation(ev.location || '');
    setFormRecurring(ev.recurring || 'none'); setFormReminder(ev.reminder || false);
    setFormColor(ev.color);
    setShowForm(true);
  };

  const saveEvent = () => {
    if (!formTitle.trim() || !selected) return;
    const ev: CalEvent = {
      id: editEvent?.id || Date.now().toString(),
      date: selected,
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      time: formTime || undefined,
      endTime: formEndTime || undefined,
      color: formColor,
      category: formCategory,
      location: formLocation.trim() || undefined,
      recurring: formRecurring === 'none' ? undefined : formRecurring,
      reminder: formReminder || undefined,
    };
    if (editEvent) {
      setEvents(prev => prev.map(e => e.id === editEvent.id ? ev : e));
    } else {
      setEvents(prev => [...prev, ev]);
    }
    setShowForm(false); setEditEvent(null);
  };

  const removeEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const selectedEvents = selected ? eventsForDate(selected).sort((a, b) => (a.time || '').localeCompare(b.time || '')) : [];

  /* ─── header label ─── */
  const headerLabel = view === 'month'
    ? current.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : view === 'week'
      ? `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : current.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        {/* Nav */}
        <button onClick={() => nav(-1)} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <button onClick={goToday} className="px-2 py-0.5 text-[10px] font-medium rounded border border-border hover:bg-muted text-foreground transition-colors">
          Today
        </button>
        <button onClick={() => nav(1)} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>

        <h2 className="text-sm font-semibold text-foreground flex-1 text-center">{headerLabel}</h2>

        {/* View toggles */}
        <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
          {([['month', LayoutGrid], ['week', CalendarDays], ['day', List]] as [ViewMode, any][]).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`p-1 rounded text-[10px] transition-colors ${view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Search */}
        <button onClick={() => setShowSearch(!showSearch)} className="p-1 rounded hover:bg-muted transition-colors">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Add */}
        <button onClick={() => openNewEvent(selected || today)}
          className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-3 py-2 border-b border-border bg-muted/20">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
              className="w-full pl-7 pr-2 py-1 text-xs rounded border border-input bg-background text-foreground placeholder:text-muted-foreground" autoFocus />
          </div>
          {search && filteredEvents.length > 0 && (
            <div className="mt-1 max-h-32 overflow-y-auto win-scrollbar space-y-0.5">
              {filteredEvents.map(ev => (
                <button key={ev.id} onClick={() => { setSelected(ev.date); setSearch(''); setShowSearch(false); setView('month'); }}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-muted text-left">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.color }} />
                  <span className="text-[11px] text-foreground truncate">{ev.title}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{ev.date}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Body ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main area */}
        <div className="flex-1 overflow-auto win-scrollbar">
          {view === 'month' && <MonthView days={monthDays} today={today} selected={selected} events={events}
            onSelect={d => setSelected(d === selected ? null : d)} onDoubleClick={d => { setSelected(d); openNewEvent(d); }} />}
          {view === 'week' && <WeekView weekDays={weekDays} today={today} selected={selected} events={events}
            onSelect={d => setSelected(d === selected ? null : d)} onEventClick={openEditEvent} />}
          {view === 'day' && <DayView date={current} today={today} events={eventsForDate(fmtDate(current))} onEventClick={openEditEvent} />}
        </div>

        {/* ─── Sidebar ─── */}
        {selected && !showForm && (
          <div className="w-56 border-l border-border flex flex-col overflow-hidden bg-muted/10">
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <p className="text-xs font-semibold text-foreground">
                {new Date(selected + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <div className="flex gap-0.5">
                <button onClick={() => openNewEvent(selected)} className="p-1 rounded hover:bg-muted"><Plus className="w-3 h-3 text-primary" /></button>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-muted"><X className="w-3 h-3 text-muted-foreground" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto win-scrollbar px-3 pb-3">
              {selectedEvents.length === 0 && <p className="text-[10px] text-muted-foreground py-4 text-center">No events this day</p>}
              {selectedEvents.map(ev => (
                <div key={ev.id} className="mb-2 p-2 rounded-lg border border-border hover:bg-muted/50 group transition-colors" style={{ borderLeftColor: ev.color, borderLeftWidth: 3 }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{ev.title}</p>
                      {ev.time && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground truncate">{ev.location}</span>
                        </div>
                      )}
                      {ev.recurring && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Repeat className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground capitalize">{ev.recurring}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditEvent(ev)} className="p-0.5 rounded hover:bg-muted"><Edit2 className="w-2.5 h-2.5 text-muted-foreground" /></button>
                      <button onClick={() => removeEvent(ev.id)} className="p-0.5 rounded hover:bg-muted"><Trash2 className="w-2.5 h-2.5 text-destructive" /></button>
                    </div>
                  </div>
                  {ev.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{CATEGORY_META[ev.category]?.icon} {CATEGORY_META[ev.category]?.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Category legend */}
            <div className="px-3 py-2 border-t border-border">
              <p className="text-[9px] font-medium text-muted-foreground mb-1">Categories</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(CATEGORY_META).map(([k, v]) => (
                  <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">{v.icon} {v.label}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Event Form ─── */}
        {showForm && (
          <div className="w-64 border-l border-border flex flex-col overflow-hidden bg-muted/10">
            <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-border">
              <p className="text-xs font-semibold text-foreground">{editEvent ? 'Edit Event' : 'New Event'}</p>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-3 h-3 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto win-scrollbar px-3 py-2 space-y-2">
              <Field label="Title">
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Event title"
                  className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground placeholder:text-muted-foreground" autoFocus />
              </Field>
              <Field label="Description">
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional description" rows={2}
                  className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start Time">
                  <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground" />
                </Field>
                <Field label="End Time">
                  <input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground" />
                </Field>
              </div>
              <Field label="Location">
                <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Optional location"
                  className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground placeholder:text-muted-foreground" />
              </Field>
              <Field label="Category">
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(CATEGORY_META).map(([k, v]) => (
                    <button key={k} onClick={() => { setFormCategory(k as EventCategory); setFormColor(v.color); }}
                      className={`text-[10px] px-1 py-1 rounded border transition-colors ${formCategory === k ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                      {v.icon} {v.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Repeat">
                <select value={formRecurring} onChange={e => setFormRecurring(e.target.value as CalEvent['recurring'])}
                  className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground">
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formReminder} onChange={e => setFormReminder(e.target.checked)}
                  className="rounded border-input" />
                <Bell className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-foreground">Set reminder</span>
              </label>
            </div>
            <div className="px-3 py-2 border-t border-border flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-2 py-1.5 text-xs rounded border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={saveEvent} className="flex-1 px-2 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom status ─── */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border bg-muted/20 text-[10px] text-muted-foreground">
        <span>{events.length} events total</span>
        <span>{selected ? `Selected: ${selected}` : 'Click a date to view events'}</span>
      </div>
    </div>
  );
}

/* ═══ Sub-components ═══ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">{label}</label>
      {children}
    </div>
  );
}

/* ─── Month View ─── */
function MonthView({ days, today, selected, events, onSelect, onDoubleClick }: {
  days: { day: number; date: string; isCurrentMonth: boolean }[];
  today: string; selected: string | null; events: CalEvent[];
  onSelect: (d: string) => void; onDoubleClick: (d: string) => void;
}) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-7 gap-px mb-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden">
        {days.map((cell, i) => {
          const isToday = cell.date === today;
          const isSel = cell.date === selected;
          const dayEvents = events.filter(e => e.date === cell.date);
          return (
            <button key={i} onClick={() => onSelect(cell.date)} onDoubleClick={() => onDoubleClick(cell.date)}
              className={`min-h-[60px] p-1 flex flex-col items-start transition-colors text-left ${
                isSel ? 'bg-primary/10' : 'bg-background hover:bg-muted/50'
              } ${!cell.isCurrentMonth ? 'opacity-40' : ''}`}>
              <span className={`text-[11px] w-5 h-5 flex items-center justify-center rounded-full mb-0.5 ${
                isToday ? 'bg-primary text-primary-foreground font-bold' : isSel ? 'text-primary font-semibold' : 'text-foreground'
              }`}>{cell.day}</span>
              <div className="w-full space-y-px">
                {dayEvents.slice(0, 2).map(ev => (
                  <div key={ev.id} className="text-[9px] px-1 py-px rounded truncate text-primary-foreground" style={{ background: ev.color }}>
                    {ev.time ? `${ev.time} ` : ''}{ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Week View ─── */
function WeekView({ weekDays, today, selected, events, onSelect, onEventClick }: {
  weekDays: Date[]; today: string; selected: string | null; events: CalEvent[];
  onSelect: (d: string) => void; onEventClick: (ev: CalEvent) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border sticky top-0 bg-background z-10">
        <div />
        {weekDays.map(d => {
          const ds = fmtDate(d);
          const isToday = ds === today;
          return (
            <button key={ds} onClick={() => onSelect(ds)}
              className={`py-2 text-center border-l border-border transition-colors ${ds === selected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
              <div className="text-[10px] text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className={`text-sm font-medium ${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto' : 'text-foreground'}`}>
                {d.getDate()}
              </div>
            </button>
          );
        })}
      </div>
      {/* Time grid */}
      <div className="flex-1 overflow-y-auto win-scrollbar">
        {HOURS.map(h => (
          <div key={h} className="grid grid-cols-[50px_repeat(7,1fr)] min-h-[40px] border-b border-border/30">
            <div className="text-[10px] text-muted-foreground pr-2 text-right pt-0.5">{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</div>
            {weekDays.map(d => {
              const ds = fmtDate(d);
              const hourEvents = events.filter(e => e.date === ds && e.time && parseInt(e.time.split(':')[0]) === h);
              return (
                <div key={ds} className="border-l border-border/30 px-0.5 py-0.5">
                  {hourEvents.map(ev => (
                    <button key={ev.id} onClick={() => onEventClick(ev)}
                      className="w-full text-[9px] px-1 py-0.5 rounded text-primary-foreground truncate text-left" style={{ background: ev.color }}>
                      {ev.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Day View ─── */
function DayView({ date, today, events, onEventClick }: {
  date: Date; today: string; events: CalEvent[]; onEventClick: (ev: CalEvent) => void;
}) {
  const ds = fmtDate(date);
  const isToday = ds === today;
  return (
    <div className="flex flex-col h-full">
      <div className={`text-center py-3 border-b border-border ${isToday ? 'bg-primary/5' : ''}`}>
        <div className="text-xs text-muted-foreground">{date.toLocaleDateString(undefined, { weekday: 'long' })}</div>
        <div className={`text-2xl font-light ${isToday ? 'text-primary' : 'text-foreground'}`}>{date.getDate()}</div>
      </div>
      <div className="flex-1 overflow-y-auto win-scrollbar">
        {HOURS.map(h => {
          const hourEvents = events.filter(e => e.time && parseInt(e.time.split(':')[0]) === h);
          return (
            <div key={h} className="flex min-h-[44px] border-b border-border/30">
              <div className="w-16 text-[10px] text-muted-foreground text-right pr-3 pt-1 shrink-0">
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
              </div>
              <div className="flex-1 border-l border-border/30 px-2 py-0.5 space-y-0.5">
                {hourEvents.map(ev => (
                  <button key={ev.id} onClick={() => onEventClick(ev)}
                    className="w-full text-left text-xs px-2 py-1 rounded text-primary-foreground flex items-center gap-2" style={{ background: ev.color }}>
                    <span className="font-medium">{ev.title}</span>
                    {ev.time && <span className="opacity-75">{ev.time}{ev.endTime ? `–${ev.endTime}` : ''}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
