import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

export function Layout({
  children,
  hideFooterSubscribe = false,
  hideFooter = false,
}: {
  children: ReactNode;
  /** For pages that already have their own subscribe block. */
  hideFooterSubscribe?: boolean;
  /** For single-screen pages such as the 404. */
  hideFooter?: boolean;
}) {
  // Footer-less pages are exactly one visible screen (dvh tracks mobile browser bars), never scrollable.
  return (
    <div id="top" className={cn("flex flex-col", hideFooter ? "h-[100dvh] overflow-hidden" : "min-h-screen")}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-fg-inverse"
      >
        Skip to content
      </a>
      <Header />
      {/* At least a screen tall, so the footer doesn't paint high and then jump when content loads. */}
      <main
        id="main-content"
        className={cn("flex-1 pt-[72px] lg:pt-[88px]", hideFooter ? "min-h-0" : "min-h-[100svh]")}
      >
        {children}
      </main>
      {!hideFooter && <Footer hideSubscribe={hideFooterSubscribe} />}
    </div>
  );
}
