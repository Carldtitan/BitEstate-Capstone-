# Listing Photos

This folder contains stock photos for property listings. Place your photos here and they will be randomly assigned to listings.

## Setup Instructions

1. Add 25 property photos to this folder
2. Name them sequentially: `photo1.jpg`, `photo2.jpg`, ... `photo25.jpg`
3. Recommended size: 900x600px (3:2 ratio) or at least 800px width
4. Supported formats: JPG, PNG, WebP

## Example

```
listing-photos/
├── photo1.jpg
├── photo2.jpg
├── photo3.jpg
├── ...
└── photo25.jpg
```

## How It Works

- Each listing gets a consistent random photo based on its ID
- The same listing will always show the same photo
- Different listings will show different photos
- If you add more than 25 photos, update the number in `src/utils/listingPhotos.js`

## Tips

- Use high-quality, well-lit property images
- Ensure consistent framing across photos
- Vary the property types (houses, apartments, etc.)
- Include both exterior and interior shots
