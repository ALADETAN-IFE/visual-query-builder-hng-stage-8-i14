import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QueryCraft — Visual Query Builder",
  description:
    "Build complex database queries visually with an intuitive drag-and-drop interface. Supports SQL, MongoDB, and GraphQL output formats.",
  keywords: [
    "query builder",
    "visual query",
    "SQL builder",
    "MongoDB query",
    "GraphQL filter",
    "database query",
  ],
  authors: [{ name: "QueryCraft" }],
  openGraph: {
    title: "QueryCraft — Visual Query Builder",
    description:
      "Build complex database queries visually with an intuitive drag-and-drop interface.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${sora.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            var t = localStorage.getItem('querycraft-theme');
            if (t) document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `,
      }}
    />
  </head>
      <body
        className="min-h-screen flex flex-col antialiased"
      >
        {children}
      </body>
    </html>
  );
}
