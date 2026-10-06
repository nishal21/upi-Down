"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorScreen } from "./error-screen";
import { detectNative } from "@/lib/native";

type Props = { children: ReactNode; resetKey?: string | number };
type State = { error: Error | null; tries: number };

/**
 * Catches first-paint crashes (common right after onboarding) and remounts
 * quietly. On native, one hard reload if remounts fail — never flash ERR.
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
      return;
    }

    if (detectNative()) {
      try {
        if (sessionStorage.getItem("upidown-hard-reload") !== "1") {
          sessionStorage.setItem("upidown-hard-reload", "1");
          window.location.replace(`${window.location.origin}/`);
          return;
        }
      } catch {
        /* fall through to ERR UI */
      }
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
      if (detectNative()) {
        return <div className="min-h-dvh bg-[#0f110e]" aria-busy aria-hidden />;
      }
      return (
        <div className="mx-auto max-w-6xl px-4">
          <ErrorScreen code="ERR" onRetry={() => this.setState({ error: null, tries: 0 })} />
        </div>
      );
    }
    if (this.state.error) {
      return <div className="min-h-dvh bg-[#0f110e]" aria-busy aria-hidden />;
    }
    return this.props.children;
  }
}
