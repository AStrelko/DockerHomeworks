import { useState, type FormEvent } from 'react';
import { level, loadClub, riddles, saveClub, score, type ClubState } from './data';

/** Основний екран: вступ до клубу, випробування та рейтинг. */
export default function App() {
  const [club, setClub] = useState<ClubState>(loadClub);
  const [name, setName] = useState('');
  const [rankSearch, setRankSearch] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [view, setView] = useState<'profile' | 'riddles' | 'ranking'>('profile');
  const current = club.members.find(member => member.id === club.activeId);
  const ranking = [...club.members].sort((a, b) => score(b) - score(a) || a.joinedAt.localeCompare(b.joinedAt));

  function update(next: ClubState) { setClub(next); saveClub(next); }
  function register(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 40) return;
    const member = { id: crypto.randomUUID(), name: trimmed, joinedAt: new Date().toISOString(), solved: [] as number[] };
    update({ members: [...club.members, member], activeId: member.id });
    setName(''); setView('profile');
  }
  function check(id: number) {
    if (!current || current.solved.includes(id)) return;
    const riddle = riddles.find(item => item.id === id)!;
    const answer = (answers[id] || '').trim().toLocaleLowerCase('uk-UA');
    if (riddle.answers.some(expected => expected.toLocaleLowerCase('uk-UA') === answer)) {
      update({ ...club, members: club.members.map(member => member.id === current.id ? { ...member, solved: [...member.solved, id] } : member) });
      setFeedback(prev => ({ ...prev, [id]: `Вірно! +${riddle.points} балів` }));
    } else setFeedback(prev => ({ ...prev, [id]: 'Спробуйте ще раз.' }));
  }
  return <div className="shell">
    <header className="top"><div className="mark">✦ <span>THE SECRET SOCIETY</span></div><span className="top-note">ЗАКРИТИЙ КЛУБ · 2026</span></header>
    <main>
      <section className="hero"><span className="eyebrow">ДОСЬЄ № 001 / ДОСТУП ВІДКРИТО</span><h1>У кожного секрету<br/><em>є свій ключ.</em></h1><p>Приєднуйтеся до товариства, проходьте випробування та відкривайте нові рівні доступу.</p><div className="hero-meta"><span>◉ {club.members.length} учасників</span><span>◇ {riddles.length} випробування</span></div></section>
      {!current ? <section className="card join"><div><span className="eyebrow">01 / ВСТУП</span><h2>Отримати запрошення</h2><p>Оберіть ім’я учасника. Дані цього навчального прикладу зберігаються у вашому браузері.</p></div><form onSubmit={register}><label htmlFor="member-name">Ім’я учасника</label><div className="form-row"><input id="member-name" value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={40} required placeholder="Ваше ім’я"/><button>Приєднатися →</button></div></form>{club.members.length > 0 && <div className="switch"><p>Уже є профіль у цьому браузері?</p>{club.members.map(member => <button className="ghost" key={member.id} onClick={() => update({ ...club, activeId: member.id })}>{member.name}</button>)}</div>}</section> : <>
        <div className="workspace-head"><div><span className="eyebrow">АРХІВ ТОВАРИСТВА</span><h2>Вітаємо, {current.name}</h2></div><button className="ghost" onClick={() => { update({ ...club, activeId: null }); setFeedback({}); }}>Змінити учасника</button></div>
        <nav className="tabs" aria-label="Розділи клубу"><button className={view === 'profile' ? 'selected' : ''} onClick={() => setView('profile')}>Профіль</button><button className={view === 'riddles' ? 'selected' : ''} onClick={() => setView('riddles')}>Випробування</button><button className={view === 'ranking' ? 'selected' : ''} onClick={() => setView('ranking')}>Рейтинг</button></nav>
        {view === 'profile' && <div className="grid"><section className="card profile"><span className="eyebrow">ОСОБИСТЕ ДОСЬЄ</span><div className="avatar">{current.name.slice(0, 1).toUpperCase()}</div><h3>{current.name}</h3><p>У товаристві з {new Date(current.joinedAt).toLocaleDateString('uk-UA')}</p><div className="stats"><div><strong>{level(current)}</strong><small>РІВЕНЬ</small></div><div><strong>{score(current)}</strong><small>БАЛИ</small></div><div><strong>{current.solved.length}/{riddles.length}</strong><small>ЗАГАДКИ</small></div></div></section><section className="card"><span className="eyebrow">ДОСЯГНЕННЯ</span><h3>Знаки відзнаки</h3><div className="badges"><div className="badge unlocked">✦ Посвячений <small>За вступ до клубу</small></div><div className={'badge ' + (current.solved.length > 0 ? 'unlocked' : '')}>◆ Дослідник <small>За першу загадку</small></div><div className={'badge ' + (current.solved.length === riddles.length ? 'unlocked' : '')}>✧ Хранитель <small>За всі загадки</small></div></div></section><section className="card wide"><span className="eyebrow">СЕКРЕТНІ МАТЕРІАЛИ</span><h3>Архів доступу</h3><div className="archive"><div><strong>Рівень 1 · Кодекс учасника</strong><p>Спостерігай уважно. Став запитання. Бережи таємниці товариства.</p></div><div><strong>Рівень 2 · Зала дослідників</strong><p>{level(current) >= 2 ? 'Перший ключ знайдено. Дослідження починається з цікавості.' : '🔒 Відкрийте, розв’язавши першу загадку.'}</p></div><div><strong>Рівень 3 · Таємний протокол</strong><p>{level(current) >= 3 ? 'Усі ключі зібрано. Тепер ви — хранитель архіву.' : '🔒 Відкрийте, розв’язавши всі загадки.'}</p></div></div></section></div>}
        {view === 'riddles' && <section className="card"><span className="eyebrow">02 / ВИПРОБУВАННЯ</span><h3>Знайдіть відповіді</h3><div className="riddle-list">{riddles.map((riddle, index) => { const solved = current.solved.includes(riddle.id); return <article className="riddle" key={riddle.id}><div className="riddle-head"><span>ЗАГАДКА 0{index + 1}</span><span>{solved ? '✓ РОЗГАДАНО' : `+${riddle.points} БАЛІВ`}</span></div><h4>{riddle.question}</h4><div className="form-row"><input aria-label={`Відповідь на загадку ${index + 1}`} value={answers[riddle.id] || ''} onChange={event => setAnswers(prev => ({ ...prev, [riddle.id]: event.target.value }))} onKeyDown={event => { if (event.key === 'Enter') check(riddle.id); }} disabled={solved} placeholder={solved ? 'Випробування пройдено' : 'Введіть відповідь'}/><button onClick={() => check(riddle.id)} disabled={solved || !answers[riddle.id]?.trim()}>Перевірити</button></div>{feedback[riddle.id] && <p role="status" className="feedback">{feedback[riddle.id]}</p>}</article>; })}</div></section>}
        {view === 'ranking' && <section className="card"><span className="eyebrow">03 / РЕЙТИНГ</span><h3>Учасники товариства</h3><label className="rank-search">Пошук учасника <input value={rankSearch} onChange={event => setRankSearch(event.target.value)} placeholder="Введіть ім’я" /></label><div className="ranking">{ranking.filter(member => member.name.toLocaleLowerCase('uk-UA').includes(rankSearch.trim().toLocaleLowerCase('uk-UA'))).map((member) => <div className="rank" key={member.id}><span className="rank-number">{String(ranking.findIndex(item => item.id === member.id) + 1).padStart(2, '0')}</span><strong>{member.name}{member.id === current.id ? ' · ви' : ''}</strong><span>Рівень {level(member)}</span><b>{score(member)} балів</b></div>)}</div>{ranking.length > 0 && !ranking.some(member => member.name.toLocaleLowerCase('uk-UA').includes(rankSearch.trim().toLocaleLowerCase('uk-UA'))) && <p>Учасника не знайдено.</p>}</section>}
      </>}
    </main><footer>THE SECRET SOCIETY <span>Навчальний проєкт · React + Docker</span></footer>
  </div>;
}
