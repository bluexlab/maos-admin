import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: "MAOS Admin",
  description: "Multiple Actors Operating System Admin",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body>
        <NextTopLoader color="#2292dd" />
        <TRPCReactProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={100}>
            {children}
          </TooltipProvider>
        </TRPCReactProvider>
        <Toaster theme="light" position="top-center" richColors={true} closeButton />
      </body>
    </html>
  );
}
