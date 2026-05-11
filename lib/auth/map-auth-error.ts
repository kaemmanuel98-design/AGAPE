/**
 * Normalize Supabase Auth API errors for next-intl keys under login.authErrors.*
 */
export type AuthErrorKey =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "user_already_exists"
  | "weak_password"
  | "rate_limit"
  | "signup_disabled"
  | "generic";

export function mapSupabaseAuthError(message: string): AuthErrorKey {
  const m = message.toLowerCase();

  if (
    m.includes("already been registered") ||
    m.includes("already registered") ||
    m.includes("user already registered") ||
    m.includes("duplicate")
  ) {
    return "user_already_exists";
  }
  if (
    m.includes("email not confirmed") ||
    m.includes("not confirmed") ||
    m.includes("confirmation")
  ) {
    return "email_not_confirmed";
  }
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid credentials") ||
    m.includes("wrong password") ||
    (m.includes("invalid") && m.includes("password"))
  ) {
    return "invalid_credentials";
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("least") || m.includes("short"))) {
    return "weak_password";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "rate_limit";
  }
  if (m.includes("signup") && m.includes("disable")) {
    return "signup_disabled";
  }

  return "generic";
}
