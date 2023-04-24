/**
 * Basic Authentication Provider
 * 
 * @author Jay Simons
 * 
 */

import React, { useState, useEffect, useContext, createContext, ReactNode } from "react";
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { useRouter } from "next/router";

import { User, LoginToken, LoginCookie, LoginProps, AuthContextType } from '@/interfaces';

const COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY || '';

const authContext = createContext<AuthContextType>({
    user: null,
    login: async () => false,
    logout: async () => { },
    reload: () => { },
    sendPasswordResetEmail: () => { },
    setLoginCookie: () => { },
});

// Auth provider context
export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthProvider();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useAuthProvider() {
    const [user, setUser] = useState<User | null>(null);
    const cookieData = getCookie(COOKIE_KEY);
    const router = useRouter();

    const login = async (props: LoginProps) => {
        const result = await fetch("/api/auth/login", {
            method: 'POST',
            body: JSON.stringify(props),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (result.ok) {
            const data = await result.json();
            setUser(data.user);
            setLoginCookie(data);
            return true;
        } else {
            const error = await result.text();
            const errMess = result.status === 401 ? "Invalid username or password" : 'Login failed';
            console.error(error);
            throw new Error(errMess);
        }
    };

    // Tell the API we're loggin out and delete out login cookie
    const logout = async () => {
        const result = await fetch('/api/auth/logout');
        if (!result.ok) throw new Error("Log out failed");
        deleteLoginCookie();
        setUser(null);
        return;
    };

    // Store login token / user data in cookie
    const setLoginCookie = (data: LoginCookie) => {
        const expires = new Date(data.token.expires);
        setCookie(COOKIE_KEY, data, { path: '/', expires: expires });
    }

    // Delete login cookie
    const deleteLoginCookie = () => {
        deleteCookie(COOKIE_KEY);
    }

    // Pull user data from API
    const loadUser = async () => {
        console.log("Pulling user data...");
        async function fetchUser(cookieParsed: LoginCookie) {
            try {
                const result = await fetch("/api/auth/me");
                if (result.ok) {
                    const user = await result.json();
                    console.log("Done fetching user!");
                    setUser(user);
                    cookieParsed.user = user;
                    setLoginCookie(cookieParsed);
                } else {
                    setUser(null);
                    deleteLoginCookie();
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (typeof cookieData === 'string') {
            const cookieParsed = JSON.parse(cookieData);
            setUser(cookieParsed.user);
            fetchUser(cookieParsed);
        } else {
            setUser(null);
        }
    }

    // Reload user data
    const reload = () => {
        setTimeout(() => {
            loadUser();
        }, 200);
    }

    // Send password reset email
    const sendPasswordResetEmail = (email: string) => {
        /* TODO */
    };

    // Subscribe to user on mount
    useEffect(() => {
        loadUser();
    }, []); //eslint-disable-line

    // Return the user object and auth methods
    return {
        user,
        login,
        logout,
        reload,
        sendPasswordResetEmail,
        setLoginCookie,
    };
}