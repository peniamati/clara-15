/**
 * Utilities for Google Drive links and direct image streaming
 */

export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1vD5IpM96K5bMCfJbVpTmEMS9WwE1Y4sH';

/**
 * Extracts a Google Drive File ID from various link formats:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 */
export function extractDriveFileId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already just the raw alphanumeric ID
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
    return trimmed;
  }

  // Matches /d/{ID}
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1];

  // Matches id={ID}
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  return null;
}

/**
 * Converts a Google Drive link or ID to a high-quality direct image URL
 * using Google's official fast content delivery network (lh3.googleusercontent.com).
 */
export function getDriveDirectImageUrl(urlOrId: string, size = 1600): string {
  const fileId = extractDriveFileId(urlOrId);
  if (!fileId) return urlOrId;
  return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
}
