import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import listings from "../data/listings";
import { getListing } from "../contract.js";

export default function HomePage() {
  const featured = listings.slice(0, 3);
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
          <p className="badge">Blockchain-backed real estate</p>
          <h1 className="hero-title">Verify, buy, and sell property with confidence.</h1>
          <p className="hero-subtitle">
            BitEstate blends blockchain proofs with document hashing so buyers can verify title
            documents, browse trusted listings, and purchase on-chain.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/verify" className="btn-primary btn">
              Verify a title
            </Link>
            <Link to="/listings" className="btn">
              Explore verified listings
            </Link>
          </div>
          <div className="stat-band">
            <div className="stat">
              <span className="muted">Verified listings</span>
              <strong>50+</strong>
            </div>
            <div className="stat">
              <span className="muted">On-chain payments</span>
              <strong>0.0000001 ETH</strong>
            </div>
            <div className="stat">
              <span className="muted">Document matches</span>
              <strong>SHA-256 exact</strong>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <img
            src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
            alt="Modern living room"
            style={{ width: "100%", borderRadius: "14px" }}
          />
          <p className="muted" style={{ marginTop: "10px" }}>
            Modern, Airbnb-inspired cards, trust badges, and on-chain verification flows.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h3 style={{ margin: 0 }}>Featured verified listings</h3>
            <p className="muted">Ready to purchase on-chain</p>
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
                      ? "On-chain"
                      : "Not on-chain"}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {home.city}
                </p>
                <p style={{ margin: "4px 0 0" }}>
                  ${home.priceUsd.toLocaleString()} · {home.beds} beds · {home.baths} baths
                </p>
                <span className="pill">Price: 0.0000001 ETH</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
