import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POPUP.NYC — Control Room",
  description: "Admin operations for POPUP.NYC generative concepts and community signals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
