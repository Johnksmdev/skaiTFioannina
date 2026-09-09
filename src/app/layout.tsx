import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "S.K.A.I TRACK AND FIELD | Train together",
  description: "Μία ιδιωτική κοινότητα προπόνησης για αθλητές και προπονητές.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink text-slate-100 font-inter antialiased">
        {children}
        <footer className="site-footer">A Johnkosmas production. Copyright 2026-2027</footer>
      </body>
    </html>
  );
}