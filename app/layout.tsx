import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Livo Pro Loyalty',
  description: 'Loyalty Program for Livo Healthcare Professionals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Lexend, sans-serif', background: '#F2F7F9' }}>
        {children}
      </body>
    </html>
  )
}
