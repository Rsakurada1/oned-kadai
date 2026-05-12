import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub リポジトリ検索",
  description: "GitHub の公開リポジトリを検索する Web アプリ",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main-content">
          メインコンテンツへ移動
        </a>
        <main className="app-shell" id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}

