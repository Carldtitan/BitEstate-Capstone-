import crypto from "crypto-js";

// Generate SHA256 hash of a file
export const generateHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wordArray = crypto.lib.WordArray.create(e.target.result);
      const hash = crypto.SHA256(wordArray).toString();
      resolve(hash);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
