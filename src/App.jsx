import React, { useState, useEffect } from "react";
import TodoApp from "./Todo";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import ProtectedRoute from "./ProtectedRoutes";
import { API_BASE } from "./apiConfig";

const App = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload.user) {
          setUser(payload.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    loadUser();
  }, []);

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Checking authentication…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRegister onAuth={setUser} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <TodoApp user={user} onAuthChange={setUser} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
