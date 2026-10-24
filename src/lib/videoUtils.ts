/**
 * Utility to parse and format YouTube URLs into valid responsive iframe embed URLs
 */
export function getYouTubeEmbedUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    // 1. Check for standard YouTube watch or short links
    // e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
    // e.g. https://youtu.be/dQw4w9WgXcQ
    // e.g. https://youtube.com/embed/dQw4w9WgXcQ
    // e.g. https://youtube.com/shorts/dQw4w9WgXcQ
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    // 2. If it's already an embed URL without parameters
    if (trimmed.includes("youtube.com/embed/")) {
      return trimmed.includes("?") ? `${trimmed}&autoplay=1` : `${trimmed}?autoplay=1`;
    }
  } catch (e) {
    // Fallback safely to original url
  }

  return trimmed;
}

/**
 * Extract YouTube 11-char Video ID
 */
export function getYouTubeVideoId(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;
  const match = url.trim().match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match && match[1] ? match[1] : null;
}
