import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./apiConfig";

function LoginRegister({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = `${API_BASE}/api/auth/${isLogin ? "login" : "register"}`;
      const body = isLogin ? { email, password } : { name, email, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Auth failed");

      onAuth?.(data.user || null);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-600 via-gray-600 to-black px-4">
    <div className="w-full max-w-md">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-200 mt-2">
            {isLogin
              ? "Sign in to continue"
              : "Register and start managing your tasks"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {!isLogin && (
            <div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>
          )}

          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-white transition"
            />
          </div>

          <div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-white transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-100 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-purple-700 font-semibold hover:bg-gray-100 transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-200">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 font-semibold text-white hover:text-yellow-300 transition"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

export default LoginRegister;