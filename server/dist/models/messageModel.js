import mongoose, { Schema } from "mongoose";
const messageSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    datetime: {
        type: Date,
        required: true,
        default: Date.now,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
});
export const MessageModel = mongoose.model("Message", messageSchema);
//# sourceMappingURL=messageModel.js.map