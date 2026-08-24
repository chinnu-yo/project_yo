import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SprintReady - Developer Assessment & Placement Engine',
  description: 'Convert passive candidate profiles into an objective 360° Readiness Index and 48-Hour Sprint Plan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
