import React from 'react';
import assets from '../assets/assets';
import { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const RightSideBar = () => {
  const { selectedUsers } = useContext(ChatContext);
  const { logout, isRightSideBar } = useContext(AuthContext);
  if (isRightSideBar) {
    return (
      selectedUsers && (
        <div
          className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${
            selectedUsers ? 'max-md:hidden' : ''
          }`}
        >
          <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
            <img
              src={selectedUsers.profilePic || assets.avatar_icon}
              alt=""
              className="w-20 aspect-[1/1] rounded-full"
            />
            <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
              <p className="w-2 h-2 rounded-full bg-green-500"></p>
              {selectedUsers.fullName}
            </h1>
            <p className="px-10 mx-auto">{selectedUsers.bio}</p>
          </div>
          <hr className="border-[#ffffff50] my-4" />
          <div className="px-5 text-xs">
            <p>Media</p>
          </div>
          <button
            onClick={logout}
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
          >
            Logout
          </button>
        </div>
      )
    );
  }
};
export default RightSideBar;
