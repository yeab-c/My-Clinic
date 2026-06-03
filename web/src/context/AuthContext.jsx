// Global auth state

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { saveToken, getToken, removeToken, saveUser, getUser, removeUser } from "@/lib/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser  = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (token, user) => {
    saveToken(token);
    saveUser(user);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);