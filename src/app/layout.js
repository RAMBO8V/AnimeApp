import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Anime Catalog",
  description: "Your personal anime collection",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionWrapper>
          <Navbar />
          <main className="min-h-screen pb-10">
            {children}
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}
