import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root")!;

// Always a fresh client-side mount. The build's prerender step
// (scripts/prerender.mjs) writes crawler-visible static HTML into this
// element for search engines and other non-JS clients; it isn't meant to
// be hydrated - React replaces it here as soon as the bundle loads.
createRoot(rootElement).render(<App />);
