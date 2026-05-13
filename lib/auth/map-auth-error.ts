/**
 * Normalize Supabase Auth API errors for next-intl keys under login.authErrors.*
 */
export type AuthErrorKey =
  | "invalid_phone"
  | "invalid_otp"
  | "rate_limit"
  | "sms_disabled"
  | "generic";

export function mapSupabaseAuthError(message: string): AuthErrorKey {
  const m = message.toLowerCase();

  if (
    (m.includes("phone") && m.includes("invalid")) ||
    m.includes("invalid phone number") ||
    m.includes("sms phone number")
  ) {
    return "invalid_phone";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "rate_limit";
  }
  if (
    m.includes("otp") ||
    m.includes("token") ||
    m.includes("verification code") ||
    m.includes("one-time password")
  ) {
    return "invalid_otp";
  }
  if (
    (m.includes("sms") && m.includes("disable")) ||
    (m.includes("phone") && m.includes("disable"))
  ) {
    return "sms_disabled";
  }

  return "generic";
}
