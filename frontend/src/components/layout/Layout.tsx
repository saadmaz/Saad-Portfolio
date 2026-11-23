import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** `screenFooter` makes the footer fill the viewport from tablet up (homepage). */
export function Layout({ children, screenFooter = false }: { children: ReactNode; screenFooter?: boolean }) {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-fg-inverse"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1 pt-[72px] lg:pt-[88px]">
        {children}
      </main>
      <Footer screen={screenFooter} />
    </div>
  );
}
