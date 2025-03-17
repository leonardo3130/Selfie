import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { RRule } from 'rrule';
import { EventCard } from "../components/EventCard";
import { useTimeMachineContext } from "../hooks/useTimeMachineContext";
import { Event } from "../utils/types";

export const EventsPreview: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const [window, setWindow] = useState<number>(0);

    const { offset } = useTimeMachineContext();
    const getEvents = async () => {
        try {
            setLoading(true);
            const date: string = DateTime.now().plus(offset).toISODate();
            const res = await fetch(`/api/events?date=${date}&week=${window ? 'true' : 'false'}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    credentials: "include",
                }
            });

            if (res.ok) {
                const evts: Event[] = await res.json();
                evts.forEach((e: Event) => {
                    e.date = new Date(e.date);
                    e.endDate = new Date(e.endDate as Date);
                });

                setLoading(false);
                setEvents(evts);
            }
        } catch (error: any) {
            setLoading(false);
            console.log(error);
        }
    }

    const occurrencesToCards = () => {
        let cards: any[] = [];
        for (const event of events) {
            if (event.isRecurring) {
                const rrule = RRule.fromString(event.recurrenceRule as string);
                const occurrences: Date[] = rrule.between(
                    DateTime.now().plus(offset).startOf(window ? "week" : "day").toJSDate(),
                    DateTime.now().plus(offset).endOf(window ? "week" : "day").toJSDate(),
                    true
                );

                for (const occurence of occurrences) {
                    cards.push(
                        <EventCard
                            key={event._id + event.date.toString()} // Ensure to use a unique key, assuming `e.id` exists.
                            title={event.title}
                            timezone={event.timezone}
                            date={occurence}
                            endDate={DateTime.fromJSDate(occurence).plus(event.duration as number).toJSDate()}
                        />
                    )
                }
            } else {
                cards.push(
                    <EventCard
                        key={event._id} // Ensure to use a unique key, assuming `e.id` exists.
                        title={event.title}
                        timezone={event.timezone}
                        date={event.date}
                        endDate={event.endDate as Date}
                    />
                )
            }
        }
        return cards;
    }

    useEffect(() => {
        getEvents();
    }, [offset, window]);


    return (
        <div className="d-flex justify-content-center align-items-start pt-2 e">
            {/* Add your content here if needed */}
            <div className="h-100 container d-flex flex-column justify-content-start">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex justify-content-start align-items-center">
                        <h2>Events of </h2>
                        {
                            <select className="ms-1 form-select" aria-label="Select week or day" value={window} onChange={(e) => setWindow(parseInt(e.target.value))}>
                                <option value={0}>Day</option>
                                <option value={1}>Week</option>
                            </select>
                        }
                    </div>
                    <button className="btn btn-danger" onClick={() => navigate("/calendar/")}>Go to Calendar<i className="bi bi-box-arrow-up-right ms-2"></i></button>
                </div>
                <div id="eventsCards">
                    {
                        events.length > 0 ? occurrencesToCards() : <span>No Events !!</span>
                    }
                    {loading && <Spinner animation="border" variant="danger" />}
                </div>
            </div>
        </div>
    );
};
