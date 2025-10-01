import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]); // always an array
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({}); // { userId: count }
  const { socket, axios } = useContext(AuthContext);

  // Keep the current selected user id in a ref for event handlers
  const selectedIdRef = useRef(null);
  useEffect(() => {
    selectedIdRef.current = selectedUsers?._id ?? null;
  }, [selectedUsers]);

  const getUsers = async () => {
    try {
      const { data } = await axios.get('/api/messages/users');
      if (data?.success) {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
    }
  };

  const getMessages = async (userId) => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data?.success) {
        setMessages(Array.isArray(data.messages) ? data.messages : []);

        // Mark whole conversation seen (now implemented server-side)
        try {
          await axios.put(`/api/messages/mark-conversation/${userId}`);
        } catch {
          /* no-op */
        }

        // Locally reset unseen counter for this user
        setUnseenMessages((prev) => {
          if (!prev || !prev[userId]) return prev || {};
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch messages');
    }
  };

  const sendMessage = async (messageData) => {
    const toId = selectedUsers?._id;
    if (!toId) {
      toast.error('No conversation selected');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/messages/send/${toId}`,
        messageData
      );
      if (data?.success && data.newMessage) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data?.error || 'Failed to send message');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  // Socket subscription (with proper cleanup and a stable handler)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      const activeId = selectedIdRef.current;

      if (activeId && newMessage?.senderId === activeId) {
        // Arrived in the open conversation -> append and mark seen
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        try {
          await axios.put(`/api/messages/mark/${newMessage._id}`);
        } catch {
          /* ignore marking failures */
        }
      } else if (newMessage?.senderId) {
        // Increment unseen counter for that sender
        setUnseenMessages((prev = {}) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, axios]);

  // When switching selected user, clear and fetch
  useEffect(() => {
    if (!selectedUsers?._id) {
      setMessages([]);
      return;
    }
    setMessages([]); // avoid old chat flash
    getMessages(selectedUsers._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers?._id]);

  const value = {
    messages,
    users,
    selectedUsers,
    unseenMessages,
    setMessages,
    setSelectedUsers,

    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
