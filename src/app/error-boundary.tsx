import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("The application UI failed.", error, info);
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-semibold">Nib Color Picker needs to restart</h1>
          <p className="max-w-sm text-sm text-zinc-400">
            Your colors remain stored locally. Close and reopen the application to continue.
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}
