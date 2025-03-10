import mongoose, { Schema } from "mongoose";
import { attendeeSchema, notificationSchema } from "./eventModel.js";
/*mongoose schema*/
const activitySchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    isCompleted: {
        type: Boolean,
        required: true,
    },
    attendees: {
        type: [attendeeSchema],
        required: false,
    },
    notifications: {
        type: notificationSchema,
        required: false,
    },
    _id_user: {
        type: String,
        required: true,
    },
    timezone: {
        type: String,
        required: true
    }
});
const ActivityModel = mongoose.model("activity", activitySchema);
export { ActivityModel };
//# sourceMappingURL=activityModel.js.map