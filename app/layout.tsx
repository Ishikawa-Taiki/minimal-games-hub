import AppLayout from './components/AppLayout';
import React from 'react';

const bodyStyle: React.CSSProperties = {
  font: '14px "Century Gothic", Futura, sans-serif',
  margin: '20px',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Minimal Games Hub</title>
        <meta name="description" content="A simple hub for minimal browser games." />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.1.0/github-markdown.css" />
        <style>{`
          ol, ul {
            padding-left: 30px;
          }
          .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
          }
        `}</style>
      </head>
      <body style={bodyStyle}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}