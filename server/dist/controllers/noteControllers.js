import mongoose from "mongoose";
import { NoteModel } from "../models/noteModel.js";
import { UserModel } from "../models/userModel.js";
const addNote = async (req, res) => {
    const { user: _id, ...noteData } = req.body;
    const user = await UserModel.findOne({ _id }).select("username");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (user.username !== noteData.author) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const newNote = await NoteModel.create({ ...noteData });
        res.status(200).json(newNote);
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid note data" });
    }
};
const getNotes = async (req, res) => {
    const _id = req.body.user;
    const user = await UserModel.findOne({ _id }).select("username");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    //query params
    let { start, end, pub, priv, group, tags, last } = req.query;
    let notes;
    //get only last note for preview
    if (last === "true") {
        notes = await NoteModel.find({ author: user.username })
            .sort({ created: -1 })
            .limit(1);
    }
    else {
        tags = tags ? tags.toString().split(",") : [];
        if (priv === undefined)
            priv = "true";
        if (group === undefined)
            group = "true";
        const privQuery = priv === "true" ? { author: user.username } : { _id: null };
        const pubQuery = pub === "true" ? { open: true } : { _id: null };
        const groupQuery = group === "true"
            ? { allowedUsers: { $in: [user.username] } }
            : { _id: null };
        const dateQuery = (start && end) || start === "" || end === ""
            ? { created: { $gte: start, $lte: end } }
            : {};
        const tagsQuery = tags.length > 0 ? { tags: { $in: tags } } : {};
        const query = {
            $or: [{ ...privQuery }, { ...pubQuery }, { ...groupQuery }],
            ...dateQuery,
            ...tagsQuery,
        };
        notes = await NoteModel.find(query);
    }
    if (notes === null) {
        return res.status(404).json({ error: "Impossibile to retrieve notes" });
    }
    res.status(200).json(notes);
};
const getNote = async (req, res) => {
    const userId = req.body.user;
    const noteId = req.params.id;
    const user = await UserModel.findOne({ _id: userId }).select("username");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return res.status(400).json({ error: "Invalid Note Id" });
    }
    //la nota deve avere l'ID nel parametro ed essere
    const note = await NoteModel.findOne({
        _id: new mongoose.Types.ObjectId(noteId),
        $or: [
            { author: user.username },
            { allowedUsers: { $in: [user.username] } },
        ],
    });
    if (note === null) {
        return res.status(404).json({ error: "Impossibile to retrieve the note" });
    }
    res.status(200).json(note);
};
const updateNote = async (req, res) => {
    const { user: userId, ...noteData } = req.body;
    const noteId = req.params.id;
    const user = await UserModel.findOne({ _id: userId }).select("username");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return res.status(400).json({ error: "Invalid Note Id" });
    }
    const note = await NoteModel.findOneAndUpdate({
        _id: new mongoose.Types.ObjectId(noteId),
        author: user.username, //tolgo la condizione della lista --> posso modificare solo le mie note
    }, { ...noteData, updated: Date.now() }, { new: true });
    if (note === null) {
        return res
            .status(404)
            .json({ error: "Impossibile to retrieve and update the note" });
    }
    res.status(200).json(note);
};
const deleteNote = async (req, res) => {
    const { user: userId, ...noteData } = req.body;
    const noteId = req.params.id;
    const user = await UserModel.findOne({ _id: userId }).select("username");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return res.status(400).json({ error: "Invalid Note Id" });
    }
    const note = await NoteModel.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(noteId),
        author: user.username, //tolgo la condizione della lista --> posso eliminare solo le mie note
    });
    if (note === null) {
        return res
            .status(404)
            .json({ error: "Impossibile to retrieve and delete the note" });
    }
    res.status(200).json(note);
};
const deleteNotes = async (req, res) => {
    const { user: userId } = req.body;
    const user = await UserModel.findOne({ _id: userId }).select("username");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const deleteResult = await NoteModel.deleteMany({
        author: user.username,
    });
    if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: "Impossibile to delete all notes" });
    }
    return res.status(200);
};
export { addNote, deleteNote, deleteNotes, getNote, getNotes, updateNote };
//# sourceMappingURL=noteControllers.js.map