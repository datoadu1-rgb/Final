/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMe } from "./api";

type User = {
  id?: string;
  name?: string;
  email?: string;
};

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signIn: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    localStorage.getItem("accessToken") ? "loading" : "guest",
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    getMe(token)
      .then((data) => {
        setUser(data.user ?? data);
        setStatus("authenticated");
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
        setStatus("guest");
      });
  }, []);

  function signIn(token: string, newUser: User) {
    localStorage.setItem("accessToken", token);
    setUser(newUser);
    setStatus("authenticated");
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
    setStatus("guest");
  }

  return (
    <AuthContext.Provider value={{ status, user, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

// gverdebze sadac login aucilebelia
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") {
    return <p>Loading...</p>;
  }

  if (auth.status === "guest") {
    return <Navigate to={"/login?redirect=" + location.pathname} replace />;
  }

  return <>{children}</>;
}
