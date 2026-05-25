import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateClickArg } from '@fullcalendar/interaction';

// ── Types ─────────────────────────────────────────────────
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
}

interface MeetingRequest {
  id: number;
  name: string;
  role: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface NewEvent {
  title: string;
  date: string;
  type: 'availability' | 'meeting';
}

// ── Styles ────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px',
    background: '#f9fafb',
    minHeight: '100vh',
    color: '#111827',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '24px',
  },
  calendarWrapper: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#111827',
  },
  input: {
    width: '100%',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#111827',
    fontSize: '14px',
    marginBottom: '10px',
    outline: 'none',
  },
  select: {
    width: '100%',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#111827',
    fontSize: '14px',
    marginBottom: '10px',
    outline: 'none',
  },
  addBtn: {
    width: '100%',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
    fontSize: '14px',
  },
  requestItem: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    border: '1px solid #e5e7eb',
  },
  requestName: {
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '4px',
    color: '#111827',
  },
  requestTime: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '10px',
  },
  btnRow: {
    display: 'flex',
    gap: '8px',
  },
  acceptBtn: {
    flex: 1,
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '7px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  declineBtn: {
    flex: 1,
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '7px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

// ── Badge (function style removed — now a component) ──────
const StatusBadge: React.FC<{ status: 'accepted' | 'declined' }> = ({ status }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    background: status === 'accepted' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
    color: status === 'accepted' ? '#16a34a' : '#dc2626',
  }}>
    {status === 'accepted' ? 'Confirmed' : 'Declined'}
  </span>
);

// ── Initial data ──────────────────────────────────────────
const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: '✅ Meeting: Sarah Chen', date: '2025-06-05', backgroundColor: '#2563eb' },
  { id: '2', title: '📅 Pitch Review',        date: '2025-06-10', backgroundColor: '#7c3aed' },
];

const INITIAL_REQUESTS: MeetingRequest[] = [
  { id: 1, name: 'Sarah Chen', role: 'Investor',      time: 'Jun 5, 2025 – 2:00 PM',  status: 'pending' },
  { id: 2, name: 'Mark Osei',  role: 'Entrepreneur',  time: 'Jun 7, 2025 – 10:00 AM', status: 'pending' },
];

// ── Component ─────────────────────────────────────────────
const CalendarPage: React.FC = () => {
  const [events, setEvents]     = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [requests, setRequests] = useState<MeetingRequest[]>(INITIAL_REQUESTS);
  const [newEvent, setNewEvent] = useState<NewEvent>({ title: '', date: '', type: 'availability' });

  // Click a date → prefill the date field
  const handleDateClick = (arg: DateClickArg) => {
    setNewEvent(prev => ({ ...prev, date: arg.dateStr }));
  };

  // Add slot or meeting to calendar
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const color  = newEvent.type === 'availability' ? '#16a34a' : '#2563eb';
    const prefix = newEvent.type === 'availability' ? '🟢' : '📅';
    setEvents(prev => [
      ...prev,
      {
        id: String(Date.now()),
        title: `${prefix} ${newEvent.title}`,
        date: newEvent.date,
        backgroundColor: color,
      },
    ]);
    setNewEvent({ title: '', date: '', type: 'availability' });
  };

  // Accept or decline a meeting request
  const handleRequest = (id: number, action: 'accepted' | 'declined') => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: action } : r)
    );
    if (action === 'accepted') {
      const req = requests.find(r => r.id === id);
      if (!req) return;
      setEvents(prev => [
        ...prev,
        {
          id: String(Date.now()),
          title: `✅ Meeting: ${req.name}`,
          date: new Date().toISOString().split('T')[0],
          backgroundColor: '#2563eb',
        },
      ]);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Meeting Calendar</h1>
      </div>

      <div style={styles.layout}>

        {/* ── Calendar ── */}
        <div style={styles.calendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            events={events}
            dateClick={handleDateClick}
            height="auto"
          />
        </div>

        {/* ── Sidebar ── */}
        <div style={styles.sidebar}>

          {/* Add slot / meeting */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Add Slot / Meeting</div>

            <input
              style={styles.input}
              placeholder="Title (e.g. Available 2-4pm)"
              value={newEvent.title}
              onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
            />

            <input
              type="date"
              style={styles.input}
              value={newEvent.date}
              onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
            />

            <select
              style={styles.select}
              value={newEvent.type}
              onChange={e =>
                setNewEvent(p => ({ ...p, type: e.target.value as 'availability' | 'meeting' }))
              }
            >
              <option value="availability">Availability Slot</option>
              <option value="meeting">Scheduled Meeting</option>
            </select>

            <button style={styles.addBtn} onClick={handleAddEvent}>
              + Add to Calendar
            </button>
          </div>

          {/* Meeting requests */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Meeting Requests</div>
            {requests.map(req => (
              <div key={req.id} style={styles.requestItem}>
                <div style={styles.requestName}>
                  {req.name}{' '}
                  <span style={{ color: '#6b7280', fontWeight: 400 }}>({req.role})</span>
                </div>
                <div style={styles.requestTime}>{req.time}</div>

                {req.status === 'pending' ? (
                  <div style={styles.btnRow}>
                    <button style={styles.acceptBtn} onClick={() => handleRequest(req.id, 'accepted')}>
                      Accept
                    </button>
                    <button style={styles.declineBtn} onClick={() => handleRequest(req.id, 'declined')}>
                      Decline
                    </button>
                  </div>
                ) : (
                  <StatusBadge status={req.status} />
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarPage;