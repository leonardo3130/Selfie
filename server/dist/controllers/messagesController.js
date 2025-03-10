import { MessageModel } from "../models/messageModel.js";
import { UserModel } from "../models/userModel.js";
// getMessages
export const getMessages = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const messages = await MessageModel.find({
            $or: [{ to: user.username }, { from: user.username }]
        });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
// sendMessage
export const sendMessage = async (req, res) => {
    const { sender_id } = req.params;
    const { text, to } = req.body;
    try {
        if (!sender_id || !text || !to) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const sender = await UserModel.findById(sender_id);
        if (!sender) {
            return res.status(404).json({ message: "Sender not found" });
        }
        const receiver = await UserModel.findOne({ username: to });
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }
        const messageData = {
            text: text.trim(),
            datetime: new Date(),
            from: sender.username,
            to: receiver.username
        };
        try {
            const createdMessage = await MessageModel.create(messageData);
            return res.status(200).json(createdMessage);
        }
        catch (mongoError) {
            return res.status(400).json({
                message: "Error creating message",
                error: mongoError.message
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
//# sourceMappingURL=messagesController.js.map