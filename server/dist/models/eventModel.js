import mongoose, { Schema } from "mongoose";
const notificationSchema = new Schema({
    notifica_email: {
        type: Boolean,
        required: true,
    },
    notifica_desktop: {
        type: Boolean,
        required: true,
    },
    text: {
        type: String,
        // required: function (): boolean {
        //   return (
        //     false || this.notifica_desktop || this.notifica_email
        //   );
        // },
    },
    before: {
        type: Boolean,
        required: function () {
            return this.notifica_desktop || this.notifica_email;
        },
    },
    advance: {
        type: Number,
        required: function () {
            return this.notifica_desktop || this.notifica_email;
        },
    },
    advanceType: {
        type: String,
        enum: ["DAYS", "HOURS", "MINUTES"],
        required: function () {
            return this.notifica_desktop || this.notifica_email;
        },
    },
    repetitions: {
        type: Number,
        min: 1,
        required: function () {
            return this.notifica_desktop || this.notifica_email;
        },
    },
    frequency: {
        type: Number,
        required: function () {
            return this.notifica_desktop || this.notifica_email;
        },
    },
    frequencyType: {
        type: String,
        enum: ["MINUTELY", "HOURLY", "DAILY"],
        required: function () {
            return this.notifica_desktop || this.notifica_email;
        },
    },
});
const attendeeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    responded: {
        type: Boolean,
        required: true,
    },
    accepted: {
        type: Boolean,
        required: true,
    },
});
const pomodoroSchema = new Schema({
    studioTime: {
        type: Number,
        require: true,
    },
    riposoTime: {
        type: Number,
        require: true,
    },
    nCicli: {
        type: Number,
        require: true,
    },
    isComplete: {
        type: Boolean,
        require: true,
    },
});
// Definire lo schema di Mongoose
const eventSchema = new Schema({
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
    endDate: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: false,
    },
    timezone: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: false,
    },
    duration: {
        type: Number,
        required: true,
    },
    recurrenceRule: {
        type: String,
        required: function () {
            return this.isRecurring;
        },
    },
    attendees: {
        type: [attendeeSchema],
        required: false,
    },
    notifications: {
        type: notificationSchema,
        required: false,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    _id_user: {
        type: String,
        required: true,
    },
    isPomodoro: {
        type: Boolean,
        required: true,
    },
    isDoNotDisturb: {
        type: Boolean,
        required: true,
        validate: {
            validator: function (value) {
                return !(value && this.isPomodoro);
            }
        }
    },
    pomodoroSetting: {
        type: pomodoroSchema,
        required: function () {
            return this.isPomodoro;
        },
    },
});
const EventModel = mongoose.model("event", eventSchema);
const PomodoroModel = mongoose.model("pomodoro", pomodoroSchema);
export { attendeeSchema, EventModel, notificationSchema, PomodoroModel };
//# sourceMappingURL=eventModel.js.map