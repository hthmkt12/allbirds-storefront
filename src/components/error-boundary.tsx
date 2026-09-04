import { Component, type ErrorInfo, type ReactNode } from "react";
import { recordError } from "../utils/telemetry";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    recordError(error, { componentStack: errorInfo.componentStack });
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      if (typeof fallback === "function") {
        return error ? fallback({ error, reset: this.reset }) : null;
      }
      return fallback;
    }

    return (
      <section
        id="error-boundary-fallback"
        className="error-boundary-fallback"
        role="alert"
        style={{
          padding: "48px 24px",
          margin: "24px auto",
          maxWidth: "600px",
          textAlign: "center",
          backgroundColor: "#f9f8f6",
          borderRadius: "16px",
          border: "1px solid #e5e5e5",
          color: "#212a2f",
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "12px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#6b7280",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          Notice
        </span>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#212a2f",
          }}
        >
          Something went astray
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "#4a5568",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          We hit an unexpected snag loading this part of the experience. Our natural materials are
          safe, and you can try refreshing this section.
        </p>
        <button
          type="button"
          onClick={this.reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 28px",
            borderRadius: "9999px",
            backgroundColor: "#212a2f",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          Try again
        </button>
      </section>
    );
  }
}
