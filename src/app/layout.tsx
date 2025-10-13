"use client";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { AuthSessionProvider } from "@/components/auth/session-provider";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>I-Collection</title>
        <meta name="description" content="I-collection web app" />
      </head>
      <body className="font-sans antialiased">
        <AuthSessionProvider>
            {children}
            <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
