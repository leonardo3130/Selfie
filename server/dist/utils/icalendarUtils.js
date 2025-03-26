import { default as icalExport } from "ical-generator";
import { DateTime } from "luxon";
import { default as icalImport } from "node-ical";
import pkg from "rrule";
import { ActivityModel } from "../models/activityModel.js";
import { EventModel } from "../models/eventModel.js";
import { checkUser, sendActivityInvitationEmail, sendEventInvitationEmail, } from "./invitationUtils.js";
import { frequencyToICalEventRepeatingFreq, rRuleWeekdayIntToICalWeekday, } from "./types.js";
const { RRule } = pkg;
/* creation of ics file content, exporting activities and events in Selfie calendar */
function createICalendar(events, activities) {
    const calendar = icalExport({ name: "Selfie Calendar" });
    /* exporting events */
    events.forEach((event) => {
        let rrule = undefined;
        let repeating = undefined;
        /*rrule infos*/
        if (event.recurrenceRule && event.isRecurring) {
            rrule = RRule.fromString(event.recurrenceRule);
            repeating = {
                freq: frequencyToICalEventRepeatingFreq[rrule.options.freq],
                interval: rrule.options.interval,
                count: typeof rrule.options.count === "number"
                    ? rrule.options.count
                    : undefined,
                until: rrule.options.until ? rrule.options.until : undefined,
                byDay: Array.isArray(rrule.options.byweekday)
                    ? rrule.options.byweekday.map((d) => rRuleWeekdayIntToICalWeekday[d])
                    : rRuleWeekdayIntToICalWeekday[rrule.options.byweekday],
                byMonth: rrule.options.bymonth,
                byMonthDay: rrule.options.bymonthday.length
                    ? rrule.options.bymonthday
                    : undefined,
                bySetPos: rrule.options.bysetpos,
            };
        }
        const start = DateTime.fromJSDate(event.date).setZone("Etc/UTC", { keepLocalTime: true }).setZone(event.timezone);
        const icalEvent = {
            start: start.toJSDate(),
            end: start.plus(event.duration).toJSDate(),
            summary: event.title,
            description: event.description,
            location: event.location,
            url: event.url,
            attendees: event.attendees?.map((attendee) => ({
                name: attendee.name,
                email: attendee.email,
                rsvp: attendee.responded,
                partstat: attendee.accepted ? "ACCEPTED" : "DECLINED",
            })),
            timezone: event.timezone,
            repeating,
        };
        calendar.createEvent(icalEvent);
    });
    /*exporting activities as VEVENT with only start date, with a completed custom flag*/
    activities.forEach((activity) => {
        const start = DateTime.fromJSDate(activity.date).setZone("Etc/UTC", { keepLocalTime: true }).setZone(activity.timezone);
        calendar
            .createEvent({
            start: start.toJSDate(),
            summary: activity.title,
            description: activity.description,
            attendees: activity.attendees?.map((attendee) => ({
                name: attendee.name,
                email: attendee.email,
                rsvp: attendee.responded,
                partstat: attendee.accepted ? "ACCEPTED" : "DECLINED",
            })),
            timezone: activity.timezone,
        })
            .x([
            {
                key: "X-COMPLETED",
                value: activity.isCompleted ? "TRUE" : "FALSE",
            },
            {
                key: "X-DUE",
                value: activity.date.toISOString(),
            },
        ]);
    });
    /*converting content to string so it can be placed inside the .ics file*/
    return calendar.toString();
}
async function readICalendar(icalData, userId) {
    /*file parsing*/
    const events = icalImport.parseICS(icalData);
    let successCount = 0;
    let errorCount = 0;
    let createdEvents = [];
    let createdActivities = [];
    for (let key in events) {
        const event = events[key];
        if (event.type === "VEVENT") {
            try {
                /* attendees handling */
                const icsAttendees = Array.isArray(event.attendee)
                    ? event.attendee
                    : [event.attendee];
                const validAttendees = icsAttendees
                    .filter((attendee) => attendee)
                    .map((attendee) => ({
                    name: attendee.params?.CN || "",
                    email: attendee.val.slice(7), // remove the "mailto:" prefix
                    responded: attendee.params?.RSVP || false,
                    accepted: attendee.params?.PARTSTAT === "ACCEPTED" ? true : false,
                }));
                /* check if user exist inside database */
                let attendees = [];
                for (const attendee of validAttendees) {
                    let exist = await checkUser(attendee.name);
                    if (exist)
                        attendees.push(attendee);
                }
                if (event.DUE == undefined) {
                    /*DUE is undefined --> event*/
                    const start = DateTime.fromJSDate(event.start, {
                        zone: event.start.tz || "utc",
                    }).setZone("Etc/UTC");
                    const end = DateTime.fromJSDate(event.end, {
                        zone: event.end.tz || "utc",
                    }).setZone("Etc/UTC");
                    const createdEvent = await EventModel.create({
                        title: event.summary || "Event without title",
                        description: event.description || "",
                        date: start.toJSDate(),
                        endDate: end.toJSDate(),
                        location: event.location,
                        url: event.url?.val,
                        duration: event.end.getTime() - event.start.getTime(),
                        isRecurring: event.rrule && event.rrule.toString().length > 0 ? true : false,
                        timezone: event.start.tz ||
                            "",
                        _id_user: userId,
                        attendees,
                        recurrenceRule: event.rrule?.toString(),
                        isPomodoro: false,
                        isDoNotDisturb: false,
                    });
                    sendEventInvitationEmail(userId, createdEvent, createdEvent.attendees || []);
                    createdEvents.push(createdEvent);
                }
                else {
                    const start = DateTime.fromJSDate(event.start, {
                        zone: event.start.tz || "utc",
                    }).setZone("Etc/UTC");
                    /*DUE is defined --> activity*/
                    const createdActivity = await ActivityModel.create({
                        title: event.summary || "Activity without title",
                        description: event.description || "  ",
                        date: start.toJSDate(),
                        timezone: event.start?.tz ||
                            "Etc/UTC",
                        _id_user: userId,
                        attendees,
                        isCompleted: event.COMPLETED === "TRUE" ? true : false,
                    });
                    sendActivityInvitationEmail(userId, createdActivity, createdActivity.attendees || []);
                    createdActivities.push(createdActivity);
                }
                successCount++;
            }
            catch (err) {
                console.error(`Error while importing: ${event.summary}`, err);
                errorCount++;
            }
        }
    }
    return { events: createdEvents, activities: createdActivities };
}
export { createICalendar, readICalendar };
//# sourceMappingURL=icalendarUtils.js.map