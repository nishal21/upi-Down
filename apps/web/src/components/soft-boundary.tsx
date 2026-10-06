"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorScreen } from "./error-screen";

type Props = { children: ReactNode; resetKey?: string | number };
type State = { error: Error | null; tries: number };

/**
 * Catches first-paint crashes (common right after onboarding unmounts) and
 * remounts a couple of times before showing the ERR UI.
 */
export class SoftBoundary extends Component<Props, State> {
  state: State = { error: null, tries: 0 };
  timer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
    const tries = this.state.tries + 1;
    this.setState({ tries });
    if (tries <= 2) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.setState({ error: null });
      }, 60 * tries);
    }
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey) {
      if (this.timer) clearTimeout(this.timer);
      this.setState({ error: null, tries: 0 });
    }
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer);
  }

  render() {
    if (this.state.error && this.state.tries > 2) {
      return (
        <div className="mx-auto max-w-6xl px-4">
          <ErrorScreen code="ERR" onRetry={() => this.setState({ error: null, tries: 0 })} />
        </div>
      );
    }
    if (this.state.error) {
      return <div className="min-h-[50dvh] bg-background" aria-busy aria-hidden />;
    }
    return this.props.children;
  }
}
