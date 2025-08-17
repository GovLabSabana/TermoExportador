import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/hooks/useAuth";
import { getServerSession } from "@/lib/server-session";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TermoExportador",
  description: "Data collection and analysis platform",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased bg-gray-50`}
      >
        <AuthProvider initialSession={session}>
          <div className="h-fit">
            <Header />
          </div>
          <main className="flex-1 flex">{children}</main>
        </AuthProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
