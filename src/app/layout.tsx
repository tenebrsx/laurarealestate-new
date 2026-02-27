import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
export const metadata: Metadata = {
  title: 'Laura Alba | Bienes Raíces Exclusivos',
  description: 'Descubre propiedades premium con Laura Alba. Tu puerta de entrada a hogares exclusivos y al lujo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
