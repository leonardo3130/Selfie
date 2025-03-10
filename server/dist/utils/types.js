import { ICalEventRepeatingFreq, ICalWeekday } from "ical-generator";
import pkg from 'rrule';
const { Frequency } = pkg;
export const frequencyToICalEventRepeatingFreq = {
    [Frequency.YEARLY]: ICalEventRepeatingFreq.YEARLY,
    [Frequency.MONTHLY]: ICalEventRepeatingFreq.MONTHLY,
    [Frequency.WEEKLY]: ICalEventRepeatingFreq.WEEKLY,
    [Frequency.DAILY]: ICalEventRepeatingFreq.DAILY,
    [Frequency.HOURLY]: ICalEventRepeatingFreq.HOURLY,
    [Frequency.MINUTELY]: ICalEventRepeatingFreq.MINUTELY,
    [Frequency.SECONDLY]: ICalEventRepeatingFreq.SECONDLY,
};
// Map ICalEventRepeatingFreq enum to Frequency enum
export const iCalEventRepeatingFreqToFrequency = {
    [ICalEventRepeatingFreq.SECONDLY]: Frequency.SECONDLY,
    [ICalEventRepeatingFreq.MINUTELY]: Frequency.MINUTELY,
    [ICalEventRepeatingFreq.HOURLY]: Frequency.HOURLY,
    [ICalEventRepeatingFreq.DAILY]: Frequency.DAILY,
    [ICalEventRepeatingFreq.WEEKLY]: Frequency.WEEKLY,
    [ICalEventRepeatingFreq.MONTHLY]: Frequency.MONTHLY,
    [ICalEventRepeatingFreq.YEARLY]: Frequency.YEARLY,
};
export const rRuleWeekdayIntToICalWeekday = {
    0: ICalWeekday.SU, // Sunday
    1: ICalWeekday.MO, // Monday
    2: ICalWeekday.TU, // Tuesday
    3: ICalWeekday.WE, // Wednesday
    4: ICalWeekday.TH, // Thursday
    5: ICalWeekday.FR, // Friday
    6: ICalWeekday.SA, // Saturday
};
//# sourceMappingURL=types.js.map