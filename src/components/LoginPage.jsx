import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const container = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
    fontFamily: "sans-serif",
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    width: "240px",
    marginBottom: "10px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#00bcd4",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  };

  return (
    <div style={container}>
      <h1 style={{ color: "#00bcd4", marginBottom: "20px" }}>BitEstate Login</h1>
      <input
        style={inputStyle}
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => onLogin(username, password)} style={buttonStyle}>
        Login
      </button>
    </div>
  );
}
