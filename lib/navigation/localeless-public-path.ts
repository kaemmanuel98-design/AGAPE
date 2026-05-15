/**
 * Routes servies sans préfixe `[locale]` dans l’URL (voir `middleware.ts`).
 * Ne pas leur ajouter `/fr|en|nl` lors des redirections (ex. callback OAuth).
 */
export function isLocalelessPublicPath(pathname: string): boolean {
  return /^\/(academy|bible-strong|calendar|planning|rejoindre|profile)(\/|$)/.test(pathname);
}
