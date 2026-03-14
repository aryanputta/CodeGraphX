import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CodeGraphX UI Refresh',
  description: 'Integrated modern components from the minimalist sidebar concept.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
