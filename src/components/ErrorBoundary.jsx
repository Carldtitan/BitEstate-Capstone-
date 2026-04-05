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
            background: "linear-gradient(180deg, #fbf5ec 0%, #efe0cf 100%)",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              padding: "40px",
              background: "rgba(255, 250, 244, 0.96)",
              border: "1px solid #dcc8b7",
              borderRadius: "16px",
              textAlign: "center",
              color: "#3b2518",
              boxShadow: "0 18px 44px rgba(92, 61, 35, 0.18)",
            }}
          >
            <h2 style={{ color: "#a24f43", marginBottom: "16px" }}>
              Oops! Something went wrong
            </h2>
            <p style={{ color: "#806657", marginBottom: "12px" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details
                style={{
                  marginTop: "20px",
                  textAlign: "left",
                  padding: "12px",
                  background: "rgba(255, 250, 244, 0.88)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#806657",
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
                background: "linear-gradient(135deg, #b6794f, #7a4e31)",
                border: "none",
                borderRadius: "10px",
                color: "#fff8f1",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(138, 91, 58, 0.22)";
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
