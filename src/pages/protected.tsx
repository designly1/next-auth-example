import React from 'react'
import Layout from '@/components/Layout'

import { useAuth } from '@/hooks/useAuth'

export default function ProtectedPage() {
    const auth = useAuth();

    return (
        <Layout
            pageTitle="Protected Page"
            requireAuth={true}
        >
            <div className="py-20 flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold text-center">Protected Page</h1>
                <p className="text-center">
                    If you can see this page, you are logged in! 😄
                </p>
                <pre className="bg-[#222] p-4 rounded-lg text-sm">User Data:<br />
                    {JSON.stringify(auth.user, null, 2)}
                </pre>
                <p className="text-center text-yellow-400">Go ahead, refresh the page. You&apos;ll still be logged in.</p>
                <button
                    className="btn-base bg-sky-600 hover:bg-sky-700"
                    onClick={() => auth.logout()}
                >
                    Log Out
                </button>
            </div>
        </Layout>
    )
}
