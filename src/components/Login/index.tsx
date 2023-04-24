import React, { useEffect, useState } from 'react'
import Login from './Login'

/**
 * This component is used to wrap the login page.
 * It delays showing the login page
 * to give time for auth.user to load
 * 
 * @author Jay Simons
*/
export default function LoginWrapper() {
    const [showLogin, setShowLogin] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            setShowLogin(true);
        }, 1000);
    }, []);

    if (showLogin) {
        return (
            <Login />
        )
    } else {
        return (
            <div className="flex h-screen">
                <div className="m-auto text-2xl fade-text">Checking Login...</div>
            </div>
        )
    }
}
