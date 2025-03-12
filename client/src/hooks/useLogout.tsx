import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const logout = async () => {

        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        });

        navigate('/login?logout=true', { replace: true });
        dispatch({ type: "LOGOUT" });
    }

    return logout;
}
