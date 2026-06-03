import { useState, useEffect, useRef } from "react";
import { API_BASE } from "./apiConfig";
import { useNavigate } from "react-router-dom";

const PRIORITIES = ["high", "medium", "low"];
const API_URL = `${API_BASE}/api/todos`;

const priorityStripe = { high: "bg-red-500", medium: "bg-yellow-400", low: "bg-green-500" };
const priorityBadge = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export default function TodoApp({ user, onAuthChange }) {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [authError, setAuthError] = useState("");
  const todosRef = useRef(null);

  const totalDone = stats.completed;
  const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const request = async (url, options = {}) => {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const response = await fetch(url, {
      credentials: "include",
      headers,
      ...options,
    });
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { message: text };
    }
    if (!response.ok) throw new Error(body?.message || text || "Server error");
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

  useEffect(() => { fetchTodos(filter); }, [filter]);

  const addTodo = async () => {
    const text = input.trim();
    if (!text) return;
    try {
      setLoading(true);
      await request(API_URL, { method: "POST", body: JSON.stringify({ text, priority }) });
      setInput("");
      setPriority("medium");
      fetchTodos(filter);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const updateTodo = async (id, updates) => {
    try {
      setLoading(true);
      await request(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(updates) });
      fetchTodos(filter);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const toggleTodo = (todo) => updateTodo(todo._id || todo.id, { done: !todo.done });

  const deleteTodo = async (todo) => {
    try {
      setLoading(true);
      await request(`${API_URL}/${todo._id || todo.id}`, { method: "DELETE" });
      fetchTodos(filter);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const startEdit = (todo) => { setEditId(todo._id || todo.id); setEditText(todo.text); };

  const saveEdit = async (id) => {
    const text = editText.trim();
    if (!text) { setError("Task text cannot be empty."); return; }
    await updateTodo(id, { text });
    setEditId(null);
    setEditText("");
  };

  const clearDone = async () => {
    try {
      setLoading(true);
      await request(`${API_URL}/completed`, { method: "DELETE" });
      fetchTodos(filter);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = authModal === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
      const payload = authModal === "login"
        ? { email: authForm.email, password: authForm.password }
        : { name: authForm.name, email: authForm.email, password: authForm.password };
      const data = await request(`${API_BASE}${endpoint}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.user) {
        onAuthChange?.(data.user);
      }
      setAuthModal(null);
      setAuthForm({ email: "", password: "", name: "" });
      fetchTodos(filter);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await request(`${API_BASE}/api/auth/logout`, { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
    onAuthChange?.(null);
    setTodos([]);
    setStats({ total: 0, completed: 0 });
    navigate("/login");
  };

  const openModal = (type) => {
    setAuthModal(type);
    setAuthError("");
    setAuthForm({ email: "", password: "", name: "" });
  };

  const filters = ["all", "active", "done"];

  const features = [
    { icon: "ti-list-check", title: "Prioritized tasks", desc: "Mark tasks high, medium, or low priority to stay focused on what matters." },
    { icon: "ti-chart-bar", title: "Progress tracking", desc: "See your completion rate at a glance with a live progress bar." },
    { icon: "ti-filter", title: "Smart filters", desc: "Switch between all, active, and done views in one click." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M2 7h7M2 10h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm tracking-wide">Taskr</span>
          </div>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <a
              href="#features"
              className="text-gray-500 no-underline"
              onClick={e => { e.preventDefault(); document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}
            >
              Features
            </a>
            <a
              href="#tasks"
              className="text-gray-500 no-underline"
              onClick={e => { e.preventDefault(); todosRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            >
              My tasks
            </a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-gray-500 hidden sm:inline">
                  Hi, {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openModal("login")}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white"
                >
                  Log in
                </button>
                <button
                  onClick={() => openModal("register")}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-500 text-white border border-indigo-500"
                >
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            Simple · Fast · Focused
          </span>

          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight mb-4 max-w-xl">
            A cleaner way to manage your tasks
          </h1>

          <p className="text-gray-500 text-base leading-relaxed max-w-md mb-8">
            Taskr helps you capture, prioritize, and complete work without the clutter. No boards, no noise — just your list.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => todosRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-medium"
            >
              Go to my tasks
            </button>
            {!user && (
              <button
                onClick={() => openModal("register")}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium bg-white"
              >
                Create account
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-100 w-full max-w-sm justify-center">
            {[
              { val: stats.total, label: "Total tasks" },
              { val: totalDone, label: "Completed" },
              { val: `${progress}%`, label: "Progress" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-semibold text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-6 text-center">Why Taskr</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  <i className={`ti ${f.icon} text-indigo-500`} style={{ fontSize: 16 }} aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TASKS ── */}
      <main className="max-w-2xl mx-auto px-4 py-10" ref={todosRef} id="tasks">
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Task manager</p>
          <h2 className="text-xl font-semibold text-gray-900">My tasks</h2>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>{totalDone} / {stats.total} done</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Add form */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 placeholder-gray-400"
              placeholder="Add a new task..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTodo()}
              disabled={loading}
            />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white outline-none focus:border-indigo-400"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              disabled={loading}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <button
              className="bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              onClick={addTodo}
              disabled={loading}
            >
              Add
            </button>
          </div>
          <div className="flex gap-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize border ${
                  filter === f
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "border-gray-200 text-gray-500 bg-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading && !todos.length && (
          <div className="text-center text-sm text-gray-400 py-10">Loading tasks…</div>
        )}

        {/* Todo list */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
          {todos.length === 0 && !loading ? (
            <div className="text-center text-sm text-gray-400 py-12">
              {filter === "done" ? "No completed tasks yet." : "No tasks here. Add one above!"}
            </div>
          ) : (
            todos.map((todo, idx) => {
              const id = todo._id || todo.id;
              const isEditing = editId === id;
              const isLast = idx === todos.length - 1;
              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b border-gray-100" : ""} ${todo.done ? "opacity-50" : ""}`}
                >
                  <div className={`w-1 h-10 rounded-full flex-shrink-0 ${priorityStripe[todo.priority] || "bg-gray-300"}`} />
                  <input
                    type="checkbox"
                    checked={!!todo.done}
                    onChange={() => toggleTodo(todo)}
                    disabled={loading}
                    className="w-4 h-4 accent-indigo-500 flex-shrink-0 cursor-pointer"
                  />
                  {isEditing ? (
                    <input
                      className="flex-1 border-b border-indigo-400 text-sm text-gray-900 bg-transparent outline-none py-0.5"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit(id);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className={`flex-1 text-sm ${todo.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {todo.text}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityBadge[todo.priority] || ""}`}>
                    {todo.priority}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {isEditing ? (
                      <button
                        onClick={() => saveEdit(id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-green-200 bg-green-50 text-green-700"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(todo)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 bg-gray-50 text-gray-600"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteTodo(todo)}
                      disabled={loading}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-red-200 bg-red-50 text-red-600 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* <div className="flex justify-between items-center px-1">
          <span className="text-xs text-gray-400">{totalDone} of {stats.total} completed</span>
          {totalDone > 0 && (
            <button
              onClick={clearDone}
              className="text-xs font-medium text-red-500 bg-transparent border-none cursor-pointer"
            >
              Clear completed
            </button>
          )}
        </div> */}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white mt-4">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M2 7h7M2 10h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-500">Taskr</span>
          </div>
          <p className="text-xs text-gray-400">Stay focused. Ship more.</p>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4"
          onClick={e => { if (e.target === e.currentTarget) setAuthModal(null); }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                {authModal === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <button
                onClick={() => setAuthModal(null)}
                className="text-gray-400 bg-transparent border-none cursor-pointer text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAuth}>
              {authModal === "register" && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={authForm.name}
                    onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 placeholder-gray-400"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={authForm.email}
                  onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 placeholder-gray-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 placeholder-gray-400"
                />
              </div>

              {authError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium"
              >
                {authModal === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-4">
              {authModal === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => openModal(authModal === "login" ? "register" : "login")}
                className="text-indigo-500 font-medium bg-transparent border-none cursor-pointer"
              >
                {authModal === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}