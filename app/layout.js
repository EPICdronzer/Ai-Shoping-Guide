import './globals.css';

export const metadata = {
  title: 'ShopMind AI — Your Smart Shopping Assistant',
  description: 'Describe what you want in plain language and get instant product comparisons, prices, and recommendations powered by AI.',
  keywords: 'AI shopping assistant, product search, price comparison, smart shopping bot',
  openGraph: {
    title: 'ShopMind AI — Your Smart Shopping Assistant',
    description: 'Stop digging through 10 tabs. Describe what you want and get instant AI-powered product comparisons.',
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
