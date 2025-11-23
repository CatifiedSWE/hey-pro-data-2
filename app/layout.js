import { Poppins } from 'next/font/google'
import './globals.css'
import NavbarWrapper from '@/components/layout/NavbarWrapper'

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'HeyProData',
  description: 'Professional networking for creative industries',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  )
}
