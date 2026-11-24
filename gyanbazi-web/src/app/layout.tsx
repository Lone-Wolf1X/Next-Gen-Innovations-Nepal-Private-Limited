import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GyanBazi | Exam Preparation",
  description: "Nepal's Premier Exam Preparation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
