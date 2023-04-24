There are several identity service providers out there that take the complexity and security considerations off the plate of the developer. There are also authentication libraries, such as *next-auth*, for Next.js. But sometimes you want to implement very basic authentication for a simple web app where no sensitive user data is involved.

In this tutorial, we'll walk you through the process of creating a basic authentication provider in Next.js. Whether you're a seasoned developer or just starting with Next.js, you'll find this tutorial helpful in building a basic authentication provider. So let's get started!

---

## Anatomy of an Auth Provider

Our authentication flow will consist of two parts:

1. A React context provider and `useAuth` hook
2. A back-end API that authenticates and serves user data

Here's how our authentication flow will operate:

1. User tries to access a protected page
2. `useAuth` checks if there is a login cookie, if not the login page is served
3. User enters login and password
4. Back-end API receives login data and looks up user in DB
5. A unique token is generated and returned to client along with user data
6. `useAuth` sets the current user state and sets a cookie containing login token
7. User data for subsequent refreshes come from login cookie data
8. Login cookie data is validated against fresh API data in background

![Authentication Flow](https://cdn.designly.biz/blog_files/creating-a-basic-authentication-provider-in-next-js/image1.jpg)

---

## Setting Up Our Project

The demo site and repo for this tutorial can be found at the bottom of the page. The demo was created with `npx create-next-app@latest` with TypeScript and Tailwind CSS.

Dependencies:
| Package Name | Purpose |
| --------------- | -------- |
| cookie | Package for parsing cookies from request data |
| cookies-next | Package for managing cookies in Next.js |
| bcryptjs | Package for hashing and comparing passwords |

To install types:
`npm i -D @types/bcryptjs @types/cookie`

---

## Creating our Context Provider

We'll use React's `useContext` hook to create our authentication context:

```ts
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
```


Creating the `authContext` for the provider and defining `AuthProvider` and `useAuth` functions:

This section defines the `authContext` and two functions:

- `AuthProvider`: A component that wraps the application and provides the `authContext` for its child components.
- `useAuth`: A hook that is used by child components to get access to the `auth` object.

Defining the `useAuthProvider` hook

This section defines the `useAuthProvider` hook, which is the core functionality of this code. It manages the user state, handles authentication requests to the server, and stores user data in a cookie. The functions inside `useAuthProvider` are:

- `login`: Sends a POST request to the server with the user's credentials and sets the user state and cookie data if successful.
- `logout`: Sends a request to the server to logout the user and removes the user state and cookie data.
- `setLoginCookie`: Stores login token and user data in a cookie.
- `deleteLoginCookie`: Deletes the login token and user data from the cookie.
- `loadUser`: Retrieves the user data from the server and sets the user state and cookie data if the request is successful.
- `reload`: Reloads a fresh copy of user data from server.
- `sendPasswordResetEmail`: Sends a password reset email (currently not implemented).

Exporting `AuthProvider` and `useAuth` functions:

This section exports the `AuthProvider` and `useAuth` functions so that they can be used in other components.

---

## Implementing In Our App

First, we'll need to open up `_app.tsx` and wrap everything in our `AuthProvider` context:

```tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  )
}
```

Next, we'll need a way to handle protected and unprotected pages. The best way to accomplish this is to do it in the layout higher-order component:

```tsx
import React, { ReactNode } from 'react'
import Head from 'next/head'
import Footer from './Footer'
import LoginWrapper from '../Login'

import { useAuth } from '@/hooks/useAuth'

export default function Layout(props: {
    children: ReactNode,
    pageTitle?: string,
    requireAuth?: boolean
}) {
    const auth = useAuth();

    const {
        children,
        pageTitle,
        requireAuth = false
    } = props;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-600 to-slate-700 text-white">
            {
                requireAuth && !auth.user
                    ?
                    <LoginWrapper />
                    :
                    <>{children}</>
            }
            <Footer />
        </div>
    )
}
```

This component will conditionally render either `<LoginWrapper>` or `{children}` depending on whether or not we set the `requireAuth` flag.

And here's `<LoginWrapper>`:

```tsx
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
```

We use `useEffect` to wait one second before showing the login component. This is to give `useAuth` time to fetch user data from cookie or server.

Next is our login form component:

```tsx
import React, { useState } from 'react'
import Link from 'next/link'

import { useAuth } from '@/hooks/useAuth'

export default function Login() {
    const auth = useAuth();
    const [email, setEmail] = useState<string>('joeblow');
    const [password, setPassword] = useState<string>('TestPassword4$');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleResetPassword = () => {
        // TODO: Implement
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'email') {
            setEmail(e.target.value);
        } else if (e.target.name === 'password') {
            setPassword(e.target.value);
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        try {
            await auth.login({
                username: email,
                password
            });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="m-auto w-full md:w-[300px] flex flex-col gap-6">
            <h1 className="text-center text-2xl font-medium">Please Log In</h1>
            {error && <p className="text-center text-red-500">{error}</p>}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input
                    name="email"
                    className="border border-gray-300 p-2 rounded-md text-gray-800"
                    type="text"
                    placeholder="Username or Email"
                    onChange={handleInputChange}
                    defaultValue="joeblow"
                />
                <input
                    name="password"
                    className="border border-gray-300 p-2 rounded-md text-gray-800"
                    type="password"
                    placeholder="Password"
                    onChange={handleInputChange}
                    defaultValue="TestPassword4$"
                />
                <button
                    className={`btn-base ${loading ? 'bg-gray-500 opacity-50' : 'bg-blue-500 hover:bg-blue-600'}`}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? <span className="fade-text">Loading...</span> : 'Log In'}
                </button>
            </form>
            <p className="text-center">
                Don&apos;t have an account?{' '}
                <Link className="link" href="/login">Register</Link>
            </p>
            <p className="text-center">
                Forgot your password?{' '}
                <button
                    className="link"
                    onClick={handleResetPassword}
                >Reset</button>
            </p>
        </div>
    )
}
```

Pretty straight-forward. Our `handleSubmit` function simply calls `auth.login` with the supplied login id and password. Note that the login ID can be either the username or email address.

---

## Handling the Back End

We have three endpoints to define:

1. /api/auth/login - Responsible for authenticating username and password
2. /api/auth/login - Responsible for removing login token from user record
3. /api/auth/me - Responsible for serving fresh user data from server based on login cookie

Here's our login endpoint:

```ts
import fakeDb from "@/util/fakeDb";
import { compareSync } from "bcryptjs";
import sanitizeUser from "@/util/sanitizeUser";

// Use edge runtime to improve performance.
export const config = {
    runtime: 'edge'
}

export async function unauth() {
    return new Response('Unauthorized', { status: 401 });
}

export default async function handler(request: Request) {
    try {
        const data = await request.json();
        let user;
        // Fetch user from database
        try {
            user = await fakeDb(data.username);
        } catch (err) {
            return unauth();
        }
        // Check if user exists
        if (!user) return unauth();
        // Verify password
        if (!compareSync(data.password, user.password)) {
            return unauth();
        }
        // Generate token
        const token = user.tokens[0]; // Normally we would generate one

        // Return user and token
        return new Response(JSON.stringify({
            user: sanitizeUser(user),
            token
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        if (err instanceof Error) {
            return new Response(err.message, { status: 500 });
        } else {
            return new Response('Unknown error', { status: 500 });
        }

    }
}
```

In my example, I'm using the Edge runtime for super-fast speed, but you can use Node/Express if you prefer.

I created a `fakeDb` function that simulates a call to a database to fetch user data with a slight delay. You can find that code on the repo below.

Lastly, here is the code for our /api/auth/me endpoint:

```ts
import fakeDb from "@/util/fakeDb";
import sanitizeUser from "@/util/sanitizeUser";
import { parse } from "cookie";

// Use edge runtime to improve performance.
export const config = {
    runtime: 'edge'
}

export async function unauth() {
    return new Response('Unauthorized', { status: 401 });
}

export default async function handler(request: Request) {
    try {
        // Fetch login cookie
        const cookies = parse(request.headers.get('Cookie') || '');
        const cookie = cookies[process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY || ''];
        if (!cookie) return unauth();
        const cookieData = JSON.parse(cookie);

        // Check if cookie is valid
        if (!cookieData.token || !cookieData.token.token || !cookieData.token.expires) return unauth();
        if (new Date(cookieData.token.expires) < new Date()) return unauth();

        // Fetch user from database
        let user;
        try {
            user = await fakeDb(cookieData.token.token);
        } catch (err) {
            return unauth();
        }
        
        // Check if user exists
        if (!user) return unauth();

        // Return user and token
        return new Response(JSON.stringify(sanitizeUser(user)), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        if (err instanceof Error) {
            return new Response(err.message, { status: 500 });
        } else {
            return new Response('Unknown error', { status: 500 });
        }

    }
}
```

Pretty similar to the login endpoint, except that we identify the user from the stored token in our login cookie rather than supplied login id and password. We also want to be sure to check that the token has not expired. Typically you would have a clean-up CRON job that runs on the DB server that checks for expired tokens, but we don't want to rely solely on that.

I left the code for the logout endpoint because it simply returns a blank 200 response. In a production environment, you would typically include code to remove the login token from the user record in the DB. In this demo, the client-side cookie is simply deleted upon logging out.

---

## Links

1. [GitHub Repo](https://github.com/designly1/next-auth-example)
2. [Demo Page](https://next-auth-example-yuc.pages.dev/)

---

Thank you for taking the time to read my article and I hope you found it useful (or at the very least, mildly entertaining). For more great information about web dev, systems administration and cloud computing, please read the [Designly Blog](https://designly.biz/blog). Also, please leave your comments! I love to hear thoughts from my readers.

I use [Hostinger](https://hostinger.com?REFERRALCODE=1J11864) to host my clients' websites. You can get a business account that can host 100 websites at a price of $3.99/mo, which you can lock in for up to 48 months! It's the best deal in town. Services include PHP hosting (with extensions), MySQL, Wordpress and Email services.

Looking for a web developer? I'm available for hire! To inquire, please fill out a [contact form](https://designly.biz/contact).