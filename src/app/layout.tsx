"use client";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";


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
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
