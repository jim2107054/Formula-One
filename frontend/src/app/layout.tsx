import type { Metadata } from "next";
import localFont from "next/font/local";

import { ReactQueryProvider } from "@/lib/react-query";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/inter.ttf",
});

export const metadata: Metadata = {
  title: "EduAI Learning Platform",
  description: "AI-powered supplementary learning platform for university courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} antialiased`}>
        <link
          rel="shortcut icon"
          href="/images/icons/brain.svg"
          type="image/x-icon"
        />
        <ReactQueryProvider>
          {children}
          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
