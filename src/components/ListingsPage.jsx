import { useEffect, useMemo, useState } from "react";
import listingsData from "../data/listings";
import { purchaseListing, PRICE_WEI, getListing, verifyHash } from "../contract.js";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { getRandomListingPhoto } from "../utils/listingPhotos";
import { db } from "../services/firebaseClient";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function ListingsPage() {
  const { isAdmin } = useAuth();
  const { walletAddress, networkOk, connectWallet, walletError } = useWallet();
  const ITEMS_PER_PAGE = 20;

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("");
  const [soldMap, setSoldMap] = useState({});
  const [existsMap, setExistsMap] = useState({});
  const [loadingOnChain, setLoadingOnChain] = useState(false);
  const [purchasingId, setPurchasingId] = useState(null);
  const [filterOnChain, setFilterOnChain] = useState("all");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterMinSqft, setFilterMinSqft] = useState("");
  const [filterMaxSqft, setFilterMaxSqft] = useState("");
  const [filterMinBeds, setFilterMinBeds] = useState("");
  const [filterMaxBeds, setFilterMaxBeds] = useState("");
  const [filterMinBaths, setFilterMinBaths] = useState("");
  const [filterMaxBaths, setFilterMaxBaths] = useState("");
  const [userListings, setUserListings] = useState([]);
  const [hashStatus, setHashStatus] = useState({});
  const [hashPending, setHashPending] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [loadingHashes, setLoadingHashes] = useState(false);
  const [toasts, setToasts] = useState([]);

  const cowriesPerListing = Math.floor((Number(PRICE_WEI) / 1e18) * 200000);

  const addToast = (message, type = "info") => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const loadUserListings = async () => {
      try {
        const snap = await getDocs(collection(db, "listings"));
        const docs = snap.docs.map((d) => {
          const data = d.data();
          const numId = Number(data.contractId ?? data.id);
          const resolvedId = Number.isFinite(numId) ? numId : d.id;
          // Only accept DB image values that look like real image URLs/paths.
          // Some stored links return HTML or redirect pages (200 OK) which can't be used as <img> sources.
          const asStr = data.image ? String(data.image).trim() : "";
          const isLocalListingPhoto = asStr.startsWith("/listing-photos/");
          const looksLikeImageUrl = /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(asStr) || /^https?:\/\/.+\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(asStr);
          const imgFromDb = isLocalListingPhoto || looksLikeImageUrl ? asStr : null;
          return {
            id: resolvedId,
            docId: d.id,
            image: imgFromDb || getRandomListingPhoto(resolvedId),
            ...data,
          };
        });
        setUserListings(docs);
      } catch (err) {
        console.warn("Failed to load user listings", err);
      }
    };
    loadUserListings();
  }, []);

  const mergedListings = useMemo(
    () => [...userListings.map((l) => ({ ...l, fromDb: true })), ...listingsData],
    [userListings]
  );

  useEffect(() => {
    const load = async () => {
      setLoadingOnChain(true);
      try {
        const numericListings = mergedListings.filter((l) => typeof l.id === "number");
        const calls = numericListings.map((l) =>
          Promise.race([getListing(l.id), new Promise((resolve) => setTimeout(() => resolve({}), 3000))])
        );
        const results = await Promise.all(calls);
        const solds = {};
        const exists = {};
        numericListings.forEach((l, idx) => {
          solds[l.id] = Boolean(results[idx]?.sold);
          exists[l.id] = Boolean(results[idx]?.exists);
        });
        setSoldMap(solds);
        setExistsMap(exists);
      } catch (err) {
        console.warn("Failed to load on-chain status", err);
      } finally {
        setLoadingOnChain(false);
      }
    };
    load();
  }, [mergedListings]);

  const checkHashStatus = async (listing) => {
    if (!listing.docHash) return;
    const key = listing.id || listing.title;
    setHashPending((prev) => ({ ...prev, [key]: true }));
    try {
      const found = await Promise.race([
        verifyHash(listing.docHash),
        new Promise((resolve) => setTimeout(() => resolve(false), 3000)),
      ]);
      setHashStatus((prev) => ({ ...prev, [key]: found }));
    } catch (err) {
      setHashStatus((prev) => ({ ...prev, [key]: false }));
    } finally {
      setHashPending((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    const autoCheck = async () => {
      const withHashes = mergedListings.filter((l) => l.docHash);
      if (!withHashes.length) return;
      setLoadingHashes(true);
      try {
        const calls = withHashes.map((l) =>
          Promise.race([
            verifyHash(l.docHash),
            new Promise((resolve) => setTimeout(() => resolve(false), 3000)),
          ])
        );
        const results = await Promise.all(calls);
        const next = {};
        withHashes.forEach((l, idx) => {
          const key = l.id || l.title;
          next[key] = results[idx];
        });
        setHashStatus((prev) => ({ ...prev, ...next }));
      } catch (err) {
        console.warn("Auto hash check failed", err);
      } finally {
        setLoadingHashes(false);
      }
    };
    autoCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedListings]);

  const listings = useMemo(() => {
    const term = search.toLowerCase();
    return mergedListings.filter((l) => {
      const matchesText =
        (l.city || "").toLowerCase().includes(term) ||
        (l.title || "").toLowerCase().includes(term) ||
        (l.owner || "").toLowerCase().includes(term);
      const exists = existsMap[l.id];
      const sold = soldMap[l.id];
      const hashVerified = hashStatus[l.id || l.title] || l.verified;
      const verified = exists || hashVerified;
      if (filterOnChain === "on" && !verified) return false;
      if (filterOnChain === "off" && verified) return false;
      if (filterOnChain === "available") {
        const canBuy = typeof l.id === "number" && verified && !sold;
        if (!canBuy) return false;
      }
      const minPriceOk = filterMinPrice ? (l.priceUsd || 0) >= Number(filterMinPrice) : true;
      const maxPriceOk = filterMaxPrice ? (l.priceUsd || 0) <= Number(filterMaxPrice) : true;
      const minSqftOk = filterMinSqft ? (l.area || 0) >= Number(filterMinSqft) : true;
      const maxSqftOk = filterMaxSqft ? (l.area || 0) <= Number(filterMaxSqft) : true;
      const minBedsOk = filterMinBeds ? (l.beds || 0) >= Number(filterMinBeds) : true;
      const maxBedsOk = filterMaxBeds ? (l.beds || 0) <= Number(filterMaxBeds) : true;
      const minBathsOk = filterMinBaths ? (l.baths || 0) >= Number(filterMinBaths) : true;
      const maxBathsOk = filterMaxBaths ? (l.baths || 0) <= Number(filterMaxBaths) : true;
      return (
        matchesText &&
        minPriceOk &&
        maxPriceOk &&
        minSqftOk &&
        maxSqftOk &&
        minBedsOk &&
        maxBedsOk &&
        minBathsOk &&
        maxBathsOk
      );
    });
  }, [
    mergedListings,
    search,
    filterOnChain,
    filterMinPrice,
    filterMaxPrice,
    filterMinSqft,
    filterMaxSqft,
    filterMinBeds,
    filterMaxBeds,
    filterMinBaths,
    filterMaxBaths,
    existsMap,
    soldMap,
    hashStatus,
  ]);

  // Pagination
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedListings = listings.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterOnChain, filterMinPrice, filterMaxPrice, filterMinSqft, filterMaxSqft, filterMinBeds, filterMaxBeds, filterMinBaths, filterMaxBaths]);

  const handleBuy = async (listing) => {
    setStatus("");
    if (!walletAddress) {
      const addr = await connectWallet();
      if (!addr) {
        setStatus(walletError || "Wallet not found. Please install MetaMask.");
        return;
      }
    }
    if (!networkOk) {
      addToast("Please switch your wallet to Sepolia (chainId 0xaa36a7).", "warn");
      return;
    }
    if (typeof listing.id !== "number") {
      addToast("This listing is not on-chain yet.", "warn");
      return;
    }
    setPurchasingId(listing.id);
    try {
      const txHash = await purchaseListing(listing.id, PRICE_WEI);
      addToast(`Purchased ${listing.title}`, "success");
      setSoldMap((prev) => ({ ...prev, [listing.id]: true }));
      try {
        if (listing.docId) {
          await updateDoc(doc(db, "listings", listing.docId), {
            ownerWallet: walletAddress,
            owner: listing.owner || "New owner",
          });
        }
        await addDoc(collection(db, "purchases"), {
          buyerWallet: walletAddress,
          listingId: listing.id,
          docHash: listing.docHash,
          title: listing.title,
          city: listing.city,
          priceUsd: listing.priceUsd,
          beds: listing.beds,
          baths: listing.baths,
          area: listing.area,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Failed to record purchase", err);
      }
    } catch (err) {
      addToast(err.message || "Purchase failed", "error");
      // If already sold on-chain, refresh sold state
      try {
        const onChain = await getListing(listing.id);
        if (onChain?.sold) {
          setSoldMap((prev) => ({ ...prev, [listing.id]: true }));
        }
      } catch {}
    } finally {
      setPurchasingId(null);
    }
  };

  const handleDelete = async (listing) => {
    if (!isAdmin) return;
    if (typeof listing.id === "number") {
      setStatus("On-chain listings cannot be deleted.");
      return;
    }
    try {
      setDeletingId(listing.id);
      await deleteDoc(doc(db, "listings", listing.id));
      setUserListings((prev) => prev.filter((l) => l.id !== listing.id));
      addToast("Listing deleted.", "info");
    } catch (err) {
      addToast(err.message || "Failed to delete listing.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="layout section">
      <div className="section-header">
        <div>
          <h2 style={{ margin: 0 }}>Verified listings</h2>
          <p className="muted">
            On-chain purchases at 0.0000001 ETH each. Listings reflect sold state from the contract.
          </p>
        </div>
        <div
          className="form-card"
          style={{
            display: "grid",
            gap: "8px",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          <input
            className="input"
            placeholder="Search city, title, owner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select" value={filterOnChain} onChange={(e) => setFilterOnChain(e.target.value)}>
            <option value="all">All</option>
            <option value="on">Verified</option>
            <option value="off">Not verified</option>
            <option value="available">Available & verified</option>
          </select>
          <input
            className="input"
            type="number"
            placeholder="Min $"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Max $"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Min sqft"
            value={filterMinSqft}
            onChange={(e) => setFilterMinSqft(e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Max sqft"
            value={filterMaxSqft}
            onChange={(e) => setFilterMaxSqft(e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Min beds"
            value={filterMinBeds}
            onChange={(e) => setFilterMinBeds(e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Max beds"
            value={filterMaxBeds}
            onChange={(e) => setFilterMaxBeds(e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Min baths"
            value={filterMinBaths}
            onChange={(e) => setFilterMinBaths(e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Max baths"
            value={filterMaxBaths}
            onChange={(e) => setFilterMaxBaths(e.target.value)}
          />
        </div>
      </div>
      {toasts.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 9999,
          }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="toast"
              style={{
                minWidth: "240px",
                padding: "12px 14px",
                borderRadius: "10px",
                color: "#fff",
                boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
                background:
                  t.type === "success"
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : t.type === "warn"
                    ? "linear-gradient(135deg,#f97316,#ea580c)"
                    : t.type === "error"
                    ? "linear-gradient(135deg,#ef4444,#b91c1c)"
                    : "linear-gradient(135deg,#38bdf8,#0ea5e9)",
                animation: "slideIn 0.35s ease, fadeOut 0.35s ease 3s forwards",
              }}
            >
              {t.message}
            </div>
          ))}
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(-10px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fadeOut {
              to { opacity: 0; transform: translateY(-6px) scale(0.98); }
            }
          `}</style>
        </div>
      )}
      {!walletAddress && (
        <div className="status">
          <button className="btn-primary btn" onClick={connectWallet}>
            Connect wallet to buy (Sepolia)
          </button>
        </div>
      )}
      {walletAddress && !networkOk && (
        <div className="status">Wrong network. Switch to Sepolia in MetaMask.</div>
      )}
      {walletError && <div className="status">{walletError}</div>}
      {(loadingOnChain || loadingHashes) && (
        <div className="status">Checking on-chain availability...</div>
      )}
      <div className="grid">
        {paginatedListings.map((home) => {
          const sold = home.id && soldMap[home.id];
          const exists = home.id && existsMap[home.id];
          const isBuying = purchasingId === home.id;
          const hashKey = home.id || home.title;
          const hashFound = hashStatus[hashKey] || home.verified;
          const verified = Boolean(exists || hashFound);
          const isOwner = walletAddress && home.ownerWallet && home.ownerWallet.toLowerCase() === walletAddress.toLowerCase();
          const canBuy = typeof home.id === "number" && verified && !sold && !isOwner;
          return (
            <div key={hashKey} className="card">
              <img src={home.image || getRandomListingPhoto(home.id)} alt={home.title} loading="lazy" />
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <h4 style={{ margin: 0 }}>{home.title}</h4>
                  <span className="badge">{home.id && sold ? "Sold" : verified ? "Verified" : "Not verified"}</span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {home.city}
                </p>
                <p style={{ margin: "2px 0" }}>
                  ${(home.priceUsd || 0).toLocaleString()} - {home.beds || 0} beds - {home.baths || 0} baths -{" "}
                  {home.area || 0} sqft
                </p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span className="pill">{cowriesPerListing} Cowries</span>
                  <span className="pill">Price: 0.0000001 ETH</span>
                  <span className="muted">
                    Owner: {home.owner || "Unknown"} {isOwner ? "(you)" : ""}
                  </span>
                </div>
                {home.docHash && !hashFound && isAdmin && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                    <span className="pill" style={{ background: "#1e293b" }}>
                      Admin must register missing hashes
                    </span>
                  </div>
                )}
                {isOwner && (
                  <div className="pill" style={{ background: "#0f172a", borderColor: "#22d3ee", color: "#22d3ee" }}>
                    You own this listing
                  </div>
                )}
                <button
                  className="btn-primary btn"
                  style={{ marginTop: "8px" }}
                  disabled={typeof home.id === "number" ? sold || !canBuy || isBuying : true}
                  onClick={() => handleBuy(home)}
                >
                  {home.id && sold
                    ? "Sold"
                    : isOwner
                    ? "You're the owner"
                    : canBuy
                    ? isBuying
                      ? "Purchasing..."
                      : "Buy on-chain"
                    : verified
                    ? "Verified record"
                    : "Not verified"}
                </button>
                {isAdmin && (typeof home.id !== "number" || !exists) && (
                  <button
                    className="btn"
                    style={{ marginTop: "8px", background: "#1e293b" }}
                    disabled={deletingId === home.id}
                    onClick={() => handleDelete(home)}
                  >
                    {deletingId === home.id ? "Deleting..." : "Delete (admin, off-chain)"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px", flexWrap: "wrap" }}>
          <button
            className="btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className="btn"
              style={{
                background: currentPage === i + 1 ? "linear-gradient(135deg, #2dd4bf, #14b8a6)" : "var(--panel)",
                color: currentPage === i + 1 ? "#0b1221" : "var(--text)",
                fontWeight: currentPage === i + 1 ? "600" : "500",
              }}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          >
            Next →
          </button>
          <span className="muted" style={{ alignSelf: "center", marginLeft: "8px" }}>
            Page {currentPage} of {totalPages} ({listings.length} results)
          </span>
        </div>
      )}
    </div>
  );
}
