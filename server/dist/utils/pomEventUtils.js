import { DateTime } from "luxon";
import { EventModel } from "../models/eventModel.js";
/*function to change the date of an incomplete pomodoro*/
export async function updatePastPomodoro(user, mail, dateOffset) {
    await EventModel.updateMany({
        $or: [
            { _id_user: user },
            {
                attendees: {
                    $elemMatch: {
                        email: mail,
                        responded: true,
                        accepted: true,
                    },
                },
            },
        ],
        isPomodoro: true,
        "pomodoroSetting.isComplete": false,
        isRecurring: false,
        date: { $lte: DateTime.now().plus(dateOffset).startOf("day").toJSDate() },
    }, [
        {
            $set: {
                date: {
                    $dateAdd: {
                        startDate: "$date",
                        unit: "day",
                        amount: {
                            $dateDiff: {
                                startDate: "$date",
                                endDate: DateTime.now().plus(dateOffset).toJSDate(),
                                unit: "day",
                            },
                        },
                    },
                },
            },
        },
        {
            $set: {
                endDate: {
                    $dateAdd: {
                        startDate: "$endDate",
                        unit: "day",
                        amount: {
                            $dateDiff: {
                                startDate: "$endDate",
                                endDate: DateTime.now().plus(dateOffset).toJSDate(),
                                unit: "day",
                            },
                        },
                    },
                },
            },
        },
    ]);
}
//# sourceMappingURL=pomEventUtils.js.map