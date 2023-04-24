import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import NextNProgress from "nextjs-progressbar";
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <main className={inter.className}>
        <NextNProgress />
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  )
}
