export const maskAadhaar = (aadhaar: string): string => {
  const digits = String(aadhaar ?? "").replace(/\D/g, "");

  if (digits.length !== 12) {
    return String(aadhaar ?? "");
  }

  return `XXXX-XXXX-${digits.slice(-4)}`;
};

export const maskPan = (pan: string): string => {
  const value = String(pan ?? "").trim().toUpperCase();

  if (value.length !== 10) {
    return value;
  }

  return `${value.slice(0, 3)}XX${value.slice(5, 7)}XX${value.slice(9, 10)}`;
};

export const maskMobile = (mobile: string): string => {
  const digits = String(mobile ?? "").replace(/\D/g, "");

  if (digits.length !== 10) {
    return String(mobile ?? "");
  }

  return `${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
};

export const maskCustomerRecord = <T extends object>(customer: T): T => {
  const masked = { ...customer } as T & {
    aadhaar?: string;
    pan?: string;
    mobile?: string;
  };

  if (typeof masked.aadhaar === "string") {
    masked.aadhaar = maskAadhaar(masked.aadhaar);
  }

  if (typeof masked.pan === "string") {
    masked.pan = maskPan(masked.pan);
  }

  if (typeof masked.mobile === "string") {
    masked.mobile = maskMobile(masked.mobile);
  }

  return masked as T;
};
