"use client";

import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
