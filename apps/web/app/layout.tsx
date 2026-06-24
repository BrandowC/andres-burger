import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/features/cart/cart.store";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: {
    default: "Andrés Burger",
    template: "%s | Andrés Burger",
  },
  description:
    "Menú digital, pedidos por WhatsApp y panel administrativo de Andrés Burger.",
  applicationName: "Andrés Burger",
  manifest: "/manifest.json",
  keywords: [
    "Andrés Burger",
    "hamburguesas",
    "perros calientes",
    "comidas rápidas",
    "menú digital",
    "pedidos",
  ],
  authors: [
    {
      name: "Andrés Burger",
    },
  ],
  creator: "Andrés Burger",
  publisher: "Andrés Burger",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    title: "Andrés Burger",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/icon-152.png",
        sizes: "152x152",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#061a35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO">
      <body>
        <CartProvider>
          <PWARegister />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
