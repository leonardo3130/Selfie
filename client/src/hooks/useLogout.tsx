import { useNavigate } from 'react-router-dom';
import { useActivitiesContext } from "./useActivitiesContext";
import { useAuthContext } from "./useAuthContext";
import { useEventsContext } from './useEventsContext';
import { useNotesContext } from './useNotesContext';

export const useLogout = () => {
    const { dispatch } = useAuthContext();
    const { dispatch: activitiesDispatch } = useActivitiesContext();
    const { dispatch: eventsDispatch } = useEventsContext();
    const { dispatch: notesDispatch } = useNotesContext();
    const navigate = useNavigate();

    const logout = async () => {

        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        });

        navigate('/login?logout=true', { replace: true });
        activitiesDispatch({ type: "DELETE_ALL" });
        eventsDispatch({ type: "DELETE_ALL" });
        notesDispatch({ type: "DELETE_ALL" });
        dispatch({ type: "LOGOUT" });
    }

    return logout;
}
