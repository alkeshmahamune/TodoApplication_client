import { useState, useEffect, useRef } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: rgba(255,255,255,0.07);
    --accent: #7c6af7;
    --accent2: #f76ab4;
    --accent3: #6af7c8;
    --text: #f0eeff;
    --muted: #6b6882;
    --danger: #f76a6a;
    --success: #6af7c8;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; min-height: 100vh; overflow-x: hidden; }

  body::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }

  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 8px;
  }

  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); animation: pulse 2s infinite; }

  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }

  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s; cursor: pointer; }
  .nav-links a:hover { color: var(--text); }

  .nav-badge {
    background: var(--accent); color: white; border-radius: 20px;
    padding: 4px 14px; font-size: 0.75rem; font-family: 'Syne', sans-serif; font-weight: 700;
    letter-spacing: 0.04em;
  }

  .hero {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 80px 24px 48px;
    position: relative; overflow: hidden;
  }

  .hero-bg {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 50% 30%, rgba(124,106,247,0.15) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 20% 70%, rgba(247,106,180,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 80% 60%, rgba(106,247,200,0.07) 0%, transparent 60%);
  }

  .hero-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  }

  .hero-content { position: relative; z-index: 1; max-width: 680px; }

  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid rgba(124,106,247,0.3); border-radius: 100px;
    padding: 6px 16px; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 32px; background: rgba(124,106,247,0.08);
    animation: fadeUp 0.6s ease both;
  }

  .hero-tag span { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .hero h1 {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2.8rem, 7vw, 5.5rem); line-height: 0.95; letter-spacing: -0.04em;
    margin-bottom: 20px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  .hero h1 em { font-style: normal; color: var(--accent); }
  .hero h1 .line2 { display: block; color: var(--muted); }

  .hero-sub {
    color: var(--muted); font-size: 0.9rem; line-height: 1.7; max-width: 420px; margin: 0 auto 40px;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .hero-cta {
    display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
    animation: fadeUp 0.6s 0.3s ease both;
  }

  .btn-primary {
    background: var(--accent); color: white; border: none; border-radius: 8px;
    padding: 12px 28px; font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 0.85rem; letter-spacing: 0.04em; cursor: pointer;
    box-shadow: 0 0 32px rgba(124,106,247,0.35);
    transition: all 0.2s; text-transform: uppercase;
  }

  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 40px rgba(124,106,247,0.5); }

  .btn-secondary {
    background: transparent; color: var(--text); border: 1px solid var(--border);
    border-radius: 8px; padding: 12px 28px; font-family: 'Syne', sans-serif;
    font-weight: 600; font-size: 0.85rem; letter-spacing: 0.04em; cursor: pointer;
    transition: all 0.2s; text-transform: uppercase;
  }

  .btn-secondary:hover { border-color: rgba(255,255,255,0.2); background: var(--surface); }

  .hero-stats {
    display: flex; gap: 40px; justify-content: center; margin-top: 56px;
    padding-top: 40px; border-top: 1px solid var(--border);
    animation: fadeUp 0.6s 0.4s ease both;
  }

  .stat-item { text-align: center; }
  .stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.8rem; color: var(--text); display: block; }
  .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }

  .todos-section {
    max-width: 760px; margin: 0 auto; padding: 48px 24px 120px;
    position: relative; z-index: 1;
  }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }

  .section-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.5rem;
    letter-spacing: -0.02em;
  }

  .filter-tabs { display: flex; gap: 4px; background: var(--surface); border-radius: 8px; padding: 3px; }

  .filter-tab {
    padding: 6px 14px; border-radius: 6px; font-size: 0.72rem;
    text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer;
    border: none; background: transparent; color: var(--muted);
    font-family: 'DM Mono', monospace; transition: all 0.15s;
  }

  .filter-tab.active { background: var(--surface2); color: var(--text); }

  .add-form {
    display: flex; gap: 10px; margin-bottom: 24px; position: relative;
  }

  .add-input {
    flex: 1; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 18px; color: var(--text);
    font-family: 'DM Mono', monospace; font-size: 0.88rem;
    outline: none; transition: border-color 0.2s;
  }

  .add-input:focus { border-color: rgba(124,106,247,0.5); }
  .add-input::placeholder { color: var(--muted); }

  .priority-select {
    background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    padding: 0 14px; color: var(--text); font-family: 'DM Mono', monospace;
    font-size: 0.78rem; outline: none; cursor: pointer; transition: border-color 0.2s;
    appearance: none; width: 100px; text-align: center;
  }

  .priority-select:focus { border-color: rgba(124,106,247,0.5); }

  .add-btn {
    background: var(--accent); color: white; border: none; border-radius: 10px;
    width: 48px; height: 48px; font-size: 1.4rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(124,106,247,0.3); transition: all 0.2s; flex-shrink: 0;
  }

  .add-btn:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(124,106,247,0.5); }

  .todo-list { display: flex; flex-direction: column; gap: 8px; }

  .todo-item {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
    transition: all 0.2s; position: relative; overflow: hidden;
    animation: slideIn 0.25s ease;
  }

  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

  .todo-item:hover { border-color: rgba(255,255,255,0.12); background: var(--surface2); }

  .todo-item.done { opacity: 0.5; }
  .todo-item.done .todo-text { text-decoration: line-through; color: var(--muted); }

  .priority-stripe {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 12px 0 0 12px;
  }

  .p-high { background: linear-gradient(180deg, #f76a6a, #f7a06a); }
  .p-medium { background: linear-gradient(180deg, #f7d06a, #f7a06a); }
  .p-low { background: linear-gradient(180deg, #6af7c8, #6ab4f7); }

  .check-btn {
    width: 22px; height: 22px; border-radius: 6px; border: 1.5px solid var(--border);
    background: transparent; cursor: pointer; display: flex; align-items: center;
    justify-content: center; transition: all 0.15s; flex-shrink: 0;
  }

  .check-btn.checked { background: var(--accent3); border-color: var(--accent3); }
  .check-btn.checked::after { content: '✓'; color: #0a0a0f; font-size: 0.75rem; font-weight: 700; }
  .check-btn:hover:not(.checked) { border-color: var(--accent); }

  .todo-text { flex: 1; font-size: 0.88rem; line-height: 1.4; }

  .todo-edit-input {
    flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--accent);
    color: var(--text); font-family: 'DM Mono', monospace; font-size: 0.88rem;
    outline: none; padding-bottom: 2px;
  }

  .todo-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
  .todo-item:hover .todo-actions { opacity: 1; }

  .icon-btn {
    width: 30px; height: 30px; border-radius: 6px; border: none;
    background: transparent; cursor: pointer; display: flex;
    align-items: center; justify-content: center; font-size: 0.85rem;
    transition: all 0.15s; color: var(--muted);
  }

  .icon-btn:hover { background: var(--surface2); color: var(--text); }
  .icon-btn.del:hover { background: rgba(247,106,106,0.15); color: var(--danger); }
  .icon-btn.save:hover { background: rgba(106,247,200,0.15); color: var(--accent3); }

  .priority-badge {
    font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em;
    padding: 2px 8px; border-radius: 20px; font-weight: 500; flex-shrink: 0;
  }

  .badge-high { background: rgba(247,106,106,0.15); color: #f76a6a; }
  .badge-medium { background: rgba(247,208,106,0.15); color: #f7d06a; }
  .badge-low { background: rgba(106,247,200,0.15); color: #6af7c8; }

  .empty-state {
    text-align: center; padding: 60px 20px;
    color: var(--muted); font-size: 0.85rem; line-height: 1.8;
  }

  .empty-icon { font-size: 2.5rem; margin-bottom: 16px; display: block; }

  .progress-bar-wrap {
    background: var(--surface); border-radius: 4px; height: 4px; margin-bottom: 28px; overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 0.4s ease;
  }

  .progress-label {
    display: flex; justify-content: space-between; margin-bottom: 8px;
    font-size: 0.72rem; color: var(--muted); letter-spacing: 0.04em;
  }

  .clear-done-btn {
    background: transparent; border: 1px solid var(--border); border-radius: 8px;
    color: var(--muted); font-family: 'DM Mono', monospace; font-size: 0.72rem;
    padding: 6px 14px; cursor: pointer; letter-spacing: 0.04em;
    transition: all 0.2s; text-transform: uppercase;
  }

  .clear-done-btn:hover { border-color: rgba(247,106,106,0.4); color: var(--danger); }

  @media (max-width: 600px) {
    nav { padding: 0 20px; }
    .nav-links { gap: 16px; }
    .priority-badge, .filter-tabs { display: none; }
  }
`;

import { API_BASE } from "./apiConfig";

const PRIORITIES = ["high", "medium", "low"];
const API_URL = `${API_BASE}/api/todos`;

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const todosRef = useRef(null);

  const totalDone = stats.completed;
  const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const filtered = todos;

  const request = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { headers, ...options });
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { message: text };
    }

    if (!response.ok) {
      throw new Error(body?.message || text || "Server error");
    }
    return body;
  };

  const fetchTodos = async (currentFilter = filter) => {
    setLoading(true);
    setError("");

    try {
      const data = await request(`${API_URL}?filter=${currentFilter}`);
      setTodos(data.data || []);
      setStats({ total: data.total || 0, completed: data.completed || 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos(filter);
  }, [filter]);

  const addTodo = async () => {
    const text = input.trim();
    if (!text) return;

    try {
      setLoading(true);
      await request(API_URL, {
        method: "POST",
        body: JSON.stringify({ text, priority }),
      });
      setInput("");
      setPriority("medium");
      fetchTodos(filter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      setLoading(true);
      await request(`${API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      fetchTodos(filter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = (todo) => {
    updateTodo(todo._id || todo.id, { done: !todo.done });
  };

  const deleteTodo = async (todo) => {
    try {
      setLoading(true);
      await request(`${API_URL}/${todo._id || todo.id}`, {
        method: "DELETE",
      });
      fetchTodos(filter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (todo) => {
    setEditId(todo._id || todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    const text = editText.trim();
    if (!text) {
      setError("Task text cannot be empty.");
      return;
    }
    await updateTodo(id, { text });
    setEditId(null);
    setEditText("");
  };

  const clearDone = async () => {
    try {
      setLoading(true);
      await request(`${API_URL}/completed`, { method: "DELETE" });
      fetchTodos(filter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTodos = () => todosRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{style}</style>

      <nav>
        <div className="nav-logo">
          <div className="logo-dot" />
          TASKR
        </div>
        <div className="nav-links">
          <a onClick={scrollToTodos}>Tasks</a>
          <a>Projects</a>
          <a>Focus</a>
          <div className="nav-badge">{stats.total - stats.completed} pending</div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-tag"><span />Minimal Productivity Stack</div>
          <h1>
            Get things<br /><em>done</em>
            <span className="line2">beautifully.</span>
          </h1>
          <p className="hero-sub">A focused task manager for people who ship. Capture, organize, and complete your work without the noise.</p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={scrollToTodos}>Start tracking →</button>
            <button className="btn-secondary">View focus mode</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">Total tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{totalDone}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{progress}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
        </div>
      </section>

      <section className="todos-section" ref={todosRef}>
        <div className="section-header">
          <div className="section-title">Tasks</div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {totalDone > 0 && <button className="clear-done-btn" onClick={clearDone}>Clear done</button>}
            <div className="filter-tabs">
              {["all", "active", "done"].map(f => (
                <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="progress-label">
          <span>Progress</span>
          <span>{totalDone}/{stats.total} done</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="add-form">
          <input
            className="add-input"
            placeholder="Add a new task..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            disabled={loading}
          />
          <select className="priority-select" value={priority} onChange={e => setPriority(e.target.value)} disabled={loading}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="add-btn" onClick={addTodo} disabled={loading}>+</button>
        </div>

        {error && <div className="empty-state" style={{ color: "#f76a6a" }}>{error}</div>}
        {loading && !todos.length && <div className="empty-state">Loading tasks…</div>}

        <div className="todo-list">
          {filtered.length === 0 && !loading && (
            <div className="empty-state">
              <span className="empty-icon">✦</span>
              {filter === "done" ? "No completed tasks yet." : "No tasks here. Add one above!"}
            </div>
          )}
          {filtered.map(todo => {
            const id = todo._id || todo.id;
            return (
              <div key={id} className={`todo-item ${todo.done ? "done" : ""}`}>
                <div className={`priority-stripe p-${todo.priority}`} />
                <button
                  className={`check-btn ${todo.done ? "checked" : ""}`}
                  onClick={() => toggleTodo(todo)}
                  disabled={loading}
                />
                {editId === id ? (
                  <input
                    className="todo-edit-input"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit(id);
                      if (e.key === "Escape") setEditId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="todo-text">{todo.text}</span>
                )}
                <span className={`priority-badge badge-${todo.priority}`}>{todo.priority}</span>
                <div className="todo-actions">
                  {editId === id ? (
                    <button className="icon-btn save" onClick={() => saveEdit(id)} title="Save">✓</button>
                  ) : (
                    <button className="icon-btn" onClick={() => startEdit(todo)} title="Edit">✎</button>
                  )}
                  <button className="icon-btn del" onClick={() => deleteTodo(todo)} title="Delete" disabled={loading}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
