/**
 * Resolves static asset paths (like images in /public) ensuring correct base URL
 * resolution in GitHub Pages, local development, and subpath deployments.
 */
export function resolveAssetUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Strip leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // import.meta.env.BASE_URL is injected by Vite (defaults to './' or '/' or subpath)
  const baseUrl = import.meta.env.BASE_URL || './';
  
  if (baseUrl === './' || baseUrl === '') {
    return `./${cleanPath}`;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
}
