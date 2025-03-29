import { DateTime } from "luxon";
import mongoose from "mongoose";
import { ActivityModel } from "../models/activityModel.js";
import { UserModel } from "../models/userModel.js";
import { changeActivitiesDate } from "../utils/activityUtils.js";
import { sendActivityInvitationEmail, setEmails, } from "../utils/invitationUtils.js";
const createActivity = async (req, res) => {
    const { title, description, date, attendees, notifications, timezone, user: userId, } = req.body;
    try {
        const validAttendees = await setEmails(attendees);
        const activity = await ActivityModel.create({
            title,
            description,
            date,
            attendees: validAttendees,
            notifications,
            isCompleted: false,
            _id_user: userId,
            timezone,
        });
        await sendActivityInvitationEmail(userId, activity, activity.attendees || []);
        res.status(201).json(activity);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getActivities = async (req, res) => {
    const userId = req.body.user;
    const date = req.query.date
        ? req.query.date.toString()
        : undefined;
    const week = /^true$/i.test(req.query.week);
    const user = await UserModel.findOne({ _id: userId }).select("email dateOffset");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    try {
        /*change dates for late activities*/
        await changeActivitiesDate(userId.toString(), user.email, user.dateOffset);
        let activities;
        if (!date) {
            activities = await ActivityModel.find({
                $or: [
                    { _id_user: userId.toString() },
                    {
                        attendees: {
                            $elemMatch: {
                                email: user.email,
                                responded: true,
                                accepted: true,
                            },
                        },
                    },
                ],
            });
        }
        else {
            let start = week
                ? DateTime.fromISO(date).startOf("week")
                : DateTime.fromISO(date).startOf("day");
            let end = week
                ? DateTime.fromISO(date).endOf("week")
                : DateTime.fromISO(date).endOf("day");
            activities = await ActivityModel.find({
                $and: [
                    {
                        $or: [
                            { _id_user: userId.toString() },
                            {
                                attendees: {
                                    $elemMatch: {
                                        email: user.email,
                                        responded: true,
                                        accepted: true,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        date: {
                            $gte: start.toJSDate(),
                            $lte: end.toJSDate(),
                        },
                    },
                ],
            });
        }
        res.status(200).json(activities);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getActivityById = async (req, res) => {
    const activityId = req.params.id;
    const userId = req.body.user;
    const user = await UserModel.findOne({ _id: userId }).select("email");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
        return res.status(400).json({ error: "Invalid Activity Id" });
    }
    try {
        const activity = await ActivityModel.findOne({
            _id: new mongoose.Types.ObjectId(activityId),
            $or: [
                { _id_user: userId.toString() },
                {
                    attendees: {
                        $elemMatch: {
                            email: user.email,
                            accepted: true,
                        },
                    },
                },
            ],
        });
        res.status(200).json(activity);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteActivityById = async (req, res) => {
    const activityId = req.params.id;
    const userId = req.body.user;
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
        return res.status(400).json({ error: "Invalid Activity Id" });
    }
    try {
        const activity = await ActivityModel.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(activityId),
            _id_user: userId.toString(),
        });
        res.status(200).json(activity);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteActivities = async (req, res) => {
    const userId = req.body.user;
    try {
        const result = await ActivityModel.deleteMany({
            _id_user: userId.toString(),
        });
        if (result.deletedCount === 0) {
            throw new Error("Impossibile to delete all activities");
        }
        res.status(200).json({ message: "All activities deleted" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const updateActivity = async (req, res) => {
    const activityId = req.params.id;
    const { user: userId, ...activityData } = req.body;
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
        return res.status(400).json({ error: "Invalid Activity Id" });
    }
    let newAttendees = [];
    if ("attendees" in activityData) {
        const activity = await ActivityModel.findOne({
            _id: activityId,
        }).select("attendees");
        if (!activity) {
            return res.status(404).json({ error: "Activity not found" });
        }
        for (const newAttendee of activityData.attendees) {
            let isNew = true;
            for (const attendee of activity.attendees || []) {
                if (newAttendee.name === attendee.name) {
                    isNew = false;
                    newAttendee.accepted = attendee.accepted;
                    newAttendee.responded = attendee.responded;
                    newAttendee.email = attendee.email;
                }
            }
            if (isNew)
                newAttendees.push(newAttendee);
        }
    }
    try {
        const newValidAttendees = await setEmails(newAttendees);
        const newActivity = await ActivityModel.findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(activityId),
            _id_user: userId.toString(),
        }, { ...activityData }, { new: true });
        if (!newActivity) {
            return res.status(404).json({ message: "Activity doesn't exist" });
        }
        else
            await sendActivityInvitationEmail(userId, newActivity, newValidAttendees);
        res.status(200).json(newActivity);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export { createActivity, deleteActivities, deleteActivityById, getActivities, getActivityById, updateActivity };
//# sourceMappingURL=activityControllers.js.map