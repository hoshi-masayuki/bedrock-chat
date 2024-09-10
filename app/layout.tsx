import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className='max-w-[768px] mx-auto'>
      <body>{children}</body>
    </html>
  )
}