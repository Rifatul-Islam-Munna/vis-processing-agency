import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), title:{default:"Vis Processing Agency",template:"%s | Vis Processing Agency"}, description:"Immigration and visa consulting" };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
