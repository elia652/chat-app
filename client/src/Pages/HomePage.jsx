import React from 'react';
import RightSideBar from '../Components/RightSideBar';
import ChatContainer from '../Components/ChatContainer';
import SideBar from '../Components/SideBar';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const HomePage = () => {
  const { isRightSideBar } = useContext(AuthContext);
  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${
          isRightSideBar
            ? 'md:grid-cols-[1fr_1.5fr_1fr]'
            : 'md:grid-cols-[1fr_2fr]'
        }`}
      >
        <SideBar />
        <ChatContainer />
        <RightSideBar />
      </div>
    </div>
  );
};

export default HomePage;
