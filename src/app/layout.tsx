import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as RadixToaster } from "@/components/ui/toaster";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

import { CategoryProvider } from "@/context/CategoriesContext";
import { CartProvider } from "@/context/CartContext";
import { KotekOrderProvider } from "@/context/KotekOrderContext";
import { AddressProvider } from "@/context/AddressContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "@/context/QueryProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kotek",
  description:
    "kotek informatique, vente de materiel informatique, draria alger, ouedkniss, facebook instagram tiktok, informatics, geekzone, el assli, chiinformatique, lahlou",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("min-h-screen bg-custom-gradient font-sans antialiased")}
      >

          <SessionProviderWrapper>
            <QueryProvider>
              <ProductsProvider>
                <CategoryProvider>
                  <CartProvider>
                    <KotekOrderProvider>
                      <AddressProvider>{children}</AddressProvider>
                    </KotekOrderProvider>
                  </CartProvider>
                  <SpeedInsights />
                  <SonnerToaster />
                  <RadixToaster />
                  <ReactQueryDevtools />
                </CategoryProvider>
              </ProductsProvider>
            </QueryProvider>
          </SessionProviderWrapper>

      </body>
    </html>
  );
}
