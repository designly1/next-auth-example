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
