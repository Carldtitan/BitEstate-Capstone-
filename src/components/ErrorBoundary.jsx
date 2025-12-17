import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "#0b1221",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              padding: "40px",
              background: "#10182c",
              border: "1px solid #1f2937",
              borderRadius: "16px",
              textAlign: "center",
              color: "#e5e7eb",
            }}
          >
            <h2 style={{ color: "#f87171", marginBottom: "16px" }}>
              Oops! Something went wrong
            </h2>
            <p style={{ color: "#9ca3af", marginBottom: "12px" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details
                style={{
                  marginTop: "20px",
                  textAlign: "left",
                  padding: "12px",
                  background: "#0d1627",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "12px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                <summary>Error details (development only)</summary>
                <pre style={{ whitespace: "pre-wrap", wordBreak: "break-word" }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.resetError}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #2dd4bf, #14b8a6)",
                border: "none",
                borderRadius: "10px",
                color: "#0b1221",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(45, 212, 191, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
