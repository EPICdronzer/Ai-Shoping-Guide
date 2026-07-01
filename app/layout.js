import './globals.css';

export const metadata = {
  title: 'MindSuite AI — Unified Productivity Hub',
  description: 'An intelligent productivity workspace featuring ShopMind AI (smart shopping assistant) and RouteMind AI (route, fuel, and toll planner).',
  keywords: 'MindSuite AI, ShopMind AI, RouteMind AI, travel planner, shopping assistant, AI productivity utilities',
  openGraph: {
    title: 'MindSuite AI — Unified Productivity Hub',
    description: 'Explore smart toolsets designed to save you time. Compare online purchases, estimate travel logistics, or organize project notes with AI.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06040f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
