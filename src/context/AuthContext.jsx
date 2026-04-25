import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role) => {
    try {
      const endpoint = role === 'admin' ? '/api/auth/admin-login' : '/api/auth/team-login';
      const payload = { email: username, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      const { token: newToken, role: resRole, team } = res.data;
      setToken(newToken);
      setUser(resRole === 'admin' ? { role: 'admin' } : { role: 'team', ...team });
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(resRole === 'admin' ? { role: 'admin' } : { role: 'team', ...team }));
      toast.success(`Welcome${team ? ' ' + team.name : ''}!`);
      navigate(resRole === 'admin' ? '/admin/dashboard' : '/team/dashboard');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
    navigate('/');
  };

  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });

  return (
    <AuthContext.Provider value={{ user, token, login, logout, api, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
