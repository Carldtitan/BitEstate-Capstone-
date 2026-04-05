import listings from "../data/listings";
import ImageWithFallback from "./ImageWithFallback";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatPrice(value) {
  return money.format(value || 0);
}

export default function ComingSoonPage() {
  return (
    <div className="layout section">
      <div className="section-header">
        <div>
          <p className="badge">Marketplace</p>
          <h2 style={{ margin: 0 }}>Coming soon</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            Preview only. Nothing here is live.
          </p>
        </div>
      </div>

      <div className="marketplace-stage">
        <div className="marketplace-grid marketplace-blurred" aria-hidden="true">
          {listings.slice(0, 8).map((listing) => (
            <article key={listing.id} className="market-card">
              <ImageWithFallback
                listingId={listing.id}
                src={listing.image}
                alt={listing.title}
                className="market-image"
              />
              <div className="card-body">
                <div className="market-meta">
                  <h4>{listing.title}</h4>
                  <span className="badge badge-muted">Preview</span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {listing.city}
                </p>
                <div className="market-specs">
                  <span>{listing.beds || 0} bd</span>
                  <span>{listing.baths || 0} ba</span>
                  <span>{listing.area || 0} sq ft</span>
                </div>
                <strong>{formatPrice(listing.priceUsd)}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className="marketplace-overlay">
          <p className="badge">Locked preview</p>
          <h3 style={{ margin: "8px 0 6px" }}>Browse disabled</h3>
          <p className="muted" style={{ margin: 0 }}>
            The layout stays visible. The controls do not work.
          </p>
        </div>
      </div>
    </div>
  );
}
