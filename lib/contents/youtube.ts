export function getYoutubeThumbnail(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.slice(1).split("/")[0];
      return id?.length === 11 ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    const v = u.searchParams.get("v");
    if (v && v.length === 11) {
      return `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
    }
    const embed = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    return embed ? `https://img.youtube.com/vi/${embed[1]}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

export function isYoutubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    return u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
  } catch {
    return false;
  }
}

export function isHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}
