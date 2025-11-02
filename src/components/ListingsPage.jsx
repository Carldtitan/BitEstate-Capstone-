export default function ListingsPage() {
  const listings = [
    {
      id: 1,
      title: "3-Bedroom Apartment in Lagos",
      price: "$250,000",
      verified: true,
      owner: "Ade Properties Ltd",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Beachfront Land in Mombasa",
      price: "$120,000",
      verified: true,
      owner: "Coastal Developments",
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Condo in Nairobi CBD",
      price: "$95,000",
      verified: true,
      owner: "Urban Estates",
      img: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ];

  const container = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    padding: "40px 20px",
  };

  const card = {
    width: "300px",
    margin: "15px",
    background: "#1e293b",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  };

  return (
    <div style={container}>
      {listings.map((house) => (
        <div key={house.id} style={card}>
          <img
            src={house.img}
            alt={house.title}
            style={{ width: "100%", borderRadius: "10px", height: "200px", objectFit: "cover" }}
          />
          <h3 style={{ color: "#00bcd4", marginTop: "10px" }}>{house.title}</h3>
          <p>Price: {house.price}</p>
          <p>Owner: {house.owner}</p>
          <p>{house.verified ? "✅ Verified on Blockchain" : "❌ Not Verified"}</p>
        </div>
      ))}
    </div>
  );
}
