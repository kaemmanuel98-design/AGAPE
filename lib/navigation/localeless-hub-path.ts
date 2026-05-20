/** Piliers hub servis sans préfixe `/fr|en|nl` dans l’URL. */
export function isLocalelessHubPath(pathname: string): boolean {
  return /^\/(academy|bible-strong|calendar|planning)(\/|$)/.test(pathname);
}
