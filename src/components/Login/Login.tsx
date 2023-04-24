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
