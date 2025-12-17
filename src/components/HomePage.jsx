import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import listings from "../data/listings";
import { getListing } from "../contract.js";

export default function HomePage() {
  // Keep the hero simple and reduce technical jargon
  const featured = listings.slice(0, 2);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.all(featured.map((l) => getListing(l.id)));
        const map = {};
        featured.forEach((l, idx) => {
          map[l.id] = results[idx];
        });
        setStatusMap(map);
      } catch (err) {
        console.warn("Failed to load listing status", err);
      }
    };
    load();
  }, []);

  return (
    <div className="layout">
      <section className="hero">
        <div className="hero-card">
          <p className="badge">Blockchain-verified property titles</p>
          <h1 className="hero-title">Buy with confidence. Sell with clarity.</h1>
          <p className="hero-subtitle">
            BitEstate verifies property documents on the blockchain, eliminating fraud and speeding up transactions. Browse verified listings, compare documents, and complete purchases in minutes.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/verify" className="btn-primary btn">
              Verify Documents
            </Link>
            <Link to="/listings" className="btn">
              Browse Listings
            </Link>
          </div>
          <div className="stat-band">
            <div className="stat">
              <span>Document verification</span>
              <strong>SHA-256 hashing</strong>
            </div>
            <div className="stat">
              <span>Blockchain secured</span>
              <strong>Tamper-proof</strong>
            </div>
            <div className="stat">
              <span>Fast transactions</span>
              <strong>On-chain purchases</strong>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <img
            src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
            alt="Trusted real estate marketplace"
            style={{ width: "100%", borderRadius: "14px" }}
          />
          <p className="muted" style={{ marginTop: "10px" }}>
            Verified property listings with cryptographic authenticity.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h3 style={{ margin: 0 }}>Featured homes</h3>
            <p className="muted">Pre-checked titles and ready for the next owner</p>
          </div>
          <Link to="/listings" className="btn">
            View all
          </Link>
        </div>
        <div className="grid">
          {featured.map((home) => (
            <div key={home.id} className="card">
              <img src={home.image} alt={home.title} />
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <h4 style={{ margin: 0 }}>{home.title}</h4>
                  <span className="badge">
                    {statusMap[home.id]?.sold
                      ? "Sold"
                      : statusMap[home.id]?.exists
                      ? "Verified"
                      : "Pending"}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {home.city}
                </p>
                <p style={{ margin: "4px 0 0" }}>
                  ${home.priceUsd.toLocaleString()} · {home.beds} beds · {home.baths} baths
                </p>
                <span className="pill">
                  {statusMap[home.id]?.exists ? "Verified title" : "Awaiting verification"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
