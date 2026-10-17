import './globals.css';

export const metadata = {
  title: 'AYAX GLOBAL RECRUITMENT',
  description: 'Cross-Border Workforce Pipelines',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}