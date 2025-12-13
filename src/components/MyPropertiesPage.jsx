import { useEffect, useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { db } from "../services/firebaseClient";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export default function MyPropertiesPage() {
  const { walletAddress } = useWallet();
  const [listings, setListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!walletAddress) return;
    const load = async () => {
      setLoading(true);
      try {
        const ownedSnap = await getDocs(
          query(collection(db, "listings"), where("ownerWallet", "==", walletAddress))
        );
        const owned = ownedSnap.docs.map((d) => ({ docId: d.id, ...d.data() }));

        const purchaseSnap = await getDocs(
          query(
            collection(db, "purchases"),
            where("buyerWallet", "==", walletAddress),
            orderBy("createdAt", "desc")
          )
        );
        const bought = purchaseSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setListings(owned);
        setPurchases(bought);
      } catch (err) {
        setStatus(err.message || "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [walletAddress]);

  const purchasedCards = useMemo(
    () =>
      purchases.map((p) => (
        <div key={p.id} className="card">
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0 }}>{p.title || "Purchased property"}</h4>
              <span className="badge">Purchased</span>
            </div>
            <p className="muted" style={{ margin: 0 }}>
              {p.city || p.location || ""}
            </p>
            <p style={{ margin: "2px 0" }}>
              ${(p.priceUsd || 0).toLocaleString()} - {p.beds || 0} beds - {p.baths || 0} baths -{" "}
              {p.area || 0} sqft
            </p>
            <div className="muted" style={{ wordBreak: "break-all" }}>
              Doc hash: {p.docHash}
            </div>
          </div>
        </div>
      )),
    [purchases]
  );

  const ownedCards = useMemo(
    () =>
      listings.map((l) => (
        <div key={l.docId || l.docHash} className="card">
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0 }}>{l.title}</h4>
              <span className="badge">{l.verified ? "Verified" : "Not verified"}</span>
            </div>
            <p className="muted" style={{ margin: 0 }}>
              {l.city}
            </p>
            <p style={{ margin: "2px 0" }}>
              ${(l.priceUsd || 0).toLocaleString()} - {l.beds || 0} beds - {l.baths || 0} baths -{" "}
              {l.area || 0} sqft
            </p>
            <div className="muted" style={{ wordBreak: "break-all" }}>
              Doc hash: {l.docHash}
            </div>
          </div>
        </div>
      )),
    [listings]
  );

  if (!walletAddress) {
    return <div className="layout section">Connect your wallet to view your properties.</div>;
  }

  return (
    <div className="layout section">
      <h2 style={{ marginTop: 0 }}>My Properties</h2>
      {status && <div className="status">{status}</div>}
      {loading && <div className="status">Loading your properties...</div>}

      <div className="section-header">
        <div>
          <h3 style={{ margin: 0 }}>Owned & Listed</h3>
          <p className="muted">Properties you listed as owner.</p>
        </div>
      </div>
      <div className="grid">{ownedCards.length ? ownedCards : <div className="muted">None yet.</div>}</div>

      <div className="section-header" style={{ marginTop: "32px" }}>
        <div>
          <h3 style={{ margin: 0 }}>Purchased</h3>
          <p className="muted">Properties you’ve bought.</p>
        </div>
      </div>
      <div className="grid">
        {purchasedCards.length ? purchasedCards : <div className="muted">No purchases yet.</div>}
      </div>
    </div>
  );
}
