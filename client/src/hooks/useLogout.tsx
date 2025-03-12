import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "./useAuthContext";

const unsubscribeFromPush = () => {
    navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            const unsubscribed = await subscription.unsubscribe();
            if (unsubscribed) {
                console.log('Unsubscribed locally. Removing from server...');
                await fetch('api/users/unsubscribe', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                });
                console.log('Unsubscribed from server as well.');
            } else {
                console.error('Failed to unsubscribe.');
            }
        } else {
            console.log('No active subscription found.');
        }
    });
}

export const useLogout = () => {
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const logout = async () => {
        // post alla route logout del server

        unsubscribeFromPush();

        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        });

        navigate('/login?logout=true', { replace: true });
        dispatch({ type: "LOGOUT" });
    }

    return logout;
}
