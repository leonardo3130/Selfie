import { DateTime } from "luxon";
import pkg from "rrule";
import webpush from "web-push";
import { ActivityModel } from "../models/activityModel.js";
import { EventModel } from "../models/eventModel.js";
import { UserModel } from "../models/userModel.js";
import { sendEmail } from "../utils/emailUtils.js";
const { RRule } = pkg;
const MILLIS_IN_DAY = 1000 * 60 * 60 * 24;
/*send notification NO email*/
function sendNotification(sub, title, url, notifica_desktop, priority /*useless as of now*/, isActivity) {
    console.log(`Sending notification: ${title}`);
    if (notifica_desktop)
        webpush
            .sendNotification(sub, JSON.stringify({
            title,
            body: (!isActivity ? "🔔 Event Reminder!" : "🔔 Activity Reminder!") +
                "\nDon't forget! 📅 " +
                title +
                " is happening soon. See you there!",
            url,
        }), {
            TTL: 86400, // 1 day in seconds
        })
            .then(() => console.log(`Notification sent: ${title}`))
            .catch((error) => console.error(`Error sending notification: ${error}`));
}
/*monitoring and possible sending of notifications*/
async function checkAndSendNotifications() {
    console.log("Checking notifications");
    /*users that can receive notifications*/
    const users = await UserModel.find({
        $or: [
            { notifications: { $exists: true } },
            { "flags.notifica_desktop": true },
            { "flags.notifica_email": true },
        ],
    });
    //ora
    const now = DateTime.now().toMillis();
    for (const user of users) {
        const timeMachineDate = now + (user.dateOffset || 0);
        // const fiveDaysMs = MILLIS_IN_DAY * 5;
        try {
            const start = DateTime.fromMillis(timeMachineDate)
                .toUTC()
                .toJSDate();
            const end = DateTime.fromMillis(timeMachineDate + 5 * MILLIS_IN_DAY)
                .toUTC()
                .toJSDate();
            const events = await EventModel.find({
                $and: [
                    {
                        $or: [
                            { "notifications.notifica_desktop": true },
                            { "notifications.notifica_email": true },
                        ],
                    },
                    {
                        $or: [
                            { _id_user: user._id }, //l'user è proprietario
                            {
                                //l'user è partecipante
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
                ],
                $or: [
                    {
                        $and: [
                            { isRecurring: false },
                            { date: { $gte: start } },
                            { date: { $lte: end } },
                        ],
                    },
                    {
                        isRecurring: true,
                    },
                ],
            });
            const activities = await ActivityModel.find({
                $and: [
                    {
                        $or: [
                            { "notifications.notifica_desktop": true },
                            { "notifications.notifica_email": true },
                        ],
                    },
                    {
                        $or: [
                            { _id_user: user._id }, //l'user è proprietario
                            {
                                //l'user è partecipante
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
                    { date: { $gte: start } },
                    { date: { $lte: end } },
                ],
            });
            /*filterign recurring events and associating them with their occurrences*/
            const recurringEvents = events
                .filter((event) => {
                return event.isRecurring;
            })
                .map((event) => {
                const occurrences = RRule.fromString(event.recurrenceRule).between(start, end, true);
                return [event, occurrences];
            });
            /*filtering non recurring events*/
            const nonRecurringEvents = events.filter((event) => {
                if (!event.isRecurring) {
                    return true;
                }
                else {
                    return false;
                }
            });
            /*send notifications for both types of events*/
            calculateNonRecurringNotificationTimes(nonRecurringEvents, user);
            calculateRecurringNotificationTimes(recurringEvents, user);
            calculateActivitiesNotificationTimes(activities, user);
        }
        catch (error) {
            console.log(error);
        }
    }
}
/*notification calculation*/
function calculateNotificationTimes(eventDate, notifications, title, url) {
    const times = [];
    const { advance, advanceType, repetitions, frequency, frequencyType } = notifications;
    // Convert advance time to milliseconds
    let advanceMs = 0;
    if (advance) {
        switch (advanceType) {
            case "DAYS":
                advanceMs = (advance || 0) * MILLIS_IN_DAY;
                break;
            case "HOURS":
                advanceMs = (advance || 0) * 1000 * 60 * 60;
                break;
            case "MINUTES":
                advanceMs = (advance || 0) * 1000 * 60;
                break;
            default:
                break;
        }
    }
    const initialNotificationTime = eventDate - advanceMs;
    for (let i = 0; i < (repetitions || 1); i++) {
        let notificationTime = initialNotificationTime;
        switch (frequencyType) {
            case "MINUTELY":
                notificationTime += i * (frequency || 1) * 1000 * 60; // Add frequency in minutes
                break;
            case "HOURLY":
                notificationTime += i * (frequency || 1) * 1000 * 60 * 60; // Add frequency in hours
                break;
            case "DAILY":
                notificationTime += i * (frequency || 1) * MILLIS_IN_DAY; // Add frequency in days
                break;
            default:
                break;
        }
        times.push({
            title,
            url,
            notificationTime,
            priority: i + 1,
        });
    }
    return times;
}
function checkNotifications(eventDate, now, notifications, event, user, isActivity) {
    const notificationTimes = calculateNotificationTimes(eventDate, notifications, event.title, event.hasOwnProperty("url") ? event.url || "" : "");
    for (const { title, url, notificationTime, priority } of notificationTimes) {
        //primo controllo --> si attivano solo notifiche del giorno stesso
        console.log(now + (user.dateOffset || 0) - notificationTime);
        if (
        // (user.dateOffset !== 0 &&
        // new Date(notificationTime).getDate() ===
        //   new Date(now + (user.dateOffset || 0)).getDate()) && //per time machine solo notifiche dello stesso giorno
        notificationTime <= now + (user.dateOffset || 0) && //passata
            notificationTime > now + (user.dateOffset || 0) - 60000 //passata da massimo un minuto
        ) {
            user.pushSubscriptions.forEach((sub) => {
                sendNotification(sub, title, url, user.flags.notifica_desktop &&
                    (event.notifications?.notifica_desktop || false), priority, isActivity);
            });
            //sending email
            if (user.flags.notifica_email && event.notifications?.notifica_email) {
                console.log("Sending email notification");
                sendEmail(user.email, (!isActivity ? "🔔 Event Reminder!" : "🔔 Activity Reminder!") +
                    "\nDon't forget! 📅 " +
                    title +
                    " is happening soon. See you there!", (!isActivity ? "🔔 Event Reminder!" : "🔔 Activity Reminder!") +
                    "\nDon't forget! 📅 " +
                    title +
                    " is happening soon. See you there!", []);
            }
        }
        else {
            console.log(`Skipping notification: ${title}`);
        }
    }
}
function calculateNonRecurringNotificationTimes(events, user) {
    const now = DateTime.now().toMillis();
    for (const event of events) {
        const eventDate = event.date.getTime();
        const notifications = event.notifications;
        checkNotifications(eventDate, now, notifications, event, user, false);
    }
}
function calculateRecurringNotificationTimes(recurringEvents, user) {
    const now = DateTime.now().toMillis();
    for (const event of recurringEvents) {
        const notifications = event[0].notifications;
        for (const occurrence of event[1]) {
            checkNotifications(occurrence.getTime(), now, notifications, event[0], user, false);
        }
    }
}
function calculateActivitiesNotificationTimes(activities, user) {
    const now = DateTime.now().toMillis();
    for (const activity of activities) {
        if (activity.date) {
            checkNotifications(activity.date.getTime(), now, activity.notifications, activity, user, true);
        }
    }
}
/*Daemon execution*/
export function startDaemon() {
    setInterval(async () => {
        await checkAndSendNotifications();
    }, 60000);
}
//# sourceMappingURL=notificationDaemon.js.map