import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'YatraSetu | Discover India. Connect Locally. Grow Tourism.',
  description:
    'An AI-powered, India-wide tourism ecosystem connecting travelers, verified local hosts, and government tourism authorities.',
  keywords: [
    'India Tourism',
    'YatraSetu',
    'Local Guides India',
    'AI Trip Planner',
    'Travel Buddies India',
    'Responsible Tourism',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#FFFBF5] text-[#171717] antialiased selection:bg-[#F59E0B]/30 min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
