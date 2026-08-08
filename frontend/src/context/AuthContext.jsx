import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("bulkmail_admin");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("bulkmail_token"));

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setAdmin(data.admin);
    localStorage.setItem("bulkmail_token", data.token);
    localStorage.setItem("bulkmail_admin", JSON.stringify(data.admin));
    return data;
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("bulkmail_token");
    localStorage.removeItem("bulkmail_admin");
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
