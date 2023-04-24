import React, { useEffect } from 'react'
import Layout from '@/components/Layout'
import Login from '@/components/Login/Login'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.user) {
      router.push('/');
    }
  }, [auth.user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout pageTitle="Log In">
      <Login />
    </Layout>
  )
}
