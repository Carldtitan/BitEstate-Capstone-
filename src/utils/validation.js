/**
 * Form validation utilities
 */

export const validators = {
  // Email validation
  email: (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Invalid email format";
    return null;
  },

  // Phone or email (flexible contact field)
  contact: (value) => {
    if (!value) return "Contact is required";
    const phoneRegex = /^[0-9+\-\s()]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!phoneRegex.test(value) && !emailRegex.test(value)) {
      return "Must be a valid phone or email";
    }
    return null;
  },

  // Required text field
  text: (value, fieldName = "This field") => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    if (value.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    return null;
  },

  // Number validation (for price, beds, baths)
  number: (value, fieldName = "Value", min = 0, max = null) => {
    if (value === "" || value === null) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min) return `${fieldName} must be at least ${min}`;
    if (max !== null && num > max) return `${fieldName} cannot exceed ${max}`;
    return null;
  },

  // File validation
  file: (file, allowedTypes = ["application/pdf", "image/jpeg", "image/png"], maxSizeMB = 10) => {
    if (!file) return "File is required";
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) return `File size must not exceed ${maxSizeMB}MB`;
    if (!allowedTypes.includes(file.type)) {
      return `File type not allowed. Accepted: ${allowedTypes.join(", ")}`;
    }
    return null;
  },

  // National ID validation (basic format check)
  nationalId: (value) => {
    if (!value) return "National ID is required";
    if (value.trim().length < 5) return "National ID must be at least 5 characters";
    return null;
  },

  // Property title validation
  propertyTitle: (value) => {
    if (!value) return "Property title is required";
    if (value.trim().length < 3) return "Property title must be at least 3 characters";
    return null;
  },
};

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Validate all form fields at once
 */
export function validateForm(fields) {
  const errors = {};
  Object.entries(fields).forEach(([key, { value, validator }]) => {
    const error = validator(value);
    if (error) errors[key] = error;
  });
  return errors;
}
