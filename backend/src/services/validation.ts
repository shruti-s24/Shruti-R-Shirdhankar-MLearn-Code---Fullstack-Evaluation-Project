export type ValidationResult = {
  valid: boolean;
  field?: string;
  message?: string;
};

const ALLOWED_PREMIUM_FREQUENCIES = [
  "Monthly",
  "Quarterly",
  "Half-Yearly",
  "Yearly",
] as const;

const ALLOWED_POLICY_TERMS = [10, 15, 20, 25, 30] as const;

const invalid = (field: string, message: string): ValidationResult => ({
  valid: false,
  field,
  message,
});

const isValidDate = (value: string | Date): boolean => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const getAgeAtDate = (dob: string | Date, asOf: string | Date): number => {
  const birthDate = new Date(dob);
  const comparisonDate = new Date(asOf);

  let age = comparisonDate.getFullYear() - birthDate.getFullYear();
  const monthOffset = comparisonDate.getMonth() - birthDate.getMonth();
  const dayOffset = comparisonDate.getDate() - birthDate.getDate();

  if (monthOffset < 0 || (monthOffset === 0 && dayOffset < 0)) {
    age -= 1;
  }

  return age;
};

export function validateCustomerAge(
  dob: string | Date,
  policyStartDate: string | Date
): ValidationResult {
  if (!isValidDate(dob) || !isValidDate(policyStartDate)) {
    return invalid("dob", "DOB and policy start date must be valid dates.");
  }

  const age = getAgeAtDate(dob, policyStartDate);

  if (age < 18 || age > 65) {
    return invalid(
      "dob",
      "Customer age must be between 18 and 65 on the policy start date."
    );
  }

  return { valid: true };
}

export function validatePanMandatory(
  premiumAmount: number,
  panProvided: boolean
): ValidationResult {
  if (typeof premiumAmount !== "number" || Number.isNaN(premiumAmount)) {
    return invalid("premiumAmount", "Premium amount must be a valid number.");
  }

  if (premiumAmount > 50000 && !panProvided) {
    return invalid(
      "panProvided",
      "PAN is mandatory when premium amount exceeds 50000."
    );
  }

  return { valid: true };
}

export function validateNominee(
  policyholderName: string,
  nomineeName: string
): ValidationResult {
  if (!policyholderName || !policyholderName.trim()) {
    return invalid("name", "Policyholder name is required.");
  }

  if (!nomineeName || !nomineeName.trim()) {
    return invalid("nomineeName", "Nominee name is mandatory.");
  }

  if (
    policyholderName.toLowerCase().trim() === nomineeName.toLowerCase().trim()
  ) {
    return invalid(
      "nomineeName",
      "Nominee cannot be the same as the policyholder name."
    );
  }

  return { valid: true };
}

export function validateMobile(mobile: string): ValidationResult {
  if (typeof mobile !== "string" || !/^[6-9]\d{9}$/.test(mobile.trim())) {
    return invalid(
      "mobile",
      "Mobile number must be 10 digits and start with 6, 7, 8, or 9."
    );
  }

  return { valid: true };
}

export function validateAadhaar(aadhaar: string): ValidationResult {
  if (typeof aadhaar !== "string" || !/^\d{12}$/.test(aadhaar.trim())) {
    return invalid("aadhaar", "Aadhaar must be exactly 12 digits.");
  }

  return { valid: true };
}

export function validatePolicyTerm(policyTerm: number | string): ValidationResult {
  const normalized = Number(policyTerm);

  if (!ALLOWED_POLICY_TERMS.includes(normalized as (typeof ALLOWED_POLICY_TERMS)[number])) {
    return invalid(
      "policyTerm",
      "Policy term must be one of 10, 15, 20, 25, or 30."
    );
  }

  return { valid: true };
}

export function validatePremiumFrequency(
  premiumFrequency: string
): ValidationResult {
  if (
    !ALLOWED_PREMIUM_FREQUENCIES.includes(
      premiumFrequency as (typeof ALLOWED_PREMIUM_FREQUENCIES)[number]
    )
  ) {
    return invalid(
      "premiumFrequency",
      "Premium frequency must be one of Monthly, Quarterly, Half-Yearly, or Yearly."
    );
  }

  return { valid: true };
}

export function validatePremiumAmount(premiumAmount: number): ValidationResult {
  if (typeof premiumAmount !== "number" || Number.isNaN(premiumAmount)) {
    return invalid("premiumAmount", "Premium amount must be a valid number.");
  }

  if (premiumAmount < 5000) {
    return invalid("premiumAmount", "Premium amount must be at least 5000.");
  }

  return { valid: true };
}

export function validatePolicyStartDate(startDate: string | Date): ValidationResult {
  if (!isValidDate(startDate)) {
    return invalid("startDate", "Policy start date must be a valid date.");
  }

  const now = new Date();
  const providedDate = new Date(startDate);

  if (providedDate <= now) {
    return invalid("startDate", "Policy start date cannot be in the past.");
  }

  return { valid: true };
}

export async function validatePanUniqueness(
  pan: string,
  checkPanExists: (pan: string) => Promise<boolean>
): Promise<ValidationResult> {
  if (!pan || !pan.trim()) {
    return invalid("pan", "PAN is required for uniqueness validation.");
  }

  const exists = await checkPanExists(pan.trim());
  if (exists) {
    return invalid("pan", "PAN already exists.");
  }

  return { valid: true };
}

export async function validateAadhaarUniqueness(
  aadhaar: string,
  checkAadhaarExists: (aadhaar: string) => Promise<boolean>
): Promise<ValidationResult> {
  if (!aadhaar || !aadhaar.trim()) {
    return invalid("aadhaar", "Aadhaar is required for uniqueness validation.");
  }

  const exists = await checkAadhaarExists(aadhaar.trim());
  if (exists) {
    return invalid("aadhaar", "Aadhaar already exists.");
  }

  return { valid: true };
}

export function validateAgentIdIsImmutable(
  originalAgentId?: string | null,
  updatedAgentId?: string | null
): ValidationResult {
  if (!originalAgentId || !updatedAgentId) {
    return { valid: true };
  }

  if (originalAgentId !== updatedAgentId) {
    return invalid(
      "agentId",
      "agentId cannot be changed after policy issuance."
    );
  }

  return { valid: true };
}

export function validateAgentInput(data:{
    name: string;
    email: string; 
    password: string;
}): ValidationResult {
    if (!data.name || !data.name.trim()) {
        return invalid("name", "Agent name is required.");
    }
    if(!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        return invalid("email", "A valid email is required.");
    }
    if(!data.password || data.password.length < 8) {
        return invalid("password", "Password must be at least 8 characters long.");
    }
    return { valid: true };
}

export function validateCustomerInput(data: {
  name?: string;
  dob?: string | Date;
  mobile?: string;
  email?: string;
  pan?: string;
  aadhaar?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  createdAt?: string | Date;
}): ValidationResult {
  if (!data.name || !data.name.trim()) {
    return invalid("name", "Customer name is required.");
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return invalid("email", "A valid email is required.");
  }

  const dobCheck = validateCustomerAge(data.dob || "", new Date());
  if (!dobCheck.valid) {
    return dobCheck;
  }

  const mobileCheck = validateMobile(data.mobile || "");
  if (!mobileCheck.valid) {
    return mobileCheck;
  }

  const aadhaarCheck = validateAadhaar(data.aadhaar || "");
  if (!aadhaarCheck.valid) {
    return aadhaarCheck;
  }

  const nomineeCheck = validateNominee(data.name || "", data.nomineeName || "");
  if (!nomineeCheck.valid) {
    return nomineeCheck;
  }

  return { valid: true };
}
