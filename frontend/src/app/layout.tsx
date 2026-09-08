import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import AuthModal from '@/components/auth/AuthModal';
import { AuthProvider } from '@/context/AuthContext';
import { YatraSetuAIAssistant } from '@/components/ai/YatraSetuAIAssistant';
import SplashWrapper from '@/components/SplashWrapper';

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
          <SplashWrapper />
          <Header />
          <AuthModal />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <MobileNav />
          <YatraSetuAIAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
