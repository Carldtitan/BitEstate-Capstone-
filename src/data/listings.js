const baseListings = [
  {
    title: "Waterfront Loft",
    city: "Lagos, Nigeria",
    priceUsd: 240000,
    beds: 3,
    baths: 2,
    area: 2100,
    owner: "Eko Estates",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa1",
  },
  {
    title: "Beachfront Plot",
    city: "Mombasa, Kenya",
    priceUsd: 180000,
    beds: 0,
    baths: 0,
    area: 10000,
    owner: "Coastal Developments",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa2",
  },
  {
    title: "CBD Condo",
    city: "Nairobi, Kenya",
    priceUsd: 150000,
    beds: 2,
    baths: 2,
    area: 1200,
    owner: "Urban Estates",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa3",
  },
  {
    title: "Garden Duplex",
    city: "Accra, Ghana",
    priceUsd: 210000,
    beds: 4,
    baths: 3,
    area: 2600,
    owner: "Atlantic Homes",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa4",
  },
  {
    title: "Skyline Apartment",
    city: "Cape Town, South Africa",
    priceUsd: 320000,
    beds: 3,
    baths: 2,
    area: 2000,
    owner: "Table Bay Realty",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa5",
  },
  {
    title: "Harbor Townhouse",
    city: "Dar es Salaam, Tanzania",
    priceUsd: 190000,
    beds: 3,
    baths: 2,
    area: 1800,
    owner: "Coral Homes",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa6",
  },
  {
    title: "Lakeview Villa",
    city: "Kigali, Rwanda",
    priceUsd: 260000,
    beds: 4,
    baths: 3,
    area: 2400,
    owner: "Hillside Properties",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa7",
  },
  {
    title: "Marina Penthouse",
    city: "Abuja, Nigeria",
    priceUsd: 350000,
    beds: 4,
    baths: 3,
    area: 2800,
    owner: "Central Heights",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    docHash: "0xaaa8",
  },
];

export const listings = baseListings.map((base, idx) => ({
  ...base,
  id: idx + 1,
}));

export default listings;
