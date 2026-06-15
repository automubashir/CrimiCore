import { ibmPlexSans } from "@/fonts";
import "./globals.css";



export const metadata = {
  title: "CrimePanel — Crime Intelligence System",
  description: "Real-time intelligence from multiple sources with actionable insights and advanced analytics to combat organized crime worldwide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
