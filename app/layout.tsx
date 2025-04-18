import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ResuMatch: Professionalism Matching',
  description: 'ResuMatch is a fun project that playfully matches your resume and skills with your crush’s to see how compatible you’d be in the corporate world.',
  icons: {
    icon: '/logo.ico', 
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children} <Analytics /> <SpeedInsights/></body>
    </html>
  );
}
