import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "人生故事线",
  description: "AI 倾听者与人生记忆提取",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}