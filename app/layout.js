import './globals.css';

export const metadata = {
  title: 'FORGE - Execution Intelligence',
  description: 'Tasks are symptoms; execution systems solve the real problem.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
