import type { Metadata } from "next";

import { LanguageProvider } from "@/components/providers/language-provider";
import "./globals.css";

const adobeFontsKitId = process.env.ADOBE_FONTS_KIT_ID;

export const metadata: Metadata = {
  title: "My 5 Swings",
  description:
    "Faith Promise staff app for capturing, editing, viewing, and exporting weekly 5 Swings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {adobeFontsKitId ? (
          <link rel="stylesheet" href={`https://use.typekit.net/${adobeFontsKitId}.css`} />
        ) : null}
      </head>
      <body className="bg-fp-cream text-fp-slate antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
