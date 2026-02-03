import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { MotionConfig } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HashPrediction",
  description: "Binary prediction markets on HashKey Chain",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen gradient-bg overflow-x-hidden">
        <Providers>
          <MotionConfig reducedMotion="user">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8 animate-fade-in-up">{children}</main>
            <Footer />
            <BottomNav />
          </MotionConfig>
          <ToastContainer
            position="bottom-right"
            theme="dark"
            autoClose={5000}
            toastStyle={{ background: "#26272b", border: "1px solid #3f3f46", color: "#f4f4f5" }}
          />
        </Providers>
      </body>
    </html>
  );
}
