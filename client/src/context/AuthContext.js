import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);         // { token, user } — set after terms accepted
  const [pending, setPending] = useState(null);   // temp { token, user } — set after signup

  const setPendingAuth = (data) => setPending(data);
  const login = (data) => setAuth(data);
  const logout = () => { setAuth(null); setPending(null); };
  const isAuthenticated = () => !!auth?.token;

  return (
    <AuthContext.Provider value={{ auth, pending, setPendingAuth, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
