import { useMemo, useState, type FormEvent } from 'react';
import { dateKey, formatDate, monthDays, shiftMonth } from './calendar';
import {
  eventsOn, isCompleted, loadEvents, occursOn, saveEvents,
  type CalendarEvent, type EventKind,
} from './events';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const monthFormatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
const today = dateKey(new Date());

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [kind, setKind] = useState<EventKind>('planned');
  const [error, setError] = useState('');

  const days = useMemo(() => monthDays(visibleMonth), [visibleMonth]);
  const selectedEvents = useMemo(() => eventsOn(events, selectedDate), [events, selectedDate]);
  const plannedCount = selectedEvents.filter(event => event.kind === 'planned').length;
  const annualCount = selectedEvents.filter(event => event.kind === 'annual').length;

  // Зберігаємо кожну зміну одразу, щоб події не зникали після оновлення сторінки.
  function update(next: CalendarEvent[]) {
    setEvents(next);
    saveEvents(next);
  }

  function selectDate(value: string) {
    setSelectedDate(value);
    setEventDate(value);
    setError('');
  }

  function goToday() {
    const current = new Date();
    setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    selectDate(dateKey(current));
  }

  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !eventDate || !time) {
      setError('Заповніть назву, дату та час події.');
      return;
    }

    const next: CalendarEvent = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      date: eventDate,
      time,
      kind,
      completed: false,
      completedYears: [],
    };
    update([...events, next]);
    setTitle('');
    setError('');
    selectDate(eventDate);
    const [year, month] = eventDate.split('-').map(Number);
    setVisibleMonth(new Date(year, month - 1, 1));
  }

  function toggleCompleted(item: CalendarEvent) {
    const year = Number(selectedDate.slice(0, 4));
    update(events.map(event => {
      if (event.id !== item.id) return event;
      if (event.kind === 'annual') {
        return {
          ...event,
          completedYears: event.completedYears.includes(year)
            ? event.completedYears.filter(value => value !== year)
            : [...event.completedYears, year],
        };
      }
      return { ...event, completed: !event.completed };
    }));
  }

  function removeEvent(id: string) {
    update(events.filter(event => event.id !== id));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span>Мій тижневик</span></div>
        <span className="topbar-caption">Календар важливих подій</span>
      </header>

      <main className="content">
        <div className="intro-row">
          <div>
            <p className="eyebrow">ВАШ ПРОСТІР ДЛЯ ПЛАНІВ</p>
            <h1>Усе важливе <em>в одному календарі.</em></h1>
            <p className="lead">Плануйте справи на конкретний час і зберігайте дати, які хочеться згадувати щороку.</p>
          </div>
          <div className="today-badge"><span>СЬОГОДНІ</span><strong>{new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(new Date())}</strong></div>
        </div>

        <div className="workspace">
          <section className="calendar-panel" aria-label="Календар подій">
            <div className="calendar-header">
              <div><p className="section-kicker">КАЛЕНДАР</p><h2>{monthFormatter.format(visibleMonth)}</h2></div>
              <div className="month-controls">
                <button type="button" onClick={goToday} className="today-button">Сьогодні</button>
                <button type="button" aria-label="Попередній місяць" onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}>‹</button>
                <button type="button" aria-label="Наступний місяць" onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}>›</button>
              </div>
            </div>

            <div className="calendar-grid">
              {weekdays.map(day => <div className="weekday" key={day}>{day}</div>)}
              {days.map((date, index) => {
                if (!date) return <div className="empty-day" key={`blank-${index}`} aria-hidden="true" />;
                const value = dateKey(date);
                // Річниці відображаються щороку, а звичайні справи — лише в обрану дату.
                const hasAnnual = events.some(item => item.kind === 'annual' && occursOn(item, value));
                const hasPlanned = events.some(item => item.kind === 'planned' && occursOn(item, value));
                const color = hasAnnual && hasPlanned ? 'both' : hasAnnual ? 'annual' : hasPlanned ? 'planned' : '';
                return <button
                  type="button"
                  key={value}
                  className={`day ${color} ${value === selectedDate ? 'selected' : ''} ${value === today ? 'current' : ''}`}
                  aria-label={`${formatDate(value)}${hasAnnual ? ', щорічна подія' : ''}${hasPlanned ? ', запланована подія' : ''}`}
                  aria-pressed={value === selectedDate}
                  onClick={() => selectDate(value)}
                ><span>{date.getDate()}</span>{color && <i aria-hidden="true" />}</button>;
              })}
            </div>
            <div className="legend" aria-label="Позначення кольорів">
              <span><i className="legend-dot annual" />Щорічні</span>
              <span><i className="legend-dot planned" />Заплановані</span>
              <span><i className="legend-dot both" />Обидва типи</span>
            </div>
          </section>

          <aside className="day-panel">
            <div className="day-panel-header"><p className="section-kicker">ПОДІЇ ДНЯ</p><h2>{formatDate(selectedDate)}</h2><p>{plannedCount} заплановано · {annualCount} щорічних</p></div>
            {selectedEvents.length ? <ul className="event-list">{selectedEvents.map(item => {
              const completed = isCompleted(item, selectedDate);
              return <li className={`event-item ${item.kind}`} key={item.id}>
                <div className="event-topline"><span className="event-kind">{item.kind === 'annual' ? '✿ Щороку' : '● Заплановано'}</span><span className="event-time">{item.time}</span></div>
                <strong className={completed ? 'completed-title' : ''}>{item.title}</strong>
                <div className="event-actions">
                  <label><input type="checkbox" checked={completed} onChange={() => toggleCompleted(item)} /><span>Виконано{item.kind === 'annual' ? ' цього року' : ''}</span></label>
                  <button type="button" onClick={() => removeEvent(item.id)} aria-label={`Видалити подію ${item.title}`}>Видалити</button>
                </div>
              </li>;
            })}</ul> : <div className="empty-state"><span aria-hidden="true">◌</span><h3>Тут поки вільно</h3><p>Додайте подію на цей день за допомогою форми нижче.</p></div>}
          </aside>
        </div>

        <section className="form-panel" aria-labelledby="form-title">
          <div className="form-heading"><div><p className="section-kicker">НОВИЙ ЗАПИС</p><h2 id="form-title">Додати подію</h2></div><span className="form-symbol" aria-hidden="true">＋</span></div>
          <form onSubmit={addEvent}>
            <div className="form-grid">
              <label className="title-field">Назва події<input value={title} onChange={event => setTitle(event.target.value)} maxLength={100} placeholder="Наприклад, зустріч або річниця" required /></label>
              <label>Дата<input type="date" value={eventDate} onChange={event => setEventDate(event.target.value)} required /></label>
              <label>Час<input type="time" value={time} onChange={event => setTime(event.target.value)} required /></label>
              <label>Тип події<select value={kind} onChange={event => setKind(event.target.value as EventKind)}><option value="planned">Запланована подія</option><option value="annual">Щорічна подія</option></select></label>
            </div>
            <div className="form-footer"><p>{kind === 'annual' ? 'Повторюватиметься щороку в цей день. Виконання відмічається окремо для кожного року.' : 'Подія з’явиться лише у вибрану дату.'}</p><button type="submit">Додати подію</button></div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
        </section>
        <footer>Ваші події зберігаються у цьому браузері · Мій тижневик</footer>
      </main>
    </div>
  );
}
