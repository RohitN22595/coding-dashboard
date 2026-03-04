import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// 1. IMPORT THE ANALYTICS COMPONENT
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Rohit — Developer & CP Enthusiast",
  description: "Portfolio of Rohit Siva Shankar — 2nd Year MnC @ IIT Guwahati. Full-Stack Developer, Competitive Programmer.",
  keywords: ["IIT Guwahati", "Competitive Programming", "Full Stack", "Next.js"],
};

function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('darkMode');if(t==='true')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col min-h-screen antialiased`}>
        <Navbar />
        <div className="pt-16 flex-1 flex flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        
        {/* 2. ADD THE COMPONENT HERE */}
        <Analytics />
      </body>
    </html>
  );
}