import mongoose from "mongoose";
import pkg from "rrule";
import { ActivityModel } from "../models/activityModel.js";
import { EventModel } from "../models/eventModel.js";
import { UserModel } from "../models/userModel.js";
import { sendEventInvitationEmail, setEmails, } from "../utils/invitationUtils.js";
import { updatePastPomodoro } from "../utils/pomEventUtils.js";
const { RRule } = pkg;
import { console } from "inspector";
import { createICalendar, readICalendar } from "../utils/icalendarUtils.js";
const createEvent = async (req, res) => {
    const { title, description, date, endDate, location, url, duration, recurrenceRule, attendees, notifications, isRecurring, timezone, user: userId, isPomodoro, isDoNotDisturb, pomodoroSetting, } = req.body;
    try {
        const validAttendees = await setEmails(attendees);
        const creator = await UserModel.findOne({ _id: userId });
        const attArray = attendees;
        attArray?.forEach((att, index) => {
            if (att.name == creator?.username) {
                attArray?.splice(index, 1);
            }
        });
        const event = await EventModel.create({
            title,
            description,
            date,
            endDate,
            location,
            url,
            duration,
            isRecurring,
            recurrenceRule,
            attendees: attArray,
            notifications,
            timezone,
            _id_user: userId,
            isPomodoro,
            isDoNotDisturb,
            pomodoroSetting,
        });
        console.log("EVENTONE", event);
        sendEventInvitationEmail(userId, event, event.attendees || []);
        res.status(201).json(event);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getEventById = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.user;
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid Event Id" });
    }
    try {
        const event = await EventModel.findOne({
            _id: new mongoose.Types.ObjectId(eventId),
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
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json(event);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getAllEvents = async (req, res) => {
    const userId = req.body.user;
    const date = req.query.date;
    const onlyRecurring = /^true$/i.test(req.query.onlyRecurring);
    const nextPom = /^true$/i.test(req.query.nextPom);
    const user = await UserModel.findOne({ _id: userId }).select("email dateOffset");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    try {
        await updatePastPomodoro(userId.toString(), user.email, user.dateOffset);
        let events;
        if (typeof date !== "string") {
            if (onlyRecurring) {
                events = await EventModel.find({
                    isRecurring: onlyRecurring,
                });
            }
            else {
                events = await EventModel.find({
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
            }
        }
        else if (nextPom !== true) {
            //query di eventi in una certa data, NON fa query di eventi ricorrenti
            events = await EventModel.find({
                $and: [
                    {
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
                    },
                    {
                        $or: [
                            //eventi nella data
                            {
                                date: {
                                    //ignoro ore, minuti, s e ms delle ore
                                    $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                                    $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
                                },
                            },
                            //eventi in date precedenti la cui durata li fa arrivare fino alla data della query
                            {
                                date: {
                                    $lte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                                },
                                endDate: {
                                    $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                                },
                            },
                            {
                                isRecurring: true,
                            },
                        ],
                    },
                ],
            });
            events = events.filter((e) => {
                if (e.isRecurring) {
                    const rrule = RRule.fromString(e.recurrenceRule);
                    const occurrences = rrule.between(new Date(new Date(date).setHours(0, 0, 0, 0)), new Date(new Date(date).setHours(23, 59, 59, 999)), true);
                    console.log(occurrences.length);
                    return occurrences.length > 0;
                }
                else
                    return true;
            });
        }
        else {
            events = await EventModel.find({
                $and: [
                    {
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
                    },
                    {
                        $or: [
                            {
                                date: {
                                    $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                                },
                            },
                            {
                                isRecurring: true,
                            },
                        ],
                    },
                ],
                isPomodoro: true,
            });
            /* next non-recurring pomodoro event */
            const nonRecurringEvents = events.filter((e) => !e.isRecurring);
            const eventWithLowestDate = nonRecurringEvents.length > 0
                ? nonRecurringEvents.reduce((min, current) => {
                    return current.date < min.date ? current : min;
                })
                : null; // Return null if no non-recurring events exist
            // console.log("NEXT POM", eventWithLowestDate);
            let minRDate = undefined;
            /* next recurring pomodoro event */
            const recurringPomEvents = events.filter((e) => {
                if (e.isRecurring) {
                    const rrule = RRule.fromString(e.recurrenceRule);
                    const occurrence = rrule.after(new Date(new Date(date).setHours(0, 0, 0, 0)));
                    return occurrence !== null;
                }
                else
                    return false;
            });
            console.log("REC POMS", recurringPomEvents);
            let eventWithLowestDateR = undefined;
            if (recurringPomEvents.length > 0) {
                eventWithLowestDateR = recurringPomEvents.reduce((min, current) => {
                    const rruleMin = RRule.fromString(min.recurrenceRule);
                    const rruleCurrent = RRule.fromString(current.recurrenceRule);
                    const occurrenceMin = rruleMin.after(new Date(new Date(date).setHours(0, 0, 0, 0)));
                    const occurrenceCurrent = rruleCurrent.after(new Date(new Date(date).setHours(0, 0, 0, 0)));
                    if (occurrenceMin < occurrenceCurrent) {
                        minRDate = occurrenceMin;
                        return min;
                    }
                    else {
                        minRDate = occurrenceCurrent;
                        return current;
                    }
                }, recurringPomEvents[0]);
            }
            if (eventWithLowestDate &&
                eventWithLowestDateR &&
                typeof minRDate !== "undefined") {
                events = [
                    minRDate < eventWithLowestDate.date
                        ? eventWithLowestDateR
                        : eventWithLowestDate,
                ];
            }
            else if (eventWithLowestDate) {
                events = [eventWithLowestDate];
            }
            else if (eventWithLowestDateR) {
                events = [eventWithLowestDateR];
            }
            else {
                events = [];
            }
        }
        res.status(200).json(events);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};
const deleteEventById = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.user;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid Event Id" });
    }
    try {
        const event = await EventModel.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(eventId),
            _id_user: userId.toString(),
        });
        res.status(200).json(event);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteAllEvents = async (req, res) => {
    const userId = req.body.user;
    try {
        const result = await EventModel.deleteMany({
            _id_user: userId.toString(),
        });
        if (result.deletedCount === 0) {
            throw new Error("Impossibile to delete all events");
        }
        res.status(200).json({ message: "All events deleted" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const updateEvent = async (req, res) => {
    const eventId = req.params.id;
    const { user: userId, ...eventData } = req.body;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid Event Id" });
    }
    let newAttendees = [];
    if ("attendees" in eventData) {
        const event = await EventModel.findOne({
            _id: eventId,
        }).select("attendees");
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        const creator = await UserModel.findOne({ _id: userId });
        for (const newAttendee of eventData.attendees) {
            let isNew = true;
            for (const attendee of event.attendees || []) {
                if (newAttendee.name === attendee.name) {
                    isNew = false;
                    newAttendee.accepted = attendee.accepted;
                    newAttendee.responded = attendee.responded;
                    newAttendee.email = attendee.email;
                }
            }
            if (isNew && creator?.username != newAttendee.name)
                newAttendees.push(newAttendee);
        }
    }
    try {
        //update event
        const newValidAttendees = await setEmails(newAttendees);
        console.log(newValidAttendees);
        const newEvent = await EventModel.findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(eventId),
            $or: [
                { isPomodoro: true },
                { isPomodoro: false, _id_user: userId },
            ],
        }, {
            ...eventData,
        }, { new: true });
        if (!newEvent)
            res.status(404).json({ message: "Event doesn't exist" });
        else
            sendEventInvitationEmail(userId, newEvent, newValidAttendees);
        res.status(200).json(newEvent);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const exportEvents = async (req, res) => {
    const userId = req.body.user;
    try {
        /* retrieving events and activities */
        const events = await EventModel.find({ _id_user: userId });
        if (!events || events.length === 0) {
            return res.status(404).json({ error: "No events found for this user" });
        }
        const activities = await ActivityModel.find({
            _id_user: userId,
        });
        if (!activities || activities.length === 0) {
            return res
                .status(404)
                .json({ error: "No activities found for this user" });
        }
        /* ics calendar generation */
        const icalendarContent = createICalendar(events, activities);
        /* setting headers to allow file download*/
        res.setHeader("Content-Type", "text/calendar");
        res.setHeader("Content-Disposition", "attachment; filename=calendario.ics");
        res.send(icalendarContent);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message,
        });
    }
};
const importEvents = async (req, res) => {
    const { icalData } = req.body;
    const userId = req.body.user;
    if (!icalData) {
        return res.status(400).json({ error: "Missing ics data" });
    }
    try {
        const calendar = await readICalendar(icalData, userId);
        res.status(200).json(calendar);
    }
    catch (error) {
        res.status(400).json({
            error: "Error happened while importing calendar",
            details: error.message,
        });
    }
};
export { createEvent, deleteAllEvents, deleteEventById, exportEvents, getAllEvents, getEventById, importEvents, updateEvent };
//# sourceMappingURL=eventControllers.js.map