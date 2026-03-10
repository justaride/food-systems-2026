"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[SectionErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-red-700 mb-1">
            {this.props.fallbackTitle ?? "This section failed to load"}
          </p>
          <p className="text-xs text-red-500">
            {this.state.error?.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
