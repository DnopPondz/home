import { Geist, Geist_Mono, Sarabun, Prompt } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import FooterPage from "./components/footer/footer-login";
import { AuthProvider } from "./context/AuthContext";
import Head from "next/head";

// โหลดฟอนต์
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  variable: "--font-sarabun",
});
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"], 
  variable: "--font-prompt",           
  display: "swap",
});
export const metadata = {
  title: "Home Service",
  description: "Service for you house",
  icons: {
    icon: '/icon.png', sizes: '32x32'
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={prompt.variable}>
      <body className="font-sans">
        <AuthProvider>
          <div className="font-prompt sticky top-0 z-50">
            <Navbar />
          </div>
          <div className="">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
