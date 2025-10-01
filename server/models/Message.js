import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: { type: String },
    seen: { type: Boolean, default: false },
    text: { type: String },
  },
  { timestamps: true }
);
const Message = mongoose.model('Message', messageSchema);
export default Message;
