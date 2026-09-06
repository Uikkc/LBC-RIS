import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "LBC-RIS: ระบบสารสนเทศนักวิจัยและผลงานวิชาการ วิทยาลัยสงฆ์เลย",
  description: "ระบบศูนย์กลางข้อมูลงานวิจัย นักวิจัย ทุนวิจัย และรายงานประกันคุณภาพการศึกษา วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-[#f8f9ff] text-slate-900 antialiased selection:bg-rose-100 selection:text-brand-dark">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© 2567 วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (LBC-RIS v1.0 MVP)</p>
            <p className="text-slate-400">ระบบสารสนเทศขับเคลื่อนด้วย Next.js 14, Prisma ORM และ Google Gemini AI</p>
          </div>
        </footer>
      </body>
    </html>
  );
}