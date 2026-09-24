import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "舞萌 Web | maimai Web Player",
  description: "街机音游《舞萌》(maimai DX) 的 Web 复刻版：圆形界面、8 键判定、TAP/HOLD/SLIDE/TOUCH/BREAK 五种音符、达成率与 DX Rating 系统。",
  keywords: ["maimai", "舞萌", "音游", "节奏游戏", "rhythm game"],
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1030",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased bg-[#060a1c] text-white overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
