import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../Context/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const {
    getMessages,
    selectedUsers,
    setSelectedUsers,
    messages,
    sendMessage,
  } = useContext(ChatContext);
  const { auth, onlineUsers, setIsRightSideBar, isRightSideBar } =
    useContext(AuthContext);

  const scrollend = useRef(null);
  const [input, setInput] = useState('');

  const msgs = Array.isArray(messages) ? messages : [];
  const isOnline =
    onlineUsers && selectedUsers
      ? Array.isArray(onlineUsers) && onlineUsers.includes?.(selectedUsers._id)
      : false;

  const handleSendMessages = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;
    try {
      await sendMessage({ text });
      setInput('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    if (selectedUsers?._id) getMessages(selectedUsers._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers?._id]);

  useEffect(() => {
    if (scrollend.current && msgs.length) {
      scrollend.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs]);

  const handleSendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Select an image file');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await sendMessage({ image: reader.result });
      } catch {
        toast.error('Failed to send image');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  if (!selectedUsers) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} alt="" className="max-w-16" />
        <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500 justify-between ">
        <div
          className="cursor-pointer flex flex-row gap-3"
          onClick={() => {
            !isRightSideBar
              ? setIsRightSideBar(true)
              : setIsRightSideBar(false);
          }}
        >
          <img
            src={selectedUsers.profilePic || assets.avatar_icon}
            alt=""
            className="w-8 rounded-full"
          />
          <p className="flex-1 text-lg text-white flex items-center gap-2">
            {selectedUsers.fullName}

            {isOnline && <span className="w-2 h-2 rounded-full bg-green-500" />}
          </p>
        </div>
        <img
          onClick={() => setSelectedUsers(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* Chat area */}
      <div className="h-[calc(100%-120px)] overflow-y-auto py-6">
        <div className="w-full max-w-[680px] mx-auto px-3 space-y-6">
          {msgs.map((data, index) => {
            const myId = auth?._id;
            const senderId =
              data?.senderId || data?.sender?._id || data?.fromId;
            const isMine =
              myId && senderId && String(senderId) === String(myId);

            return (
              <div
                key={data._id || index}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-end gap-3 ${
                    isMine ? 'flex-row-reverse' : ''
                  }`}
                >
                  <img
                    src={
                      isMine
                        ? auth?.profilePic || assets.avatar_icon
                        : selectedUsers.profilePic || assets.avatar_icon
                    }
                    alt=""
                    className="w-7 rounded-full"
                  />
                  {data?.image ? (
                    <img
                      src={data.profilePic}
                      alt=""
                      className="max-w-[230px] rounded-lg border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.35)]"
                    />
                  ) : (
                    <p
                      className={`px-4 py-3 max-w-[420px] md:text-sm font-light rounded-lg break-all text-white
                                  bg-violet-500/60 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,.35)]
                                  ${
                                    isMine
                                      ? 'rounded-br-none'
                                      : 'rounded-bl-none'
                                  }`}
                    >
                      {data?.text ?? ''}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 whitespace-nowrap">
                    {data?.createdAt ? formatMessageTime(data.createdAt) : ''}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={scrollend} />
        </div>

        {/* Composer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
          <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
            <input
              type="text"
              value={input}
              onKeyDown={(e) =>
                e.key === 'Enter' ? handleSendMessages(e) : null
              }
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message"
              className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
            />
            <input
              type="file"
              id="image"
              onChange={handleSendImage}
              accept="image/*"
              hidden
            />
            <label htmlFor="image">
              <img
                src={assets.gallery_icon}
                alt=""
                className="w-5 mr-2 cursor-pointer"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleSendMessages}
            className="w-7 h-7 flex items-center justify-center cursor-pointer"
            title="Send"
          >
            <img src={assets.send_button} alt="" className="w-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
