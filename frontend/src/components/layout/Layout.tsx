import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout({
  children,
  hideFooterSubscribe = false,
}: {
  children: ReactNode;
  /** For pages that already have their own subscribe block. */
  hideFooterSubscribe?: boolean;
}) {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-fg-inverse"
      >
        Skip to content
      </a>
      <Header />
      {/* At least a screen tall, so the footer doesn't paint high and then jump when content loads. */}
      <main id="main-content" className="min-h-[100svh] flex-1 pt-[72px] lg:pt-[88px]">
        {children}
      </main>
      <Footer hideSubscribe={hideFooterSubscribe} />
    </div>
  );
}
