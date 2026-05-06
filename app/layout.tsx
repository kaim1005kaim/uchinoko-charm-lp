import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'うちのこチャーム — 世界にひとつのカスタムチャーム',
  description:
    '小さな特徴も愛くるしい表情も。あなたの「うちのこ」をかたちにする、世界にひとつのカスタム 3D プリントチャーム。',
  openGraph: {
    title: 'うちのこチャーム',
    description:
      '小さな特徴も愛くるしい表情も。あなたの「うちのこ」をかたちにする、世界にひとつのカスタム 3D プリントチャーム。',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2854c5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
