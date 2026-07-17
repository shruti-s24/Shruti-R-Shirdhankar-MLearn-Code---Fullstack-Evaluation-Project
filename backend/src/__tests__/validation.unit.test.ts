import {
  validateAadhaar,
  validateAadhaarUniqueness,
  validateAgentIdIsImmutable,
  validateAgentInput,
  validateCustomerAge,
  validateCustomerInput,
  validateMobile,
  validateNominee,
  validatePanMandatory,
  validatePanUniqueness,
  validatePolicyStartDate,
  validatePolicyTerm,
  validatePremiumAmount,
  validatePremiumFrequency,
} from "../services/validation";

describe("validation.ts business rules", () => {
  describe("validateCustomerAge", () => {
    it("passes when DOB is valid and age is between 18 and 65", () => {
      const result = validateCustomerAge("2000-01-01", "2026-01-01");
      expect(result).toEqual({ valid: true });
    });

    it("fails when DOB is invalid or customer age is outside allowed range", () => {
      const invalidDate = validateCustomerAge("not-a-date", "2026-01-01");
      expect(invalidDate.valid).toBe(false);
      expect(invalidDate.field).toBe("dob");

      const tooOld = validateCustomerAge("1950-01-01", "2026-01-01");
      expect(tooOld.valid).toBe(false);
      expect(tooOld.field).toBe("dob");
    });
  });

  describe("validatePanMandatory", () => {
    it("passes when premium is below threshold or PAN is provided", () => {
      expect(validatePanMandatory(40000, false)).toEqual({ valid: true });
      expect(validatePanMandatory(60000, true)).toEqual({ valid: true });
    });

    it("fails when premium exceeds 50000 and PAN is not provided", () => {
      const result = validatePanMandatory(60000, false);
      expect(result.valid).toBe(false);
      expect(result.field).toBe("panProvided");
    });
  });

  describe("validateNominee", () => {
    it("passes when policyholder and nominee names are different and populated", () => {
      const result = validateNominee("Alice", "Bob");
      expect(result).toEqual({ valid: true });
    });

    it("fails when nominee is missing or same as policyholder", () => {
      const missing = validateNominee("Alice", "");
      expect(missing.valid).toBe(false);
      expect(missing.field).toBe("nomineeName");

      const same = validateNominee("Alice", "Alice");
      expect(same.valid).toBe(false);
      expect(same.field).toBe("nomineeName");
    });
  });

  describe("validateMobile", () => {
    it("passes for a valid 10-digit Indian mobile number", () => {
      const result = validateMobile("9876543210");
      expect(result).toEqual({ valid: true });
    });

    it("fails for invalid mobile formats", () => {
      const result = validateMobile("1234567890");
      expect(result.valid).toBe(false);
      expect(result.field).toBe("mobile");
    });
  });

  describe("validateAadhaar", () => {
    it("passes for a 12-digit Aadhaar string", () => {
      const result = validateAadhaar("123456789012");
      expect(result).toEqual({ valid: true });
    });

    it("fails for non-digit or wrong-length Aadhaar", () => {
      const result = validateAadhaar("12345");
      expect(result.valid).toBe(false);
      expect(result.field).toBe("aadhaar");
    });
  });

  describe("validatePolicyTerm", () => {
    it("passes for an allowed policy term", () => {
      expect(validatePolicyTerm(15)).toEqual({ valid: true });
    });

    it("fails for a disallowed policy term", () => {
      const result = validatePolicyTerm(12);
      expect(result.valid).toBe(false);
      expect(result.field).toBe("policyTerm");
    });
  });

  describe("validatePremiumFrequency", () => {
    it("passes for an allowed premium frequency", () => {
      expect(validatePremiumFrequency("Quarterly")).toEqual({ valid: true });
    });

    it("fails for an unsupported premium frequency", () => {
      const result = validatePremiumFrequency("Weekly");
      expect(result.valid).toBe(false);
      expect(result.field).toBe("premiumFrequency");
    });
  });

  describe("validatePremiumAmount", () => {
    it("passes when the premium amount is a valid number and is at least 5000", () => {
      expect(validatePremiumAmount(6000)).toEqual({ valid: true });
    });

    it("fails when premium amount is invalid or too low", () => {
      const invalidNumber = validatePremiumAmount(Number.NaN);
      expect(invalidNumber.valid).toBe(false);
      expect(invalidNumber.field).toBe("premiumAmount");

      const tooLow = validatePremiumAmount(4000);
      expect(tooLow.valid).toBe(false);
      expect(tooLow.field).toBe("premiumAmount");
    });
  });

  describe("validatePolicyStartDate", () => {
    it("passes for a valid future date", () => {
      const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      expect(validatePolicyStartDate(future)).toEqual({ valid: true });
    });

    it("fails for a past or invalid date", () => {
      const past = validatePolicyStartDate("2020-01-01");
      expect(past.valid).toBe(false);
      expect(past.field).toBe("startDate");

      const invalid = validatePolicyStartDate("not-a-date");
      expect(invalid.valid).toBe(false);
      expect(invalid.field).toBe("startDate");
    });
  });

  describe("validatePanUniqueness", () => {
    it("passes when PAN is present and not already used", async () => {
      const result = await validatePanUniqueness("ABCDE1234F", async () => false);
      expect(result).toEqual({ valid: true });
    });

    it("fails when PAN is missing or already exists", async () => {
      const missing = await validatePanUniqueness("", async () => false);
      expect(missing.valid).toBe(false);
      expect(missing.field).toBe("pan");

      const duplicate = await validatePanUniqueness("ABCDE1234F", async () => true);
      expect(duplicate.valid).toBe(false);
      expect(duplicate.field).toBe("pan");
    });
  });

  describe("validateAadhaarUniqueness", () => {
    it("passes when Aadhaar is present and not already used", async () => {
      const result = await validateAadhaarUniqueness("123456789012", async () => false);
      expect(result).toEqual({ valid: true });
    });

    it("fails when Aadhaar is missing or already exists", async () => {
      const missing = await validateAadhaarUniqueness("", async () => false);
      expect(missing.valid).toBe(false);
      expect(missing.field).toBe("aadhaar");

      const duplicate = await validateAadhaarUniqueness("123456789012", async () => true);
      expect(duplicate.valid).toBe(false);
      expect(duplicate.field).toBe("aadhaar");
    });
  });

  describe("validateAgentIdIsImmutable", () => {
    it("passes when original and updated agent IDs are the same or missing", () => {
      expect(validateAgentIdIsImmutable(undefined, undefined)).toEqual({ valid: true });
      expect(validateAgentIdIsImmutable("agent-1", "agent-1")).toEqual({ valid: true });
    });

    it("fails when agentId changes after issuance", () => {
      const result = validateAgentIdIsImmutable("agent-1", "agent-2");
      expect(result.valid).toBe(false);
      expect(result.field).toBe("agentId");
    });
  });

  describe("validateAgentInput", () => {
    it("passes for a valid agent payload", () => {
      const result = validateAgentInput({
        name: "Ravi",
        email: "ravi@example.com",
        password: "password123",
      });

      expect(result).toEqual({ valid: true });
    });

    it("fails for invalid agent payloads", () => {
      const missingName = validateAgentInput({
        name: "",
        email: "ravi@example.com",
        password: "password123",
      });
      expect(missingName.valid).toBe(false);
      expect(missingName.field).toBe("name");

      const invalidEmail = validateAgentInput({
        name: "Ravi",
        email: "bad-email",
        password: "password123",
      });
      expect(invalidEmail.valid).toBe(false);
      expect(invalidEmail.field).toBe("email");

      const shortPassword = validateAgentInput({
        name: "Ravi",
        email: "ravi@example.com",
        password: "short",
      });
      expect(shortPassword.valid).toBe(false);
      expect(shortPassword.field).toBe("password");
    });
  });

  describe("validateCustomerInput", () => {
    it("passes for a valid customer payload", () => {
      const result = validateCustomerInput({
        name: "Alice",
        dob: "2000-01-01",
        mobile: "9876543210",
        email: "alice@example.com",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        nomineeName: "Bob",
        nomineeRelation: "Brother",
      });

      expect(result).toEqual({ valid: true });
    });

    it("fails for missing required customer fields", () => {
      const missingName = validateCustomerInput({
        dob: "2000-01-01",
        mobile: "9876543210",
        email: "alice@example.com",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        nomineeName: "Bob",
        nomineeRelation: "Brother",
      });
      expect(missingName.valid).toBe(false);
      expect(missingName.field).toBe("name");

      const invalidEmail = validateCustomerInput({
        name: "Alice",
        dob: "2000-01-01",
        mobile: "9876543210",
        email: "bad-email",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        nomineeName: "Bob",
        nomineeRelation: "Brother",
      });
      expect(invalidEmail.valid).toBe(false);
      expect(invalidEmail.field).toBe("email");
    });
  });
});
