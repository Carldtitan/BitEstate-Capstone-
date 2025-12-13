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
          <p className="badge">Trusted homes, verified titles</p>
          <h1 className="hero-title">Find a home you love and move fast.</h1>
          <p className="hero-subtitle">
            Browse move-in ready homes, review verified title info, and complete purchases with a few clicks.
            No jargon—just clear listings, real owners, and simple steps.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/verify" className="btn-primary btn">
              Verify a document
            </Link>
            <Link to="/listings" className="btn">
              Explore homes
            </Link>
          </div>
          <div className="stat-band">
            <div className="stat">
              <span className="muted">Trusted sellers</span>
              <strong>Verified owners</strong>
            </div>
            <div className="stat">
              <span className="muted">Title ready</span>
              <strong>Pre-checked docs</strong>
            </div>
            <div className="stat">
              <span className="muted">Quick closing</span>
              <strong>Guided steps</strong>
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
            Bright, modern listings with simple verification and purchase flows.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h3 style={{ margin: 0 }}>Featured homes</h3>
            <p className="muted">Title-checked and ready for the next owner</p>
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
