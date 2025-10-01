import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import User from '../models/User.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
  const { email, fullName, password, bio } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Account already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hash,
      bio,
    });

    const token = generateToken(newUser._id);
    return res.json({
      success: true,
      userData: newUser,
      token,
      message: 'Signed up successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(userData._id);
    return res.json({
      success: true,
      userData,
      token,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAuth = (req, res) => {
  return res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updatedUser;

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    }

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
