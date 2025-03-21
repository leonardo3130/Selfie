import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ActivityCard } from "../components/ActivityCard";
import { useActivitiesContext } from "../hooks/useActivitiesContext";
import { useTimeMachineContext } from "../hooks/useTimeMachineContext";
import { Activity } from "../utils/types";
import { EventModalForm } from "./EventModalForm";

export const ActivitiesPreview: React.FC<{ isPreview: boolean }> = ({ isPreview }: { isPreview: boolean }) => {
    const [dayActivities, setDayActivities] = useState<Activity[]>([]);
    const { activities } = useActivitiesContext();
    const [loading, setLoading] = useState<boolean>(isPreview);
    const navigate = useNavigate();

    const [window, setWindow] = useState<number>(0);

    const { offset } = useTimeMachineContext();
    const getActivitiesOfTheDay = async () => {
        try {
            setLoading(true);
            const date: string = DateTime.now().plus(offset).toISODate();
            const res = await fetch(`/api/activities?date=${date}&week=${window ? 'true' : 'false'}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    credentials: "include",
                }
            });

            if (res.ok) {
                const activities: Activity[] = await res.json();
                activities.forEach((e: Activity) => {
                    e.date = new Date(e.date);
                })

                setLoading(false);
                setDayActivities(activities);
            }
        } catch (error: any) {
            setLoading(false);
            console.log(error);
        }
    }

    const activitiesToCards = () => {
        if (dayActivities.length === 0 && isPreview) {
            return <span>No activities !!</span>
        } else if (isPreview) {
            return dayActivities.map((a: Activity) => (
                <ActivityCard
                    key={a._id} // Ensure to use a unique key, assuming `e.id` exists.
                    activity={a}
                    isPreview={isPreview}
                />
            ));
        }
        else if (!isPreview && activities.length > 0) {
            return activities.map((a: Activity) => (
                <ActivityCard
                    key={a._id} // Ensure to use a unique key, assuming `e.id` exists.
                    activity={a}
                    isPreview={isPreview}
                />
            ));
        }
        else {
            return <span>No activities !!</span>
        }
    }

    useEffect(() => {
        if (isPreview)
            getActivitiesOfTheDay();
    }, [offset, window]);

    return (
        <div className={"d-flex justify-content-center align-items-start pt-2 a" + (isPreview ? "" : " no-preview")} style={{ height: "100%" }}>
            {/* Add your content here if needed */}
            <div className="h-100 container d-flex flex-column justify-content-start overflow-y-scroll">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex justify-content-start align-items-center">
                        {isPreview ? <h3>Activities of </h3> : <h2>Your Activities</h2>}
                        {
                            isPreview && <select className="ms-1 form-select" aria-label="Select week or day" value={window} onChange={(e) => setWindow(parseInt(e.target.value))}>
                                <option value={0}>Day</option>
                                <option value={1}>Week</option>
                            </select>
                        }
                    </div>
                    {isPreview && <button className="btn btn-danger" onClick={() => navigate("/calendar/")}>Go to Calendar<i className="bi bi-box-arrow-up-right ms-2"></i></button>}
                    {!isPreview && <EventModalForm isActivity={true} />}
                </div>
                <div id="activitiesCards">
                    {activitiesToCards()}
                    {loading && <Spinner animation="border" variant="danger" />}
                </div>
            </div>
        </div>
    );
};
