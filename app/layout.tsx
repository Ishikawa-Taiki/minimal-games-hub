import EmotionRegistry from './registry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}
