import mongoose, { mongo } from 'mongoose';

export const connectDb = async () => {
  try {
    mongoose.connection.on('connected', () => console.log('Connected'));
    await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`);
  } catch (error) {
    console.log(error);
  }
};
