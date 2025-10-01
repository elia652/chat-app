import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { ChatContext } from './ChatContext';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [auth, setAuth] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isRightSideBar, setIsRightSideBar] = useState(false);
  const navigate = useNavigate();
  const checkAuth = async () => {
    try {
      const data = await axios.get('/api/auth/check');
      if (data.success) {
        setAuth(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuth(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common['token'] = data.token;
        setToken(data.token);
        localStorage.setItem('token', data.token);
        toast.success(data.message);
        navigate('/');
      } else {
        console.log(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const logout = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setOnlineUsers([]);
    setAuth(null);
    setIsRightSideBar(false);
    axios.defaults.headers.common['token'] = null;
    toast.success('Logged out successfully');
    socket.disconnect();
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put('/api/auth/update-profile', body);
      if (data.success) {
        setAuth(data.user);
        toast.success('Profile Updated Successfully!');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on('getOnlineUsers', (userId) => {
      setOnlineUsers(userId);
    });
  };
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['token'] = token;
    }
    checkAuth();
  });
  const value = {
    axios,
    auth,
    onlineUsers,
    socket,
    login,
    setIsRightSideBar,
    isRightSideBar,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
