import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children?: ReactNode }, State> {
  public state: State = { error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
    // A stale deployment can 404 a lazy chunk; a reload fetches the new build.
    if (/Failed to fetch dynamically imported module|Importing a module script failed/.test(error.message)) {
      window.location.reload();
    }
  }

  public render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-base p-6 text-center">
        <span className="label text-danger">Error</span>
        <h1 className="text-h1 font-medium">Something went wrong.</h1>
        <p className="max-w-md text-fg-2">An unexpected error stopped this page from rendering.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-[52px] rounded-full bg-accent px-6 font-medium text-fg-inverse hover:bg-accent-hover"
        >
          Reload page
        </button>
      </div>
    );
  }
}
