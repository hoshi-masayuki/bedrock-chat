import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className='max-w-[768px] mx-auto'>
      <body className="mt-8">{children}</body>
    </html>
  )
}