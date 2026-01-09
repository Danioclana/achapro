import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import ChatWidget from "@/components/chat/chat-widget";
import { Toaster } from "sonner";
import { PageTransitionProvider } from "@/context/page-transition-context";
import GlobalLoadingIndicator from "@/components/global-loading-indicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AchaPro - Marketplace de Serviços",
  description: "Conectando clientes a prestadores de serviços de qualidade.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={inter.className}>
          <PageTransitionProvider>
            <GlobalLoadingIndicator />
            <Navbar />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
            <ChatWidget />
            <Toaster richColors position="top-center" />
          </PageTransitionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}