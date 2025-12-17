import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import listings from "../data/listings";
import { getListing } from "../contract.js";
import { getRandomListingPhoto } from "../utils/listingPhotos";
import { db } from "../services/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

export default function HomePage() {
  const [statusMap, setStatusMap] = useState({});
  const [allListings, setAllListings] = useState([]);
  const [featured, setFeatured] = useState([]);

  // Load custom listings from Firestore
  useEffect(() => {
    const loadCustomListings = async () => {
      try {
        const snap = await getDocs(collection(db, "listings"));
        const customListings = snap.docs.map((d) => {
          const data = d.data();
          const numId = Number(data.contractId ?? data.id);
          const resolvedId = Number.isFinite(numId) ? numId : d.id;
          const asStr = data.image ? String(data.image).trim() : "";
          const isLocalListingPhoto = asStr.startsWith("/listing-photos/") || asStr.startsWith("listing-photos/");
          const looksLikeImageUrl = /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(asStr) || /^https?:\/\/.+\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(asStr);
          const imgFromDb = isLocalListingPhoto || looksLikeImageUrl ? asStr : null;
          return {
            id: resolvedId,
            docId: d.id,
            image: imgFromDb || getRandomListingPhoto(resolvedId),
            fromDb: true,
            ...data,
          };
        });
        // Merge custom listings with mock data, avoiding duplicates
        const mergedListings = [
          ...customListings,
          ...listings.filter((mockListing) => !customListings.some((custom) => custom.id === mockListing.id)),
        ];
        setAllListings(mergedListings);
        setFeatured(mergedListings.slice(0, 2));
      } catch (err) {
        console.warn("Failed to load custom listings", err);
        setFeatured(listings.slice(0, 2));
      }
    };
    loadCustomListings();
  }, []);

  // Load on-chain status for featured listings
  useEffect(() => {
    if (featured.length === 0) return;
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
  }, [featured]);

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
              <img src={home.image || getRandomListingPhoto(home.id)} alt={home.title} />
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

      {/* Features Section */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>Why choose BitEstate?</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              Industry-leading security and speed for real estate transactions
            </p>
          </div>
        </div>
        <div className="grid">
          <div className="card feature-card">
            <div className="feature-icon">🔐</div>
            <h4>Blockchain Security</h4>
            <p>Immutable records prevent title fraud and disputes</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Lightning Fast</h4>
            <p>Complete transactions in minutes, not weeks</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">✓</div>
            <h4>Verified Documents</h4>
            <p>SHA-256 hashes prove authenticity and integrity</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">💰</div>
            <h4>Lower Costs</h4>
            <p>Skip intermediaries and reduce transaction fees</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>Trusted by property owners</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              Join thousands of users securing their real estate with blockchain
            </p>
          </div>
        </div>
        <div className="testimonials">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"BitEstate made selling my property incredibly smooth. The blockchain verification gave me peace of mind."</p>
            <div className="testimonial-author">
              <div className="avatar">A</div>
              <div>
                <strong>Amina</strong>
                <small>Property Seller</small>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"As a buyer, I appreciate the transparency. No hidden issues with verified documents on the blockchain."</p>
            <div className="testimonial-author">
              <div className="avatar">C</div>
              <div>
                <strong>Carlos</strong>
                <small>Property Buyer</small>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"The document verification feature saved us from a potential fraud. Highly recommended!"</p>
            <div className="testimonial-author">
              <div className="avatar">S</div>
              <div>
                <strong>Sylvia</strong>
                <small>Real Estate Agent</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <h2>Ready to transform your real estate?</h2>
        <p>Join BitEstate today and experience blockchain-powered property transactions</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/verify" className="btn-primary btn">
            Start Verifying →
          </Link>
          <Link to="/listings" className="btn">
            Browse Listings
          </Link>
        </div>
      </section>
    </div>
  );
}
