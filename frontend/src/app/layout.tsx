// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// ↓↓↓ next-themes を直接インポート ↓↓↓
import { ThemeProvider } from "next-themes";
// ↓↓↓ sonner の Toaster をインポート ↓↓↓
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // shadcn経由のsonnerを使う

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Text Editor",
  description: "Edit text files interactively with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* ↓↓↓ sonner の Toaster を配置 ↓↓↓ */}
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}