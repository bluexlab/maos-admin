import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "MAOS Admin",
  description: "Multiple Agents Operating System Admin",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body>
        <NextTopLoader color="#2292dd" />
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster theme="light" position="top-center" richColors={true} />
      </body>
    </html>
  );
}
