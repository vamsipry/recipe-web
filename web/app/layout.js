import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <nav style={{display:'flex', gap:12, padding:12, borderBottom:'1px solid #ddd'}}>
            <Link href="/">Home</Link>
            <Link href="/recipes">Recipes</Link>
            <Link href="/grocery">Grocery</Link>
            <Link href="/plan">Plan</Link>
            <Link href="/scan">Scan OCR</Link>
            <a href="/api/auth/signin">Sign in</a>
            <a href="/api/auth/signout">Sign out</a>
          </nav>
          <main style={{padding:16}}>{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
