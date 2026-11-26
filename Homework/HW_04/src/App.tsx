import { useMemo, useState, type FormEvent } from 'react';
import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { initialQuests } from './data';
import { storage } from './storage';
import type { Difficulty, ProgressMap, Quest } from './types';

function Header() {
  return <header className="header"><Link className="logo" to="/"><span>⌁</span> ESCAPE <b>ONLINE</b></Link><nav>
    <NavLink to="/">Квести</NavLink><NavLink to="/create">Створити</NavLink><NavLink to="/profile">Мій профіль</NavLink>
  </nav></header>;
}

function QuestCard({ quest, favorite, onFavorite }: { quest: Quest; favorite: boolean; onFavorite: () => void }) {
  return <article className="quest-card" style={{ '--accent': quest.accent } as React.CSSProperties}>
    <button className={`favorite ${favorite ? 'active' : ''}`} onClick={onFavorite} aria-label="Додати в обране">★</button>
    <div className="quest-icon">{quest.icon}</div><span className="category">{quest.category}</span><h3>{quest.title}</h3>
    <p>{quest.description}</p><div className="meta"><span>{quest.difficulty}</span><span>{quest.duration} хв</span></div>
    <Link className="primary" to={`/quest/${quest.id}`}>Розпочати квест →</Link>
  </article>;
}

function Catalog({ quests, favorites, toggleFavorite }: { quests: Quest[]; favorites: string[]; toggleFavorite: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('Усі');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const filtered = useMemo(
    () => quests.filter(q =>
      q.title.toLowerCase().includes(search.toLowerCase()) &&
      (difficulty === 'Усі' || q.difficulty === difficulty) &&
      (!favoritesOnly || favorites.includes(q.id))),
    [quests, search, difficulty, favoritesOnly, favorites],
  );
  return <main><section className="hero"><div><span className="eyebrow">ТВОЯ НАСТУПНА ПРИГОДА</span><h1>Розгадай. Виживи.<br/><em>Вирвись назовні.</em></h1><p>Інтерактивні квести, де кожне рішення змінює хід історії.</p></div><div className="hero-code">ESC<br/><b>01</b></div></section>
    <section className="catalog"><div className="section-title"><div><span>КАТАЛОГ</span><h2>Обери свою місію</h2></div><strong>{filtered.length} квести</strong></div>
      <div className="filters"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук за назвою..."/><select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option>Усі</option><option>Легкий</option><option>Середній</option><option>Складний</option></select><label className="favorite-filter"><input type="checkbox" checked={favoritesOnly} onChange={e => setFavoritesOnly(e.target.checked)}/> Тільки обрані</label></div>
      <div className="quest-grid">{filtered.map(q => <QuestCard key={q.id} quest={q} favorite={favorites.includes(q.id)} onFavorite={() => toggleFavorite(q.id)}/>)}</div>
      {!filtered.length && <p className="empty">За вашим запитом квестів не знайдено.</p>}
    </section></main>;
}

function QuestPage({ quests, progress, advance }: { quests: Quest[]; progress: ProgressMap; advance: (id: string, max: number) => void }) {
  const { id = '' } = useParams(); const quest = quests.find(q => q.id === id);
  if (!quest) return <main className="page"><h1>Квест не знайдено</h1><Link to="/">Повернутися до каталогу</Link></main>;
  const step = progress[id] ?? 0; const complete = step >= quest.steps.length;
  return <main className="page quest-play"><span className="eyebrow">АКТИВНИЙ КВЕСТ</span><h1>{quest.title}</h1><p>{quest.description}</p>
    <div className="progress"><span style={{ width: `${Math.min(100, step / quest.steps.length * 100)}%` }}/></div><p>Прогрес: {Math.min(step, quest.steps.length)} / {quest.steps.length}</p>
    <div className="task-box">{complete ? <><div className="success">✓</div><h2>Квест завершено!</h2><p>Ви успішно розгадали всі загадки.</p></> : <><small>ЗАВДАННЯ {step + 1}</small><h2>{quest.steps[step]}</h2><p>Уявіть, що загадку розв’язано, і підтвердьте наступний етап.</p><button className="primary" onClick={() => advance(id, quest.steps.length)}>Завдання виконано</button></>}</div>
  </main>;
}

function CreatePage({ addQuest }: { addQuest: (quest: Quest) => void }) {
  const [message, setMessage] = useState('');
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const data = new FormData(e.currentTarget); const title = String(data.get('title')).trim(); const description = String(data.get('description')).trim();
    if (title.length < 3 || description.length < 10) { setMessage('Перевірте назву та опис квесту.'); return; }
    addQuest({ id: crypto.randomUUID(), title, description, category: String(data.get('category')), difficulty: String(data.get('difficulty')) as Difficulty, duration: Number(data.get('duration')), icon: '✦', accent: '#22c55e', steps: ['Знайти першу підказку', 'Розгадати головний шифр', 'Відкрити фінальні двері'], custom: true }); e.currentTarget.reset(); setMessage('Квест створено та збережено!'); }
  return <main className="page"><span className="eyebrow">КОНСТРУКТОР</span><h1>Створити власний квест</h1><form className="quest-form" onSubmit={submit}><label>Назва<input name="title" required minLength={3}/></label><label>Категорія<select name="category"><option>Детектив</option><option>Пригоди</option><option>Кіберпанк</option><option>Містика</option></select></label><label>Складність<select name="difficulty"><option>Легкий</option><option>Середній</option><option>Складний</option></select></label><label>Тривалість, хв<input name="duration" type="number" min="10" max="180" defaultValue="30" required/></label><label className="wide">Опис<textarea name="description" minLength={10} required/></label><button className="primary" type="submit">Створити квест</button>{message && <p className="form-message">{message}</p>}</form></main>;
}

function Profile({ quests, favorites, progress, resetProgress }: { quests: Quest[]; favorites: string[]; progress: ProgressMap; resetProgress: () => void }) {
  const favoriteQuests = quests.filter(q => favorites.includes(q.id)); const completed = quests.filter(q => (progress[q.id] ?? 0) >= q.steps.length);
  return <main className="page"><span className="eyebrow">ОСОБИСТИЙ КАБІНЕТ · VERSION 2.0</span><h1>Мій профіль</h1><div className="stats"><div><strong>{quests.length}</strong><span>доступно</span></div><div><strong>{favorites.length}</strong><span>в обраному</span></div><div><strong>{completed.length}</strong><span>завершено</span></div></div><div className="profile-heading"><h2>Обрані квести</h2><button className="secondary" onClick={resetProgress} disabled={!Object.keys(progress).length}>Скинути весь прогрес</button></div>{favoriteQuests.length ? <div className="profile-list">{favoriteQuests.map(q => <Link to={`/quest/${q.id}`} key={q.id}><span>{q.icon}</span><b>{q.title}</b><small>{q.difficulty}</small></Link>)}</div> : <p className="empty">Ви ще не додали квести в обране.</p>}</main>;
}

export default function App() {
  const [custom, setCustom] = useState<Quest[]>(storage.customQuests); const [favorites, setFavorites] = useState<string[]>(storage.favorites); const [progress, setProgress] = useState<ProgressMap>(storage.progress); const quests = [...initialQuests, ...custom];
  function toggleFavorite(id: string) { const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id]; setFavorites(next); storage.saveFavorites(next); }
  function addQuest(quest: Quest) { const next = [...custom, quest]; setCustom(next); storage.saveCustomQuests(next); }
  function advance(id: string, max: number) { const next = { ...progress, [id]: Math.min((progress[id] ?? 0) + 1, max) }; setProgress(next); storage.saveProgress(next); }
  function resetProgress() { setProgress({}); storage.clearProgress(); }
  return <div className="app"><Header/><Routes><Route path="/" element={<Catalog quests={quests} favorites={favorites} toggleFavorite={toggleFavorite}/>}/><Route path="/quest/:id" element={<QuestPage quests={quests} progress={progress} advance={advance}/>}/><Route path="/create" element={<CreatePage addQuest={addQuest}/>}/><Route path="/profile" element={<Profile quests={quests} favorites={favorites} progress={progress} resetProgress={resetProgress}/>}/><Route path="*" element={<main className="page"><h1>404</h1><Link to="/">На головну</Link></main>}/></Routes><footer>ESCAPE ONLINE · VERSION 2.0 · КОЖНА ЗАГАДКА МАЄ ВИХІД</footer></div>;
}
