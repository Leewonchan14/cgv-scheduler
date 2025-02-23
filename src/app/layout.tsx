import { DatePickerProvider } from '@/share/libs/date-picker/date-picker-provider';
import QueryProviders from '@/share/libs/tasntack-query/query-providers';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: '주안CGV 스케쥴러',
  description: '주안CGV 스케쥴 관리 하기',
  icons: [
    {
      url: '/favicon.png',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DatePickerProvider>
          <QueryProviders>{children}</QueryProviders>
        </DatePickerProvider>
      </body>
    </html>
  );
}
