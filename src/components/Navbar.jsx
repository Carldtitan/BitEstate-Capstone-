export default function Navbar({ onNav }) {
  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    background: "#111",
    color: "white",
    borderBottom: "1px solid #333",
  };

  const buttonStyle = {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "16px",
    marginLeft: "12px",
    cursor: "pointer",
  };

  const hover = (e, color) => (e.target.style.color = color);

  return (
    <nav style={navStyle}>
      <h1
        style={{ color: "#00bcd4", fontWeight: "bold", cursor: "pointer" }}
        onClick={() => onNav("home")}
      >
        BitEstate
      </h1>
      <div>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => hover(e, "#00bcd4")}
          onMouseLeave={(e) => hover(e, "white")}
          onClick={() => onNav("verify")}
        >
          Verify Title
        </button>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => hover(e, "#00bcd4")}
          onMouseLeave={(e) => hover(e, "white")}
          onClick={() => onNav("listings")}
        >
          Verified Listings
        </button>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => hover(e, "#00bcd4")}
          onMouseLeave={(e) => hover(e, "white")}
          onClick={() => onNav("list-property")}
        >
          List a Property
        </button>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => hover(e, "#e57373")}
          onMouseLeave={(e) => hover(e, "white")}
          onClick={() => window.location.reload()}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
