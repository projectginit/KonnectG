import crypto from "crypto";

export const generateEmailVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    rawToken,
    hashedToken,
    expiresAt,
  };
};

export const hashEmailVerificationToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
