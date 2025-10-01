import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const { auth, updateProfile } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(auth);
  const [bio, setBio] = useState(auth.bio);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate('/');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64img = reader.result;
      await updateProfile({ profilePic: base64img, fullName: name, bio });
      navigate('/');
    };
  };
  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backfrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 flex-1 p-10"
        >
          <h3 className="text-lg">Profile Details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="file"
              onChange={(e) => setSelectedImg(e.target.files[0])}
              id="avatar"
              accept=".jpg, .png, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              className={`w-12 h-12 ${selectedImg && 'rounded-full'}`}
              alt=""
            />
            Upload Image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your Name"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            placeholder="Write profile bio"
            rows={4}
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          ></textarea>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>
        <img
          src={auth?.profilePic || assets.logo_icon}
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${
            selectedImg && 'rounded-full'
          }`}
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfilePage;
