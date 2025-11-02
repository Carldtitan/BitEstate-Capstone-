export default function HomePage({ onNav }) {
  const container = {
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
    minHeight: "100vh",
    textAlign: "center",
    fontFamily: "sans-serif",
    padding: "100px 20px",
  };

  const heading = {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#00bcd4",
  };

  const subheading = {
    fontSize: "20px",
    margin: "20px auto 50px",
    maxWidth: "700px",
    lineHeight: "1.5",
  };

  const buttonContainer = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  };

  const button = {
    backgroundColor: "#00bcd4",
    border: "none",
    borderRadius: "6px",
    color: "white",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    transition: "0.3s ease",
  };

  const hover = (e, color) => (e.target.style.backgroundColor = color);

  return (
    <div style={container}>
      <h1 style={heading}>Welcome to BitEstate</h1>
      <p style={subheading}>
        A blockchain-powered platform for secure property verification, ownership validation, 
        and transparent real estate transactions.
      </p>

      <div style={buttonContainer}>
        <button
          style={button}
          onMouseEnter={(e) => hover(e, "#0197a8")}
          onMouseLeave={(e) => hover(e, "#00bcd4")}
          onClick={() => onNav("verify")}
        >
          Verify Property Title
        </button>
        <button
          style={button}
          onMouseEnter={(e) => hover(e, "#0197a8")}
          onMouseLeave={(e) => hover(e, "#00bcd4")}
          onClick={() => onNav("listings")}
        >
          Browse Verified Listings
        </button>
        <button
          style={button}
          onMouseEnter={(e) => hover(e, "#0197a8")}
          onMouseLeave={(e) => hover(e, "#00bcd4")}
          onClick={() => onNav("list-property")}
        >
          List a Property
        </button>
      </div>

      <div style={{ marginTop: "60px", color: "#9ca3af" }}>
        <p>🔗 Built on blockchain for trust and transparency</p>
        <p>⚙️ Powered by Ethers.js and Parcel</p>
      </div>
    </div>
  );
}
